"use client";

import { motion } from "framer-motion";
import { Text } from "@/components/ui/typography";
import { useBookingStore } from "@/stores/booking";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  formatPrice,
  formatTime,
} from "@/components/booking/pricing/calculator";
import { PriceEstimate } from "./PriceEstimate";
import { cn } from "@/lib/utils";
import { Clock, DollarSign } from "lucide-react";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  show: { opacity: 1, x: 0 },
};

export function ShadingDetails() {
  const { tattooDetails, updateTattooDetails, pricingConfig } =
    useBookingStore();
  const { goToNextStep, goToPreviousStep } = useBookingNavigation();

  const handleShadingChange = (shading: string) => {
    updateTattooDetails({
      shading: shading as typeof tattooDetails.shading,
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Text className="text-muted-foreground">
          Escolha o estilo de sombreamento:
        </Text>

        <RadioGroup
          value={tattooDetails.shading}
          onValueChange={handleShadingChange}
          className="grid grid-cols-1 gap-3"
        >
          <motion.div
            className="contents"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {pricingConfig.shadingOptions.map((option) => {
              const isSelected = tattooDetails.shading === option.id;
              return (
                <motion.div
                  key={option.id}
                  className="relative"
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.id}
                    className={`flex flex-col sm:flex-row rounded-lg border-2 bg-card/80 backdrop-blur-sm min-h-[100px] sm:h-[100px] cursor-pointer transition-all duration-300
                      ${isSelected
                        ? "border-primary glow-magenta bg-primary/[0.03]"
                        : "border-border hover:border-primary/40 hover:shadow-lg hover:shadow-black/5"
                      }
                      peer-data-[state=checked]:border-primary peer-data-[state=checked]:glow-magenta
                      [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:glow-magenta`}
                  >
                    {/* Left side: Shading visualization */}
                    <div
                      className={cn(
                        "w-full sm:w-[100px] h-[60px] sm:h-full rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none bg-muted/50 flex items-center justify-center",
                        option.id === "none" && "opacity-30",
                        option.id === "light" && "opacity-50",
                        option.id === "medium" && "opacity-70",
                        option.id === "realism" && "opacity-90"
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full transition-all duration-300",
                          option.id === "none" &&
                            "border-2 border-dashed border-muted-foreground",
                          option.id === "light" &&
                            "bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/60",
                          option.id === "medium" &&
                            "bg-gradient-to-br from-muted-foreground/50 to-muted-foreground/80",
                          option.id === "realism" &&
                            "bg-gradient-to-br from-foreground/60 to-foreground shadow-lg"
                        )}
                      />
                    </div>

                    {/* Right side: Content */}
                    <div className="flex flex-1 p-3">
                      <div className="flex flex-col justify-between flex-1">
                        <div>
                          <span className="font-mono uppercase tracking-wider font-bold block text-foreground">
                            {option.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2 sm:mt-0">
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
            })}
          </motion.div>
        </RadioGroup>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={goToPreviousStep}>
          Voltar
        </Button>
        <div className="flex items-center gap-4">
          <PriceEstimate />
          <Button onClick={goToNextStep} disabled={!tattooDetails.shading}>
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}
