"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography";
import { useBookingStore } from "@/stores/booking";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { useState } from "react";
import {
  formatPrice,
  formatTime,
} from "@/components/booking/pricing/calculator";
import { PriceEstimate } from "./PriceEstimate";
import { Clock, DollarSign, ChevronRight } from "lucide-react";

function BodyPartIcon({ locationId, isSelected }: { locationId: string; isSelected: boolean }) {
  const color = isSelected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))";
  const opacity = isSelected ? 1 : 0.5;
  const cls = "w-10 h-10";

  const icons: Record<string, React.ReactNode> = {
    // Braço - ícone de bíceps flexionado
    arm: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <path d="M12 36 L12 28 Q12 18 20 14 L24 12 Q28 10 30 14 L32 20 Q34 26 30 28 L26 30" />
          <path d="M26 30 L26 36" />
          <ellipse cx="28" cy="18" rx="4" ry="6" />
        </g>
      </svg>
    ),
    // Perna - ícone de perna
    leg: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <path d="M18 6 Q16 6 16 10 L14 24 L14 36 Q14 40 18 42 L24 44" />
          <path d="M30 6 Q32 6 32 10 L30 24 L30 36 Q30 40 26 42" />
          <circle cx="22" cy="24" r="3" />
        </g>
      </svg>
    ),
    // Mão - ícone de mão aberta
    hand: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <path d="M24 44 Q16 44 14 38 L12 30 L10 26 Q9 24 11 23 L13 24 L14 28" />
          <path d="M14 28 L14 12 Q14 10 16 10 Q18 10 18 12 L18 24" />
          <path d="M18 24 L18 8 Q18 6 20 6 Q22 6 22 8 L22 24" />
          <path d="M22 24 L22 8 Q22 6 24 6 Q26 6 26 8 L26 24" />
          <path d="M26 24 L26 10 Q26 8 28 8 Q30 8 30 10 L30 26" />
          <path d="M30 26 L32 22 Q33 20 35 21 Q36 22 35 24 L30 34 Q28 38 24 44" />
        </g>
      </svg>
    ),
    // Dedos - ícone de dedos
    fingers: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <path d="M16 38 L16 14 Q16 10 18 10 Q20 10 20 14 L20 38" />
          <path d="M22 38 L22 8 Q22 4 24 4 Q26 4 26 8 L26 38" />
          <path d="M28 38 L28 12 Q28 8 30 8 Q32 8 32 12 L32 38" />
          <line x1="16" y1="38" x2="32" y2="38" />
        </g>
      </svg>
    ),
    // Pé - ícone de pé/pegada
    foot: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <path d="M16 8 Q14 8 14 12 L12 28 Q10 36 14 40 Q18 44 26 44 Q34 44 36 38 Q38 32 34 28 L32 26" />
          <ellipse cx="18" cy="10" rx="3" ry="4" />
          <ellipse cx="24" cy="8" rx="2.5" ry="3.5" />
          <ellipse cx="29" cy="10" rx="2.5" ry="3.5" />
          <ellipse cx="33" cy="14" rx="2" ry="3" />
        </g>
      </svg>
    ),
    // Joelho - ícone de joelho dobrado
    knee: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <path d="M20 4 L18 16 Q16 24 20 26" />
          <path d="M28 4 L30 16 Q32 24 28 26" />
          <circle cx="24" cy="24" r="6" strokeDasharray="2 2" />
          <path d="M20 26 Q18 30 20 44" />
          <path d="M28 26 Q30 30 28 44" />
        </g>
      </svg>
    ),
    // Cotovelo - ícone de braço dobrado
    elbow: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <path d="M10 8 L10 20 Q10 28 18 28 L30 28 Q38 28 38 36 L38 44" />
          <circle cx="24" cy="28" r="5" strokeDasharray="2 2" />
        </g>
      </svg>
    ),
    // Pescoço - ícone de pescoço com cabeça
    neck: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <ellipse cx="24" cy="14" rx="10" ry="12" />
          <path d="M18 24 L16 36 Q16 44 24 44 Q32 44 32 36 L30 24" />
          <rect x="18" y="22" width="12" height="10" rx="2" fill={isSelected ? color : "none"} fillOpacity="0.15" />
        </g>
      </svg>
    ),
    // Nuca - ícone de cabeça vista de trás
    nape: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <ellipse cx="24" cy="16" rx="10" ry="12" />
          <path d="M18 26 L16 38" />
          <path d="M30 26 L32 38" />
          <rect x="19" y="24" width="10" height="8" rx="2" fill={isSelected ? color : "none"} fillOpacity="0.15" />
          <line x1="20" y1="10" x2="28" y2="10" />
          <line x1="19" y1="14" x2="29" y2="14" />
        </g>
      </svg>
    ),
    // Rosto - ícone de rosto
    face: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <ellipse cx="24" cy="22" rx="12" ry="14" />
          <circle cx="18" cy="20" r="1.5" fill={color} />
          <circle cx="30" cy="20" r="1.5" fill={color} />
          <path d="M20 28 Q24 32 28 28" />
          <line x1="24" y1="22" x2="24" y2="26" />
        </g>
      </svg>
    ),
    // Cabeça - ícone de cabeça (perfil)
    head: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <path d="M14 24 Q14 8 24 8 Q34 8 34 24 Q34 30 30 34 L30 40 L18 40 L18 34 Q14 30 14 24Z" />
          <line x1="18" y1="40" x2="30" y2="40" />
          <path d="M18 16 Q24 12 30 16" />
        </g>
      </svg>
    ),
    // Costas - ícone de costas (torso visto de trás)
    back: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <path d="M14 8 L14 38 Q14 42 18 42 L30 42 Q34 42 34 38 L34 8" />
          <line x1="24" y1="8" x2="24" y2="42" strokeDasharray="3 3" />
          <path d="M16 14 Q24 18 32 14" />
          <path d="M16 26 Q24 30 32 26" />
        </g>
      </svg>
    ),
    // Peito - ícone de peito (torso frontal)
    chest: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <path d="M12 8 Q12 4 16 4 L32 4 Q36 4 36 8 L36 32 Q36 38 30 40 L24 42 L18 40 Q12 38 12 32 Z" />
          <path d="M18 14 Q20 18 24 16 Q28 18 30 14" />
          <line x1="24" y1="20" x2="24" y2="34" strokeDasharray="2 2" />
        </g>
      </svg>
    ),
    // Costela - ícone de costelas
    ribs: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <line x1="24" y1="6" x2="24" y2="42" />
          <path d="M24 10 Q32 12 36 16" />
          <path d="M24 10 Q16 12 12 16" />
          <path d="M24 18 Q32 20 36 24" />
          <path d="M24 18 Q16 20 12 24" />
          <path d="M24 26 Q32 28 34 30" />
          <path d="M24 26 Q16 28 14 30" />
          <path d="M24 34 Q30 35 32 36" />
          <path d="M24 34 Q18 35 16 36" />
        </g>
      </svg>
    ),
    // Esterno - ícone de esterno (centro do peito)
    sternum: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <path d="M14 8 L34 8 Q36 8 36 12 L36 28 Q36 36 24 42 Q12 36 12 28 L12 12 Q12 8 14 8Z" />
          <line x1="24" y1="8" x2="24" y2="36" />
          <rect x="20" y="12" width="8" height="20" rx="2" fill={isSelected ? color : "none"} fillOpacity="0.15" />
        </g>
      </svg>
    ),
    // Partes Íntimas - ícone discreto (escudo/privacidade)
    intimate: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <path d="M12 10 L24 6 L36 10 L36 24 Q36 38 24 44 Q12 38 12 24 Z" />
          <path d="M20 22 L24 26 L32 18" />
        </g>
      </svg>
    ),
    // Pulso (wrist) - caso exista
    wrist: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <path d="M18 6 L18 20 Q18 24 16 28 L14 34 Q12 38 16 40 L24 44 L32 40 Q36 38 34 34 L32 28 Q30 24 30 20 L30 6" />
          <line x1="16" y1="18" x2="32" y2="18" strokeDasharray="2 2" />
          <circle cx="24" cy="18" r="4" fill={isSelected ? color : "none"} fillOpacity="0.15" />
        </g>
      </svg>
    ),
    // Tornozelo (ankle)
    ankle: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <path d="M18 4 L16 28 Q14 34 16 38 L22 42 L32 42 Q36 42 36 38 L36 34" />
          <path d="M30 4 L32 28" />
          <circle cx="24" cy="30" r="5" strokeDasharray="2 2" />
        </g>
      </svg>
    ),
    // Barriga/Estômago (stomach)
    stomach: (
      <svg viewBox="0 0 48 48" className={cls} xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity={opacity}>
          <path d="M14 6 L34 6 L36 20 Q36 36 24 42 Q12 36 12 20 Z" />
          <ellipse cx="24" cy="22" rx="6" ry="4" />
          <circle cx="24" cy="22" r="1.5" fill={color} />
        </g>
      </svg>
    ),
  };

  // Para sub-locations, usar o ícone do parent
  const parentMap: Record<string, string> = {
    "arm-forearm": "arm",
    "arm-biceps": "arm",
    "arm-triceps": "arm",
    "leg-thigh": "leg",
    "leg-shin": "leg",
    "leg-calf": "leg",
    "back-cervical": "back",
    "back-thoracic": "back",
    "back-lumbar": "back",
  };

  const iconKey = parentMap[locationId] || locationId;
  return <>{icons[iconKey] || icons.arm}</>;
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
  const [expandedParent, setExpandedParent] = useState<string | null>(null);

  // Separate parent locations (no parentId) from sub-locations
  const parentLocations = pricingConfig.bodyLocations.filter((l) => !l.parentId);
  const hasChildren = (parentId: string) =>
    pricingConfig.bodyLocations.some((l) => l.parentId === parentId);
  const getChildren = (parentId: string) =>
    pricingConfig.bodyLocations.filter((l) => l.parentId === parentId);

  const handleLocationChange = (location: string) => {
    const loc = pricingConfig.bodyLocations.find((l) => l.id === location);
    // If parent with children, expand sub-choices instead of selecting
    if (loc && !loc.parentId && hasChildren(location)) {
      setExpandedParent(expandedParent === location ? null : location);
      return;
    }
    updateTattooDetails({ bodyLocation: location });
  };

  const handleSubLocationChange = (location: string) => {
    updateTattooDetails({ bodyLocation: location });
  };

  // Check if current selection is a child of a parent
  const selectedIsChildOf = (parentId: string) =>
    getChildren(parentId).some((c) => c.id === tattooDetails.bodyLocation);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Text className="text-muted-foreground">
          Onde você quer fazer a tatuagem?
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
            {[...parentLocations]
              .sort((a, b) => a.additionalPrice - b.additionalPrice)
              .map((location) => {
                const locationHasChildren = hasChildren(location.id);
                const isSelected = tattooDetails.bodyLocation === location.id || selectedIsChildOf(location.id);
                const isExpanded = expandedParent === location.id;
                return (
                  <motion.div
                    key={location.id}
                    className="relative col-span-1"
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {locationHasChildren ? (
                      <button
                        type="button"
                        onClick={() => handleLocationChange(location.id)}
                        className={`relative h-full w-full flex flex-row rounded-lg border-2 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300 text-left
                          ${isSelected
                            ? "border-primary glow-magenta bg-primary/[0.03]"
                            : "border-border hover:border-primary/40 hover:shadow-lg hover:shadow-black/5"
                          }`}
                      >
                        <div className="w-[60px] sm:w-[80px] h-full rounded-l-lg bg-muted/30 flex items-center justify-center p-2">
                          <BodyPartIcon locationId={location.id} isSelected={isSelected} />
                        </div>
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
                            <div className="flex items-center gap-1 text-xs text-primary mt-1">
                              <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                              <span>Escolher região</span>
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
                      </button>
                    ) : (
                      <>
                        <RadioGroupItem value={location.id} id={location.id} className="peer sr-only" />
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
                          <div className="w-[60px] sm:w-[80px] h-full rounded-l-lg bg-muted/30 flex items-center justify-center p-2">
                            <BodyPartIcon locationId={location.id} isSelected={isSelected} />
                          </div>
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
                                    <span>+{formatTime(location.additionalTime)}</span>
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
                      </>
                    )}

                    {/* Sub-locations */}
                    {locationHasChildren && isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 ml-4 space-y-2"
                      >
                        {getChildren(location.id).map((child) => {
                          const childSelected = tattooDetails.bodyLocation === child.id;
                          return (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => handleSubLocationChange(child.id)}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 bg-card/80 text-left transition-all duration-200
                                ${childSelected
                                  ? "border-primary bg-primary/[0.03]"
                                  : "border-border/50 hover:border-primary/40"
                                }`}
                            >
                              <div className="w-8 h-8 rounded bg-muted/30 flex items-center justify-center">
                                <BodyPartIcon locationId={location.id} isSelected={childSelected} />
                              </div>
                              <div className="flex-1">
                                <span className="font-mono uppercase tracking-wider font-bold text-xs text-foreground">
                                  {child.name}
                                </span>
                                <span className="text-xs text-muted-foreground block">
                                  {child.description}
                                </span>
                              </div>
                              {childSelected && (
                                <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
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
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}
