"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography";
import { useBookingStore } from "@/stores/booking";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import {
  formatPrice,
  formatTime,
} from "@/components/booking/pricing/calculator";
import { PriceEstimate } from "./PriceEstimate";
import { Clock, DollarSign } from "lucide-react";
import { BODY_LOCATIONS } from "@/lib/constants";

function BodyLocationSvg({ locationId, isSelected }: { locationId: string; isSelected: boolean }) {
  const fillColor = isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))";
  const opacity = isSelected ? "0.8" : "0.3";
  const highlightColor = isSelected ? "hsl(var(--primary))" : "transparent";

  return (
    <svg viewBox="0 0 60 120" className="w-10 h-16" xmlns="http://www.w3.org/2000/svg">
      <g stroke={fillColor} strokeWidth="1" fill="none" opacity={opacity}>
        <ellipse cx="30" cy="12" rx="8" ry="10" />
        <line x1="26" y1="22" x2="26" y2="28" />
        <line x1="34" y1="22" x2="34" y2="28" />
        <path d="M18 28 L42 28 L40 65 L20 65 Z" />
        <path d="M18 28 L8 50 L6 68" />
        <path d="M42 28 L52 50 L54 68" />
        <path d="M20 65 L16 95 L14 115" />
        <path d="M40 65 L44 95 L46 115" />
      </g>
      <g fill={highlightColor} opacity="0.4">
        {locationId === "arm" && (
          <>
            <path d="M14 28 L18 28 L8 55 L4 55 Z" />
            <path d="M42 28 L46 28 L56 55 L52 55 Z" />
          </>
        )}
        {locationId === "leg" && (
          <>
            <path d="M18 65 L24 65 L20 100 L14 100 Z" />
            <path d="M36 65 L42 65 L46 100 L40 100 Z" />
          </>
        )}
        {locationId === "hand" && (
          <>
            <circle cx="5" cy="70" r="5" />
            <circle cx="55" cy="70" r="5" />
          </>
        )}
        {locationId === "foot" && (
          <>
            <ellipse cx="14" cy="116" rx="5" ry="3" />
            <ellipse cx="46" cy="116" rx="5" ry="3" />
          </>
        )}
        {locationId === "knee" && (
          <>
            <circle cx="17" cy="85" r="5" />
            <circle cx="43" cy="85" r="5" />
          </>
        )}
        {locationId === "elbow" && (
          <>
            <circle cx="8" cy="48" r="5" />
            <circle cx="52" cy="48" r="5" />
          </>
        )}
        {locationId === "neck" && (
          <rect x="24" y="20" width="12" height="10" rx="2" />
        )}
        {locationId === "nape" && (
          <rect x="24" y="18" width="12" height="10" rx="2" />
        )}
        {locationId === "face" && (
          <ellipse cx="30" cy="10" rx="9" ry="11" />
        )}
        {locationId === "head" && (
          <ellipse cx="30" cy="8" rx="9" ry="8" />
        )}
        {locationId === "back" && (
          <rect x="20" y="30" width="20" height="25" rx="2" />
        )}
        {locationId === "chest" && (
          <rect x="20" y="28" width="20" height="18" rx="2" />
        )}
        {locationId === "ribs" && (
          <>
            <rect x="17" y="40" width="8" height="20" rx="2" />
            <rect x="35" y="40" width="8" height="20" rx="2" />
          </>
        )}
        {locationId === "sternum" && (
          <rect x="26" y="32" width="8" height="15" rx="2" />
        )}
        {locationId === "intimate" && (
          <rect x="22" y="58" width="16" height="10" rx="3" />
        )}
      </g>
    </svg>
  );
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function BodyLocation() {
  const { tattooDetails, updateTattooDetails, pricingConfig } =
    useBookingStore();
  const { goToNextStep, goToPreviousStep } = useBookingNavigation();

  const handleLocationChange = (location: string) => {
    updateTattooDetails({
      bodyLocation: location,
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Text className="text-muted-foreground">
          Onde voce quer fazer a tatuagem?
        </Text>

        <RadioGroup
          value={tattooDetails.bodyLocation}
          onValueChange={handleLocationChange}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <motion.div
            className="contents"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {[...pricingConfig.bodyLocations]
              .sort((a, b) => a.additionalPrice - b.additionalPrice)
              .map((location) => {
                const isSelected = tattooDetails.bodyLocation === location.id;
                return (
                  <motion.div
                    key={location.id}
                    className="relative"
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <RadioGroupItem
                      value={location.id}
                      id={location.id}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={location.id}
                      className={`relative h-full flex flex-row rounded-lg border-2 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300
                        ${isSelected
                          ? "border-primary glow-magenta bg-primary/[0.03]"
                          : "border-border hover:border-primary/40 hover:shadow-lg hover:shadow-black/5"
                        }
                        peer-data-[state=checked]:border-primary peer-data-[state=checked]:glow-magenta
                        [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:glow-magenta`}
                    >
                      {/* Left side - Body SVG */}
                      <div className="w-[60px] sm:w-[80px] h-full rounded-l-lg bg-muted/30 flex items-center justify-center p-2">
                        <BodyLocationSvg
                          locationId={location.id}
                          isSelected={isSelected}
                        />
                      </div>

                      {/* Right side content */}
                      <div className="flex flex-1 min-w-0 p-3">
                        <div className="flex flex-col justify-between flex-1">
                          <div>
                            <span className="font-mono uppercase tracking-wider font-bold text-sm block text-foreground">
                              {location.name}
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {location.description}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                            {location.additionalTime > 0 && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  +{formatTime(location.additionalTime)}
                                </span>
                              </div>
                            )}
                            {location.additionalPrice > 0 && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-primary" />
                                <span className="font-semibold gradient-text">
                                  +{formatPrice(location.additionalPrice)}
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
          <Button onClick={goToNextStep} disabled={!tattooDetails.bodyLocation}>
            Proximo
          </Button>
        </div>
      </div>
    </div>
  );
}
