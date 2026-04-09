"use client";

import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArtistPresentation } from "./ArtistPresentation";
import { PersonalInfo } from "./PersonalInfo";
import { AgeTerms } from "./AgeTerms";
import { CompanionAndLocation } from "./CompanionAndLocation";
import { TattooType } from "./TattooType";
import { TattooSize } from "./TattooSize";
import { ShadingDetails } from "./ShadingDetails";
import { ColorSelection } from "./ColorSelection";
import { BodyLocation } from "./BodyLocation";
import { References } from "./References";
import { FlashPromotion } from "./FlashPromotion";
import { Scheduling } from "./Scheduling";
import { Payment } from "./Payment";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { useBookingStore } from "@/stores/booking";
import { BookingStep, STEPS } from "@/stores/bookingStateMachine";
import { formatPrice, formatTime } from "@/components/booking/pricing/calculator";
import {
  User,
  FileText,
  Shield,
  Users,
  Pen,
  Ruler,
  Layers,
  Palette,
  MapPin,
  Image,
  Sparkles,
  Calendar,
  CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BookingFlowProps {
  artistId: string;
}

const stepIcons: Record<BookingStep, LucideIcon> = {
  artist: User,
  personal: FileText,
  ageTerms: Shield,
  companion: Users,
  type: Pen,
  size: Ruler,
  shading: Layers,
  color: Palette,
  location: MapPin,
  references: Image,
  promotion: Sparkles,
  scheduling: Calendar,
  payment: CreditCard,
};

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
    scale: 0.98,
  }),
};

export function BookingFlow({ artistId }: BookingFlowProps) {
  const { currentStep } = useBookingNavigation();
  const { tattooDetails, priceCalculation, pricingConfig } = useBookingStore();
  const currentStepName = STEPS[currentStep];
  const isClosure = tattooDetails.type === "closure";
  const skippedSteps = isClosure ? 2 : 0;
  const totalSteps = STEPS.length - skippedSteps;
  const prevStepRef = useRef(currentStep);

  const direction = currentStep >= prevStepRef.current ? 1 : -1;
  if (currentStep !== prevStepRef.current) {
    prevStepRef.current = currentStep;
  }

  const countSkippedBefore = (step: number): number => {
    if (!isClosure) return 0;
    let count = 0;
    if (step > STEPS.indexOf("size")) count++;
    if (step > STEPS.indexOf("shading")) count++;
    return count;
  };
  const displayStep = currentStep - countSkippedBefore(currentStep);

  const getStepTitle = () => {
    const titles: Record<BookingStep, string> = {
      artist: "Apresentação do Tatuador",
      personal: "Informações Pessoais",
      ageTerms: "Termos de Maioridade",
      companion: "Acompanhante e Local",
      type: "Tipo de Tatuagem",
      size: "Tamanho da Tatuagem",
      shading: "Sombras e Detalhes",
      color: "Escolha de Cores",
      location: "Local do Corpo",
      references: "Referências",
      promotion: "Promoção Relâmpago",
      scheduling: "Agendamento",
      payment: "Agendar Minha Sessão",
    };
    return titles[currentStepName as BookingStep] || "Agendamento";
  };

  const renderStep = () => {
    const steps: Record<BookingStep, JSX.Element> = {
      artist: <ArtistPresentation artistId={artistId} />,
      personal: <PersonalInfo />,
      ageTerms: <AgeTerms />,
      companion: <CompanionAndLocation />,
      type: <TattooType />,
      size: <TattooSize />,
      shading: <ShadingDetails />,
      color: <ColorSelection />,
      location: <BodyLocation />,
      references: <References />,
      promotion: <FlashPromotion />,
      scheduling: <Scheduling />,
      payment: <Payment />,
    };
    return steps[currentStepName as BookingStep] || null;
  };

  const progressPercent = ((displayStep + 1) / totalSteps) * 100;
  const CurrentIcon: LucideIcon =
    (currentStepName ? stepIcons[currentStepName as BookingStep] : Pen) || Pen;

  // Build visible steps for the mini stepper
  const visibleSteps = STEPS.filter((step) => {
    if (!isClosure) return true;
    return step !== "size" && step !== "shading";
  });

  return (
    <div className="container max-w-2xl mx-auto px-4">
      {/* Step Progress (sticky so the live price stays visible while scrolling) */}
      <div className="mb-8 sticky top-0 z-30 -mx-4 px-4 pt-4 pb-3 bg-background/85 backdrop-blur-md border-b border-border/40">
        {/* Mini step dots */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {visibleSteps.map((step, i) => {
            const isActive = i === displayStep;
            const isCompleted = i < displayStep;
            return (
              <motion.div
                key={step}
                className="relative"
                initial={false}
                animate={{
                  scale: isActive ? 1 : 0.8,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-primary w-6 shadow-lg shadow-primary/40"
                      : isCompleted
                        ? "bg-primary/60"
                        : "bg-muted"
                  }`}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-1 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 progress-gradient rounded-full"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>

        {/* Step info + live price */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <CurrentIcon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              Passo {displayStep + 1} de {totalSteps}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {priceCalculation && priceCalculation.totalPrice > 0 && (
              <motion.div
                key={priceCalculation.totalPrice}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/30"
              >
                <span className="font-mono font-bold text-sm gradient-text leading-none">
                  {formatPrice(priceCalculation.totalPrice)}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground leading-none">
                  {formatTime(priceCalculation.totalTime)}
                </span>
              </motion.div>
            )}
            <span className="text-xs font-mono gradient-text font-semibold">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>

        {/* Deposit hint once a price exists */}
        {priceCalculation && priceCalculation.totalPrice > 0 && pricingConfig?.fixedDeposit ? (
          <div className="mt-2 flex items-center justify-end">
            <span className="text-[10px] font-mono text-muted-foreground">
              sinal para reservar:&nbsp;
              <span className="text-primary font-semibold">
                {formatPrice(pricingConfig.fixedDeposit)}
              </span>
            </span>
          </div>
        ) : null}
      </div>

      {/* Step Title */}
      <motion.h2
        key={`title-${currentStepName}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="font-mono uppercase tracking-wider text-2xl font-bold gradient-text mb-8"
      >
        {getStepTitle()}
      </motion.h2>

      {/* Step Content with Animation */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStepName}
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            scale: { duration: 0.2 },
          }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
