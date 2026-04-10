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
import { redirectToGoogleAuth, isGoogleAuthConfigured } from "@/lib/google-auth";
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

export function Scheduling() {
  const { scheduling, updateScheduling, artistInfo, priceCalculation } = useBookingStore();
  const { goToNextStep, goToPreviousStep } = useBookingNavigation();
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(false);
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
      setSlotsError(false);

      // Demo mode - generate mock slots
      if (artistInfo!.id === "demo") {
        const demoSlots: AvailableSlot[] = [];
        for (let h = 9; h < 18; h++) {
          demoSlots.push({
            id: `demo-${h}`,
            startTime: `${h.toString().padStart(2, "0")}:00`,
            endTime: `${(h + 1).toString().padStart(2, "0")}:00`,
          });
        }
        setAvailableSlots(demoSlots);
        setLoadingSlots(false);
        return;
      }

      try {
        const { data } = await api.get(
          `/schedule/${artistInfo!.id}/available-slots?date=${selectedDate}`
        );
        if (data && Array.isArray(data) && data.length > 0) {
          setAvailableSlots(data);
        } else {
          setAvailableSlots([]);
        }
      } catch (error) {
        setSlotsError(true);
        setAvailableSlots([]);
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
            {priceCalculation?.totalTime
              ? `O tempo estimado da sessão é de aproximadamente ${
                  (priceCalculation.totalTime / 60) % 1 === 0
                    ? `${priceCalculation.totalTime / 60}h`
                    : `${(priceCalculation.totalTime / 60).toFixed(1)}h`
                }. Caso ultrapasse, o tatuador combinará o ajuste com você.`
              : "Selecione a data e horário para sua sessão. O tatuador combinará os detalhes com você."}
          </Text>

          <div className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/20 rounded-md px-3 py-2">
            <span className="shrink-0 mt-0.5">⏱️</span>
            <span>
              Se a tatuagem demorar mais que o previsto, o tatuador ajusta isso diretamente com você.
            </span>
          </div>
        </div>

        {/* Google Calendar Integration */}
        {isGoogleAuthConfigured() && (
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
              Conecte sua conta Google para adicionar o agendamento automaticamente ao seu calendário.
            </Text>
          </div>
        )}

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
                    ) : availableSlots.length === 0 ? (
                      <div className="p-6 text-center border border-dashed border-border rounded-sm">
                        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <Text className="text-sm text-muted-foreground">
                          {slotsError
                            ? "Não foi possível carregar os horários. Tente outra data."
                            : "Nenhum horário disponível nesta data. Escolha outra data."}
                        </Text>
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
