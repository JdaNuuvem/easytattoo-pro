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
import { Input } from "@/components/ui/input";
import { AlertTriangle, Info, UserPlus, ShieldAlert } from "lucide-react";

const companionSchema = z.object({
  hasCompanion: z.enum(["alone", "with-companion"]),
  companionCount: z.number().min(1).max(5).optional(),
  companionPurpose: z.enum(["just-watching", "will-tattoo"]).optional(),
  studioLocation: z.string().default(""),
});

type CompanionFormData = z.infer<typeof companionSchema>;

export function CompanionAndLocation() {
  const { companion, updateCompanion, artistInfo } = useBookingStore();
  const { goToNextStep, goToPreviousStep } = useBookingNavigation();

  const artistAcceptsCompanion = artistInfo?.acceptsCompanion ?? true;
  const maxCompanions = artistInfo?.maxCompanions ?? 5;

  const { handleSubmit, setValue, watch } = useForm<CompanionFormData>({
    resolver: zodResolver(companionSchema),
    defaultValues: {
      hasCompanion: companion.hasCompanion ? "with-companion" : "alone",
      companionCount: companion.companionCount || 1,
      companionPurpose: companion.companionPurpose || undefined,
      studioLocation: companion.studioLocation,
    },
  });

  const onSubmit = (data: CompanionFormData) => {
    updateCompanion({
      hasCompanion: data.hasCompanion === "with-companion",
      companionCount: data.hasCompanion === "with-companion" ? (data.companionCount || 1) : 0,
      companionPurpose: data.companionPurpose || undefined,
      studioLocation: data.studioLocation,
    });
    goToNextStep();
  };

  const selectedHasCompanion = watch("hasCompanion");
  const selectedCompanionPurpose = watch("companionPurpose");
  const selectedCompanionCount = watch("companionCount");
  const selectedLocation = watch("studioLocation");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <Text className="text-foreground">
          A marcação é só pra você ou deseja levar um acompanhante?
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
              <span className="text-sm font-medium">Só pra mim</span>
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
          {/* Artist does NOT accept companion */}
          {!artistAcceptsCompanion && (
            <div className="border border-red-500/30 rounded-sm p-4 bg-red-500/5 space-y-2">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <Text className="text-sm font-medium text-foreground">
                    Este tatuador não aceita acompanhantes
                  </Text>
                  <Text className="text-sm text-muted-foreground leading-relaxed">
                    O tatuador configurou que prefere trabalhar sem acompanhantes no estúdio.
                    Caso queira prosseguir, entre em contato diretamente com o tatuador para
                    negociar uma exceção.
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* Artist acceptance notice */}
          {artistAcceptsCompanion && (
            <div className="border border-yellow-500/30 rounded-sm p-4 bg-yellow-500/5 space-y-2">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <Text className="text-sm font-medium text-foreground">
                    Aviso sobre acompanhante
                  </Text>
                  <Text className="text-sm text-muted-foreground leading-relaxed">
                    A presença de acompanhante está sujeita à aprovação do tatuador.
                    Alguns profissionais preferem trabalhar sem acompanhantes no estúdio
                    para manter a concentração e a qualidade do trabalho. O tatuador irá
                    confirmar se aceita acompanhante ao revisar seu agendamento.
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* Companion count */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <Text className="text-sm font-medium text-foreground">
                Quantos acompanhantes?
              </Text>
            </div>
            <Input
              type="number"
              min={1}
              max={maxCompanions}
              value={selectedCompanionCount || 1}
              onChange={(e) => setValue("companionCount", Number(e.target.value))}
              className="w-24 bg-card border-border"
            />
            <Text className="text-xs text-muted-foreground mt-1">
              Máximo permitido pelo tatuador: {maxCompanions}
            </Text>
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

      {artistInfo?.studios && artistInfo.studios.length > 0 && (
        <div className="space-y-4">
          <Label className="text-foreground">
            Em qual estúdio quer fazer a marcação?
          </Label>
          <RadioGroup
            value={selectedLocation}
            onValueChange={(value) => setValue("studioLocation", value)}
            className="grid gap-3"
          >
            {artistInfo.studios.map((studio) => (
              <div key={studio.id} className="relative">
                <RadioGroupItem
                  value={studio.id}
                  id={`studio-${studio.id}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`studio-${studio.id}`}
                  className="flex items-center gap-3 p-4 rounded-sm border-2 border-border bg-card hover:bg-accent/10 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                >
                  <span className="text-sm">
                    {studio.name}{studio.address ? ` - ${studio.address}` : ""}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

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
            (selectedHasCompanion === "with-companion" && !selectedCompanionPurpose) ||
            (selectedHasCompanion === "with-companion" && !artistAcceptsCompanion)
          }
        >
          Continuar
        </Button>
      </div>
    </form>
  );
}
