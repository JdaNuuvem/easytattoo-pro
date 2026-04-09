"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { useBookingStore } from "@/stores/booking";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { useMemo, useState } from "react";
import {
  formatPrice,
  formatTime,
} from "@/components/booking/pricing/calculator";
import { PriceEstimate } from "./PriceEstimate";
import { Clock, DollarSign, ChevronRight } from "lucide-react";
import { BodyModel3D, BODY_PARTS } from "./BodyModel3D";

function getPainColor(additionalPrice: number): string {
  if (additionalPrice === 0) return "hsl(180, 70%, 50%)";
  if (additionalPrice <= 50) return "hsl(60, 80%, 55%)";
  if (additionalPrice <= 100) return "hsl(30, 90%, 55%)";
  if (additionalPrice <= 150) return "hsl(10, 85%, 55%)";
  return "hsl(0, 80%, 45%)";
}

export function BodyLocation() {
  const { tattooDetails, updateTattooDetails, pricingConfig } =
    useBookingStore();
  const { goToNextStep, goToPreviousStep } = useBookingNavigation();
  const [expandedParent, setExpandedParent] = useState<string | null>(null);

  const hasChildren = (parentId: string) =>
    pricingConfig.bodyLocations.some((l) => l.parentId === parentId);
  const getChildren = (parentId: string) =>
    pricingConfig.bodyLocations.filter((l) => l.parentId === parentId);

  // Map each 3D body part to a configured pricing location (when one exists with the same id)
  const partColors = useMemo(() => {
    const colors: Record<string, string> = {};
    for (const part of BODY_PARTS) {
      const loc = pricingConfig.bodyLocations.find((l) => l.id === part.id);
      colors[part.id] = getPainColor(loc?.additionalPrice ?? 0);
    }
    return colors;
  }, [pricingConfig.bodyLocations]);

  const isSelected = (partId: string) => {
    if (tattooDetails.bodyLocation === partId) return true;
    return pricingConfig.bodyLocations.some(
      (l) => l.parentId === partId && l.id === tattooDetails.bodyLocation
    );
  };

  const handlePartSelect = (partId: string) => {
    if (hasChildren(partId)) {
      setExpandedParent(expandedParent === partId ? null : partId);
      return;
    }
    updateTattooDetails({ bodyLocation: partId });
    setExpandedParent(null);
  };

  const handleSubLocationChange = (location: string) => {
    updateTattooDetails({ bodyLocation: location });
    setExpandedParent(null);
  };

  const selectedLocation = pricingConfig.bodyLocations.find(
    (l) => l.id === tattooDetails.bodyLocation
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Text className="text-muted-foreground">
          Gire o modelo 3D e toque na parte do corpo onde deseja a tatuagem
        </Text>

        <div className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/20 rounded-md px-3 py-2">
          <span className="shrink-0 mt-0.5">&#9888;&#65039;</span>
          <span>
            O valor pode variar pela dificuldade da area do corpo escolhida. Se
            quiser mudar o local no dia, o valor pode diminuir ou aumentar.
          </span>
        </div>
      </div>

      {/* 3D Body Model */}
      <BodyModel3D
        partColors={partColors}
        selectedId={tattooDetails.bodyLocation ?? null}
        isSelected={isSelected}
        onSelect={(partId) => handlePartSelect(partId)}
      />

      {/* Pain/Price Legend */}
      <div className="flex items-center justify-center gap-1">
        <span className="text-[10px] text-muted-foreground font-mono mr-1">
          Custo:
        </span>
        {[0, 50, 100, 150, 200].map((price) => (
          <div key={price} className="flex flex-col items-center gap-0.5">
            <div
              className="w-5 h-3 rounded-sm"
              style={{ backgroundColor: getPainColor(price), opacity: 0.7 }}
            />
            <span className="text-[8px] text-muted-foreground font-mono">
              {price === 0 ? "0" : `+${price}`}
            </span>
          </div>
        ))}
      </div>

      {/* Selected zone details */}
      <AnimatePresence mode="wait">
        {selectedLocation && (
          <motion.div
            key="selected-info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-primary/5 border border-primary/20 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono font-bold text-sm text-foreground uppercase tracking-wider">
                  {selectedLocation.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedLocation.description}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                {selectedLocation.additionalTime > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>+{formatTime(selectedLocation.additionalTime)}</span>
                  </div>
                )}
                {selectedLocation.additionalPrice > 0 && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-primary" />
                    <span className="font-semibold gradient-text">
                      +{formatPrice(selectedLocation.additionalPrice)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-locations panel */}
      <AnimatePresence mode="wait">
        {expandedParent && hasChildren(expandedParent) && (
          <motion.div
            key={`sub-${expandedParent}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card/80 border border-border rounded-lg p-3 space-y-2">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-primary" />
                Escolha a regiao:
              </p>
              {getChildren(expandedParent).map((child) => {
                const childSelected =
                  tattooDetails.bodyLocation === child.id;
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => handleSubLocationChange(child.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 bg-card/80 text-left transition-all duration-200 ${
                      childSelected
                        ? "border-primary bg-primary/[0.03] glow-magenta"
                        : "border-border/50 hover:border-primary/40"
                    }`}
                  >
                    <div>
                      <span className="font-mono uppercase tracking-wider font-bold text-xs text-foreground">
                        {child.name}
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        {child.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs shrink-0">
                      {child.additionalTime > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>
                            +{formatTime(child.additionalTime)}
                          </span>
                        </div>
                      )}
                      {child.additionalPrice > 0 && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-primary" />
                          <span className="font-semibold gradient-text">
                            +{formatPrice(child.additionalPrice)}
                          </span>
                        </div>
                      )}
                      {childSelected && (
                        <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={goToPreviousStep}>
          Voltar
        </Button>
        <div className="flex items-center gap-4">
          <PriceEstimate />
          <Button
            onClick={goToNextStep}
            disabled={!tattooDetails.bodyLocation}
          >
            Proximo
          </Button>
        </div>
      </div>
    </div>
  );
}
