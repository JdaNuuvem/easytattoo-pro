"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useBookingStore } from "@/stores/booking";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { api } from "@/lib/api";
import { Clock } from "lucide-react";

const timeSelectionSchema = z.object({
  date: z.date(),
  time: z.string().min(1, "Selecione um horario"),
});

type TimeSelectionFormData = z.infer<typeof timeSelectionSchema>;

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const mockSlots: TimeSlot[] = [
  { id: "1", startTime: "09:00:00", endTime: "10:00:00", isAvailable: true },
  { id: "2", startTime: "10:30:00", endTime: "11:30:00", isAvailable: true },
  { id: "3", startTime: "13:00:00", endTime: "14:00:00", isAvailable: true },
  { id: "4", startTime: "14:30:00", endTime: "15:30:00", isAvailable: true },
  { id: "5", startTime: "16:00:00", endTime: "17:00:00", isAvailable: true },
];

export function TimeSelection() {
  const [loading, setLoading] = useState(false);
  const { scheduling, updateScheduling, artistInfo } = useBookingStore();
  const { goToNextStep, goToPreviousStep } = useBookingNavigation();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>(mockSlots);

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TimeSelectionFormData>({
    resolver: zodResolver(timeSelectionSchema),
    defaultValues: {
      date: scheduling.date ? new Date(scheduling.date) : new Date(),
      time: scheduling.time,
    },
  });

  const selectedDate = watch("date");
  const selectedTime = watch("time");

  useEffect(() => {
    if (!selectedDate || !artistInfo?.id) return;

    async function fetchSlots() {
      setLoading(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const { data } = await api.get(
          `/schedule/${artistInfo!.id}/available-slots?date=${dateStr}`
        );
        if (data && Array.isArray(data) && data.length > 0) {
          setAvailableSlots(data);
        } else {
          setAvailableSlots(mockSlots);
        }
      } catch (error) {
        console.error("Failed to fetch time slots:", error);
        setAvailableSlots(mockSlots);
      } finally {
        setLoading(false);
      }
    }

    fetchSlots();
  }, [selectedDate, artistInfo?.id]);

  const onSubmit = (data: TimeSelectionFormData) => {
    updateScheduling({
      date: format(data.date, "yyyy-MM-dd"),
      time: data.time,
    });
    goToNextStep();
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Text className="text-foreground">
        Selecione o melhor dia e horario para sua sessao.
      </Text>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-foreground">
              Data
            </Label>
            <Input
              id="date"
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={(e) => setValue("date", new Date(e.target.value))}
              min={format(new Date(), "yyyy-MM-dd")}
              className="bg-card border-border focus-visible:ring-primary"
            />
            {errors.date && (
              <Text className="text-sm text-destructive">
                {errors.date.message}
              </Text>
            )}
            <Text className="text-sm text-muted-foreground">
              Selecione uma data a partir de hoje
            </Text>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Label className="text-foreground">Horarios Disponiveis</Label>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-12 rounded-sm bg-muted animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4 text-primary" />
                Horarios Disponiveis
              </Label>
              <RadioGroup
                value={selectedTime}
                onValueChange={(value) => setValue("time", value)}
                className="grid grid-cols-2 gap-3"
              >
                {availableSlots
                  .filter((slot) => slot.isAvailable)
                  .map((slot) => (
                    <div key={slot.id} className="relative">
                      <RadioGroupItem
                        value={slot.startTime}
                        id={`time-${slot.id}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`time-${slot.id}`}
                        className="flex items-center justify-center p-3 rounded-sm border-2 border-border bg-card hover:bg-accent/10 peer-data-[state=checked]:border-primary peer-data-[state=checked]:glow-magenta [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:glow-magenta transition-all cursor-pointer"
                      >
                        <span className="font-mono font-medium text-foreground">
                          {format(
                            new Date(`2000-01-01T${slot.startTime}`),
                            "HH:mm"
                          )}
                        </span>
                      </Label>
                    </div>
                  ))}
              </RadioGroup>
              {errors.time && (
                <Text className="text-sm text-destructive">
                  {errors.time.message}
                </Text>
              )}
              <Text className="text-sm text-muted-foreground">
                Clique em um horario para seleciona-lo
              </Text>
            </div>
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
    </div>
  );
}
