"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/typography";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useBookingStore } from "@/stores/booking";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { api } from "@/lib/api";
import { redirectToGoogleAuth } from "@/lib/google-auth";
import { GoogleIcon } from "@/components/ui/google-icon";
import { Calendar, Clock, ExternalLink } from "lucide-react";

const schedulingSchema = z.object({
  date: z.string().min(1, "Selecione uma data"),
  time: z.string().min(1, "Selecione um horario"),
});

type SchedulingFormData = z.infer<typeof schedulingSchema>;

interface AvailableSlot {
  id: string;
  startTime: string;
  endTime: string;
}

const mockAvailableSlots: AvailableSlot[] = [
  { id: "1", startTime: "09:00", endTime: "12:00" },
  { id: "2", startTime: "14:00", endTime: "17:00" },
  { id: "3", startTime: "10:00", endTime: "13:00" },
  { id: "4", startTime: "15:00", endTime: "18:00" },
];

export function Scheduling() {
  const { scheduling, updateScheduling, artistInfo } = useBookingStore();
  const { goToNextStep, goToPreviousStep } = useBookingNavigation();
  const [availableSlots, setAvailableSlots] =
    useState<AvailableSlot[]>(mockAvailableSlots);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [addingToCalendar, setAddingToCalendar] = useState(false);

  const form = useForm<SchedulingFormData>({
    resolver: zodResolver(schedulingSchema),
    defaultValues: {
      date: scheduling.date,
      time: scheduling.time,
    },
  });

  const selectedDate = form.watch("date");
  const selectedTime = form.watch("time");

  useEffect(() => {
    if (!selectedDate || !artistInfo?.id) return;

    async function fetchSlots() {
      setLoadingSlots(true);
      try {
        const { data } = await api.get(
          `/schedule/${artistInfo!.id}/available-slots?date=${selectedDate}`
        );
        if (data && Array.isArray(data) && data.length > 0) {
          setAvailableSlots(data);
        } else {
          setAvailableSlots(mockAvailableSlots);
        }
      } catch (error) {
        console.error("Failed to fetch available slots:", error);
        setAvailableSlots(mockAvailableSlots);
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [selectedDate, artistInfo?.id]);

  const handleGoogleLogin = () => {
    redirectToGoogleAuth("booking-calendar", [
      "https://www.googleapis.com/auth/calendar.events",
    ]);
  };

  useEffect(() => {
    const token = localStorage.getItem("google_access_token");
    if (token) {
      setGoogleConnected(true);
    }
  }, []);

  const addToGoogleCalendar = async () => {
    if (!selectedDate || !selectedTime) return;

    const googleToken = localStorage.getItem("google_access_token");
    if (!googleToken) {
      handleGoogleLogin();
      return;
    }

    setAddingToCalendar(true);
    try {
      const slot = availableSlots.find((s) => s.startTime === selectedTime);
      const endTime = slot?.endTime || "18:00";

      const event = {
        summary: `Tatuagem - ${artistInfo?.name || "Estudio"}`,
        description: `Sessao de tatuagem agendada pelo EasyTattoo Pro`,
        start: {
          dateTime: `${selectedDate}T${selectedTime}:00`,
          timeZone: "America/Sao_Paulo",
        },
        end: {
          dateTime: `${selectedDate}T${endTime}:00`,
          timeZone: "America/Sao_Paulo",
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 60 },
            { method: "popup", minutes: 1440 },
          ],
        },
      };

      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${googleToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (response.ok) {
        setGoogleConnected(true);
      } else {
        localStorage.removeItem("google_access_token");
        setGoogleConnected(false);
      }
    } catch (error) {
      console.error("Failed to add event to Google Calendar:", error);
    } finally {
      setAddingToCalendar(false);
    }
  };

  const onSubmit = (data: SchedulingFormData) => {
    updateScheduling(data);
    goToNextStep();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h3 className="font-mono uppercase tracking-wider font-semibold text-lg text-foreground">
            Escolha a data e horario
          </h3>
          <Text className="text-muted-foreground">
            O tempo de duracao da sessao sera de aproximadamente 3 horas. Caso
            ultrapasse, o tatuador combinara o ajuste com voce.
          </Text>
        </div>

        {/* Google Calendar Integration */}
        <div className="border border-border rounded-sm p-4 bg-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GoogleIcon />
              <Text className="text-sm font-medium text-foreground">
                Google Agenda
              </Text>
            </div>
            {googleConnected ? (
              <span className="text-xs text-emerald-600 font-medium">Conectado</span>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={handleGoogleLogin}
              >
                Conectar
              </Button>
            )}
          </div>
          <Text className="text-xs text-muted-foreground">
            Conecte sua conta Google para adicionar o agendamento automaticamente ao seu calendario.
          </Text>
        </div>

        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Data
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    min={format(new Date(), "yyyy-MM-dd")}
                    {...field}
                    className="bg-card border-border focus-visible:ring-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedDate && (
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Horario
                  </FormLabel>
                  <FormControl>
                    {loadingSlots ? (
                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-14 rounded-sm bg-muted animate-pulse"
                          />
                        ))}
                      </div>
                    ) : (
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-3"
                      >
                        {availableSlots.map((slot) => (
                          <div key={slot.id} className="relative">
                            <RadioGroupItem
                              value={slot.startTime}
                              id={`slot-${slot.id}`}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={`slot-${slot.id}`}
                              className="flex flex-col items-center justify-center p-3 rounded-sm border-2 border-border bg-card hover:bg-accent/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:glow-magenta [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:glow-magenta transition-all cursor-pointer"
                            >
                              <span className="font-mono font-semibold text-foreground">
                                {format(
                                  new Date(`2000-01-01T${slot.startTime}`),
                                  "HH:mm"
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ate{" "}
                                {format(
                                  new Date(`2000-01-01T${slot.endTime}`),
                                  "HH:mm"
                                )}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Add to Google Calendar button */}
          {selectedDate && selectedTime && googleConnected && (
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={addToGoogleCalendar}
              disabled={addingToCalendar}
            >
              <ExternalLink className="w-4 h-4" />
              {addingToCalendar
                ? "Adicionando ao Google Agenda..."
                : "Adicionar ao Google Agenda"}
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={goToPreviousStep}>
            Voltar
          </Button>
          <Button type="submit" className="flex-1">
            Continuar
          </Button>
        </div>
      </form>
    </Form>
  );
}
