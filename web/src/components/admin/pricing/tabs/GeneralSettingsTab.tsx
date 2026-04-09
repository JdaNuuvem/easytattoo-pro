"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../schema";
import { Clock } from "lucide-react";
import api from "@/lib/api";

interface GeneralSettingsTabProps {
  form: UseFormReturn<FormValues>;
}

interface WorkSchedule {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

function calculateMaxDailyMinutes(schedules: WorkSchedule[]): number {
  const available = schedules.filter((s) => s.isAvailable);
  if (available.length === 0) return 0;

  let maxMinutes = 0;
  for (const schedule of available) {
    const [startH, startM] = schedule.startTime.split(":").map(Number);
    const [endH, endM] = schedule.endTime.split(":").map(Number);
    const minutes = (endH * 60 + (endM || 0)) - (startH * 60 + (startM || 0));
    if (minutes > maxMinutes) {
      maxMinutes = minutes;
    }
  }
  return maxMinutes;
}

function formatMinutesToHours(minutes: number): string {
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours}h`;
  return `${hours.toFixed(1)}h`;
}

export function GeneralSettingsTab({ form }: GeneralSettingsTabProps) {
  const [maxDailyFromSchedule, setMaxDailyFromSchedule] = useState<number | null>(null);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const response = await api.get("/schedule/me");
        const schedules: WorkSchedule[] = response.data.workSchedules || [];
        const maxMinutes = calculateMaxDailyMinutes(schedules);
        if (maxMinutes > 0) {
          setMaxDailyFromSchedule(maxMinutes);
          form.setValue("maxDailyTime", maxMinutes);
        }
      } catch {
        // Keep manual value if schedule can't be fetched
      }
    }
    fetchSchedule();
  }, [form]);

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm">Configuracoes Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fixedDeposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Sinal (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      min={0}
                      className="bg-background border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxDailyTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo Maximo Diario</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        {...field}
                        value={field.value}
                        readOnly
                        disabled
                        className="bg-muted border-border pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        h
                      </span>
                    </div>
                  </FormControl>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {maxDailyFromSchedule
                        ? `${formatMinutesToHours(maxDailyFromSchedule)} - calculado pelo seu horario de trabalho`
                        : "Calculado pelo seu horario de trabalho"}
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm">Preco Base para Tatuagens Pequenas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="baseSmallTattooPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preco Minimo (ate 5x5 cm)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        R$
                      </span>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="pl-9 bg-background border-border"
                        placeholder="150"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baseSmallTattooTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo Minimo (horas)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="pr-12 bg-background border-border"
                        placeholder="0.5"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        h
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
