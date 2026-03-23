"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography";
import { useBookingStore } from "@/stores/booking";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { AlertTriangle, Info, UserPlus } from "lucide-react";

const companionSchema = z.object({
  hasCompanion: z.enum(["alone", "with-companion"]),
  companionPurpose: z.enum(["just-watching", "will-tattoo"]).optional(),
  studioLocation: z.string().min(1, "Selecione um estudio"),
});

type CompanionFormData = z.infer<typeof companionSchema>;

export function CompanionAndLocation() {
  const { companion, updateCompanion } = useBookingStore();
  const { goToNextStep, goToPreviousStep } = useBookingNavigation();

  const { handleSubmit, setValue, watch } = useForm<CompanionFormData>({
    resolver: zodResolver(companionSchema),
    defaultValues: {
      hasCompanion: companion.hasCompanion ? "with-companion" : "alone",
      companionPurpose: companion.companionPurpose || undefined,
      studioLocation: companion.studioLocation,
    },
  });

  const onSubmit = (data: CompanionFormData) => {
    updateCompanion({
      hasCompanion: data.hasCompanion === "with-companion",
      companionPurpose: data.companionPurpose || undefined,
      studioLocation: data.studioLocation,
    });
    goToNextStep();
  };

  const selectedHasCompanion = watch("hasCompanion");
  const selectedCompanionPurpose = watch("companionPurpose");
  const selectedLocation = watch("studioLocation");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <Text className="text-foreground">
          A marcacao e so pra voce ou deseja levar um acompanhante?
        </Text>
        <RadioGroup
          value={selectedHasCompanion}
          onValueChange={(value) => {
            setValue("hasCompanion", value as "alone" | "with-companion");
            if (value === "alone") {
              setValue("companionPurpose", undefined);
            }
          }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="relative">
            <RadioGroupItem value="alone" id="alone" className="peer sr-only" />
            <Label
              htmlFor="alone"
              className="flex items-center justify-center gap-2 p-4 rounded-sm border-2 border-border bg-card hover:bg-accent/10 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
            >
              <span className="text-sm font-medium">So pra mim</span>
            </Label>
          </div>
          <div className="relative">
            <RadioGroupItem
              value="with-companion"
              id="with-companion"
              className="peer sr-only"
            />
            <Label
              htmlFor="with-companion"
              className="flex items-center justify-center gap-2 p-4 rounded-sm border-2 border-border bg-card hover:bg-accent/10 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
            >
              <UserPlus className="w-4 h-4" />
              <span className="text-sm font-medium">
                Vou levar acompanhante
              </span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Companion Notice & Questions */}
      {selectedHasCompanion === "with-companion" && (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
          {/* Artist acceptance notice */}
          <div className="border border-yellow-500/30 rounded-sm p-4 bg-yellow-500/5 space-y-2">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <Text className="text-sm font-medium text-foreground">
                  Aviso sobre acompanhante
                </Text>
                <Text className="text-sm text-muted-foreground leading-relaxed">
                  A presenca de acompanhante esta sujeita a aprovacao do tatuador.
                  Alguns profissionais preferem trabalhar sem acompanhantes no estudio
                  para manter a concentracao e a qualidade do trabalho. O tatuador ira
                  confirmar se aceita acompanhante ao revisar seu agendamento.
                </Text>
              </div>
            </div>
          </div>

          {/* Companion purpose question */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <Text className="text-sm font-medium text-foreground">
                O acompanhante vai tatuar ou apenas acompanhar o trabalho?
              </Text>
            </div>
            <RadioGroup
              value={selectedCompanionPurpose}
              onValueChange={(value) =>
                setValue("companionPurpose", value as "just-watching" | "will-tattoo")
              }
              className="grid grid-cols-1 gap-3"
            >
              <div className="relative">
                <RadioGroupItem
                  value="just-watching"
                  id="just-watching"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="just-watching"
                  className="flex items-center gap-3 p-4 rounded-sm border-2 border-border bg-card hover:bg-accent/10 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                >
                  <span className="text-sm">
                    Apenas acompanhar o trabalho
                  </span>
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem
                  value="will-tattoo"
                  id="will-tattoo"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="will-tattoo"
                  className="flex items-center gap-3 p-4 rounded-sm border-2 border-border bg-card hover:bg-accent/10 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                >
                  <span className="text-sm">
                    O acompanhante tambem vai tatuar
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Label className="text-foreground">
          Em qual estudio quer fazer a marcacao?
        </Label>
        <RadioGroup
          value={selectedLocation}
          onValueChange={(value) => setValue("studioLocation", value)}
          className="grid gap-3"
        >
          <div className="relative">
            <RadioGroupItem
              value="studio-1"
              id="studio-1"
              className="peer sr-only"
            />
            <Label
              htmlFor="studio-1"
              className="flex items-center gap-3 p-4 rounded-sm border-2 border-border bg-card hover:bg-accent/10 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
            >
              <span className="text-sm">
                Estudio Principal - Rua Example, 123
              </span>
            </Label>
          </div>
          <div className="relative">
            <RadioGroupItem
              value="studio-2"
              id="studio-2"
              className="peer sr-only"
            />
            <Label
              htmlFor="studio-2"
              className="flex items-center gap-3 p-4 rounded-sm border-2 border-border bg-card hover:bg-accent/10 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
            >
              <span className="text-sm">Estudio 2 - Av Sample, 456</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={goToPreviousStep}
        >
          Voltar
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={
            selectedHasCompanion === "with-companion" && !selectedCompanionPurpose
          }
        >
          Continuar
        </Button>
      </div>
    </form>
  );
}
