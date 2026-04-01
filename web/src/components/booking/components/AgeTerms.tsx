"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export function AgeTerms() {
  const { goToNextStep, goToPreviousStep } = useBookingNavigation();
  const [accepted, setAccepted] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const canContinue = accepted && consentAccepted;

  const handleContinue = () => {
    if (canContinue) {
      goToNextStep();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-10 h-10 text-primary" />
        </div>
      </div>

      <div className="space-y-4 text-center">
        <h3 className="text-xl font-mono uppercase tracking-wider text-foreground">
          Termos de Maioridade
        </h3>
        <Text className="text-muted-foreground">
          Para realizar uma tatuagem, é necessário que você tenha pelo menos 18 anos de idade.
        </Text>
      </div>

      <div className="border border-border rounded-sm p-6 bg-card space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
          <div className="space-y-2">
            <Text className="text-sm text-foreground font-medium">
              Declaração de Maioridade
            </Text>
            <Text className="text-sm text-muted-foreground leading-relaxed">
              Ao prosseguir com o agendamento, declaro que tenho 18 (dezoito) anos completos ou mais,
              estando ciente de que a realização de tatuagem em menores de idade é proibida por lei
              (Lei nº 9.828/97 e Estatuto da Criança e do Adolescente - ECA).
            </Text>
            <Text className="text-sm text-muted-foreground leading-relaxed">
              Declaro também que estou ciente de que a apresentação de documento de identidade com
              foto poderá ser solicitada no momento do atendimento para confirmação da idade.
            </Text>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 border border-border rounded-sm bg-card">
        <Checkbox
          id="age-terms"
          checked={accepted}
          onCheckedChange={(checked) => setAccepted(checked === true)}
          className="mt-0.5"
        />
        <Label
          htmlFor="age-terms"
          className="text-sm text-foreground cursor-pointer leading-relaxed"
        >
          Declaro que tenho 18 anos ou mais e concordo com os termos acima.
        </Label>
      </div>

      <div className="flex items-start gap-3 p-4 border border-border rounded-sm bg-card">
        <Checkbox
          id="consent-terms"
          checked={consentAccepted}
          onCheckedChange={(checked) => setConsentAccepted(checked === true)}
          className="mt-0.5"
        />
        <Label
          htmlFor="consent-terms"
          className="text-sm text-foreground cursor-pointer leading-relaxed"
        >
          Li e aceito os termos de consentimento para a realização da tatuagem.
        </Label>
      </div>

      {!canContinue && (
        <Text className="text-xs text-muted-foreground text-center">
          Você precisa aceitar todos os termos para continuar.
        </Text>
      )}

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={goToPreviousStep}>
          Voltar
        </Button>
        <Button
          className="flex-1"
          onClick={handleContinue}
          disabled={!canContinue}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
