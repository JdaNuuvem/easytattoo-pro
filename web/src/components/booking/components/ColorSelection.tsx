"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography";
import { useBookingStore } from "@/stores/booking";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { PriceEstimate } from "./PriceEstimate";
import {
  formatPrice,
  formatTime,
} from "@/components/booking/pricing/calculator";
import { cn } from "@/lib/utils";
import { Clock, DollarSign } from "lucide-react";
import { ColorType } from "@/components/booking/pricing/types";

const getColorDisplay = (type: ColorType): React.ReactNode => {
  const displays: Record<ColorType, React.ReactNode> = {
    black: (
      <div className="w-8 h-8 rounded-full bg-white border border-border" />
    ),
    oneColor: (
      <div className="flex gap-1">
        <div className="w-6 h-6 rounded-full bg-white" />
        <div className="w-6 h-6 rounded-full bg-red-500" />
      </div>
    ),
    twoColors: (
      <div className="flex gap-1">
        <div className="w-5 h-5 rounded-full bg-white" />
        <div className="w-5 h-5 rounded-full bg-red-500" />
        <div className="w-5 h-5 rounded-full bg-blue-500" />
      </div>
    ),
    threeColors: (
      <div className="flex gap-1">
        <div className="w-4 h-4 rounded-full bg-white" />
        <div className="w-4 h-4 rounded-full bg-red-500" />
        <div className="w-4 h-4 rounded-full bg-blue-500" />
        <div className="w-4 h-4 rounded-full bg-green-500" />
      </div>
    ),
  };
  return displays[type];
};

const closureColorOptions: Array<{
  id: "black" | "threeColors";
  name: string;
  description: string;
  display: React.ReactNode;
}> = [
  {
    id: "black",
    name: "Full Preto",
    description: "Fechamento completo em preto",
    display: (
      <div className="w-12 h-12 rounded-full bg-foreground border border-border" />
    ),
  },
  {
    id: "threeColors",
    name: "Colorido",
    description: "Fechamento com cores variadas",
    display: (
      <div className="flex gap-1">
        <div className="w-6 h-6 rounded-full bg-red-500" />
        <div className="w-6 h-6 rounded-full bg-blue-500" />
        <div className="w-6 h-6 rounded-full bg-green-500" />
        <div className="w-6 h-6 rounded-full bg-yellow-500" />
      </div>
    ),
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export function ColorSelection() {
  const { tattooDetails, updateTattooDetails, pricingConfig } =
    useBookingStore();
  const { goToNextStep, goToPreviousStep } = useBookingNavigation();

  const isClosure = tattooDetails.type === "closure";

  const handleColorChange = (colors: string) => {
    updateTattooDetails({
      colors: colors as typeof tattooDetails.colors,
    });
  };

  const renderCard = (
    id: string,
    isSelected: boolean,
    children: React.ReactNode
  ) => (
    <motion.div
      key={id}
      className="relative"
      variants={itemVariants}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <RadioGroupItem value={id} id={id} className="peer sr-only" />
      <Label
        htmlFor={id}
        className={`relative h-full flex rounded-lg border-2 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300
          ${isSelected
            ? "border-primary glow-magenta bg-primary/[0.03]"
            : "border-border hover:border-primary/40 hover:shadow-lg hover:shadow-black/5"
          }
          peer-data-[state=checked]:border-primary peer-data-[state=checked]:glow-magenta
          [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:glow-magenta`}
      >
        {children}
        {isSelected && (
          <motion.div
            className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </Label>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Text className="text-muted-foreground">
          {isClosure
            ? "Escolha o estilo do seu fechamento:"
            : "Escolha as cores da sua tatuagem:"}
        </Text>

        {isClosure ? (
          <RadioGroup
            value={tattooDetails.colors}
            onValueChange={handleColorChange}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <motion.div
              className="contents"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {closureColorOptions.map((option) =>
                renderCard(
                  `closure-${option.id}`,
                  tattooDetails.colors === option.id,
                  <div className="flex flex-col items-center justify-center gap-4 p-6 min-h-[140px] w-full">
                    {option.display}
                    <div className="text-center">
                      <span className="font-mono uppercase tracking-wider font-bold text-lg block text-foreground">
                        {option.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </div>
                )
              )}
            </motion.div>
          </RadioGroup>
        ) : (
          <RadioGroup
            value={tattooDetails.colors}
            onValueChange={handleColorChange}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <motion.div
              className="contents"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {[...pricingConfig.colorOptions]
                .sort((a, b) => a.additionalPrice - b.additionalPrice)
                .map((option) =>
                  renderCard(
                    option.id,
                    tattooDetails.colors === option.id,
                    <>
                      {/* Left side - Color display */}
                      <div
                        className={cn(
                          "w-[80px] sm:w-[100px] h-full rounded-l-lg bg-muted/50 flex items-center justify-center"
                        )}
                      >
                        {getColorDisplay(option.id)}
                      </div>

                      {/* Right side content */}
                      <div className="flex flex-1 min-w-0">
                        <div className="flex flex-1 min-w-0 p-3">
                          <div className="flex flex-col justify-between flex-1">
                            <div>
                              <span className="font-mono uppercase tracking-wider font-bold text-sm sm:text-base block text-foreground">
                                {option.name}
                              </span>
                              <span className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">
                                {option.description}
                              </span>
                            </div>

                            <div className="hidden sm:flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                              {option.additionalTime > 0 && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>
                                    +{formatTime(option.additionalTime)}
                                  </span>
                                </div>
                              )}
                              {option.additionalPrice > 0 && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-3.5 h-3.5 text-primary" />
                                  <span className="font-semibold gradient-text">
                                    +{formatPrice(option.additionalPrice)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Mobile: Right side info */}
                        <div className="flex sm:hidden flex-col justify-center gap-1 px-3 border-l border-border/50 min-w-[80px]">
                          {option.additionalPrice > 0 && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="w-3 h-3" />
                              <span className="text-xs">
                                +{formatPrice(option.additionalPrice)}
                              </span>
                            </div>
                          )}
                          {option.additionalTime > 0 && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">
                                +{formatTime(option.additionalTime)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )
                )}
            </motion.div>
          </RadioGroup>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={goToPreviousStep}>
          Voltar
        </Button>
        <div className="flex items-center gap-4">
          <PriceEstimate />
          <Button onClick={goToNextStep} disabled={!tattooDetails.colors}>
            Proximo
          </Button>
        </div>
      </div>
    </div>
  );
}
