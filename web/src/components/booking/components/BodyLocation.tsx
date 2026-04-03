"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { useBookingStore } from "@/stores/booking";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { useState } from "react";
import {
  formatPrice,
  formatTime,
} from "@/components/booking/pricing/calculator";
import { PriceEstimate } from "./PriceEstimate";
import { Clock, DollarSign, RotateCcw, ChevronRight } from "lucide-react";

type ViewSide = "front" | "back";

interface BodyZone {
  id: string;
  path: string;
  label: string;
  labelPos: { x: number; y: number };
}

// Viewbox: 0 0 330 440. Body centered at x=165, wider proportions.
const FRONT_ZONES: BodyZone[] = [
  // Head top
  {
    id: "head",
    path: "M 147,5 Q 147,0 165,0 Q 183,0 183,5 L 183,15 Q 183,10 165,12 Q 147,10 147,15 Z",
    label: "Cabeca",
    labelPos: { x: 165, y: 7 },
  },
  // Face
  {
    id: "face",
    path: "M 147,15 Q 143,15 143,28 L 143,42 Q 143,56 165,56 Q 187,56 187,42 L 187,28 Q 187,15 183,15 Z",
    label: "Rosto",
    labelPos: { x: 165, y: 36 },
  },
  // Neck
  {
    id: "neck",
    path: "M 153,56 L 153,70 L 177,70 L 177,56 Q 165,62 153,56 Z",
    label: "Pescoco",
    labelPos: { x: 165, y: 63 },
  },
  // Chest (wide torso)
  {
    id: "chest",
    path: "M 110,76 L 153,70 L 177,70 L 220,76 L 220,120 Q 165,126 110,120 Z",
    label: "Peito",
    labelPos: { x: 165, y: 98 },
  },
  // Sternum (center strip over chest)
  {
    id: "sternum",
    path: "M 155,72 L 175,72 L 175,118 Q 165,122 155,118 Z",
    label: "Esterno",
    labelPos: { x: 165, y: 96 },
  },
  // Left ribs
  {
    id: "ribs",
    path: "M 108,120 L 110,76 L 100,84 L 92,120 L 96,148 L 110,156 L 125,148 Z",
    label: "Costela E.",
    labelPos: { x: 108, y: 118 },
  },
  // Right ribs
  {
    id: "ribs",
    path: "M 222,120 L 220,76 L 230,84 L 238,120 L 234,148 L 220,156 L 205,148 Z",
    label: "Costela D.",
    labelPos: { x: 222, y: 118 },
  },
  // Stomach / Abdomen
  {
    id: "stomach",
    path: "M 125,120 L 205,120 L 205,156 Q 165,164 125,156 Z",
    label: "Barriga",
    labelPos: { x: 165, y: 140 },
  },
  // Intimate / Hip
  {
    id: "intimate",
    path: "M 120,156 L 210,156 L 200,185 Q 165,195 130,185 Z",
    label: "Intima",
    labelPos: { x: 165, y: 172 },
  },
  // Left upper arm (biceps/triceps)
  {
    id: "arm",
    path: "M 110,76 L 92,80 L 78,88 L 68,130 L 80,130 L 88,96 L 100,84 L 108,120 Z",
    label: "Braco E.",
    labelPos: { x: 88, y: 104 },
  },
  // Left elbow
  {
    id: "elbow",
    path: "M 66,126 Q 63,134 67,142 L 82,142 Q 84,134 82,126 Z",
    label: "Cotovelo",
    labelPos: { x: 74, y: 134 },
  },
  // Left forearm
  {
    id: "arm-forearm",
    path: "M 65,144 L 80,144 L 72,195 L 66,200 L 56,195 Z",
    label: "Antebraco E.",
    labelPos: { x: 68, y: 170 },
  },
  // Left wrist + hand
  {
    id: "hand",
    path: "M 54,197 L 74,197 L 76,218 L 70,225 L 64,225 L 58,222 L 52,218 Z",
    label: "Mao E.",
    labelPos: { x: 64, y: 210 },
  },
  // Left fingers
  {
    id: "fingers",
    path: "M 52,220 L 76,220 L 78,236 L 74,242 L 66,242 L 58,240 L 50,236 Z",
    label: "Dedos",
    labelPos: { x: 64, y: 232 },
  },
  // Right upper arm
  {
    id: "arm",
    path: "M 220,76 L 238,80 L 252,88 L 262,130 L 250,130 L 242,96 L 230,84 L 222,120 Z",
    label: "Braco D.",
    labelPos: { x: 242, y: 104 },
  },
  // Right elbow
  {
    id: "elbow",
    path: "M 248,126 Q 250,134 248,142 L 264,142 Q 267,134 264,126 Z",
    label: "Cotovelo",
    labelPos: { x: 256, y: 134 },
  },
  // Right forearm
  {
    id: "arm-forearm",
    path: "M 250,144 L 265,144 L 274,195 L 264,200 L 258,195 Z",
    label: "Antebraco D.",
    labelPos: { x: 262, y: 170 },
  },
  // Right hand
  {
    id: "hand",
    path: "M 256,197 L 276,197 L 278,218 L 272,222 L 266,225 L 260,225 L 254,218 Z",
    label: "Mao D.",
    labelPos: { x: 266, y: 210 },
  },
  // Right fingers
  {
    id: "fingers",
    path: "M 254,220 L 278,220 L 280,236 L 272,240 L 264,242 L 256,242 L 252,236 Z",
    label: "Dedos",
    labelPos: { x: 266, y: 232 },
  },
  // Left thigh
  {
    id: "leg",
    path: "M 128,188 L 165,196 L 165,276 L 140,276 L 125,230 Z",
    label: "Coxa E.",
    labelPos: { x: 148, y: 235 },
  },
  // Right thigh
  {
    id: "leg",
    path: "M 202,188 L 165,196 L 165,276 L 190,276 L 205,230 Z",
    label: "Coxa D.",
    labelPos: { x: 182, y: 235 },
  },
  // Left knee
  {
    id: "knee",
    path: "M 138,272 L 165,276 L 165,296 L 140,296 Z",
    label: "Joelho",
    labelPos: { x: 152, y: 284 },
  },
  // Right knee
  {
    id: "knee",
    path: "M 192,272 L 165,276 L 165,296 L 190,296 Z",
    label: "Joelho",
    labelPos: { x: 178, y: 284 },
  },
  // Left shin
  {
    id: "leg-shin",
    path: "M 138,298 L 165,298 L 162,378 L 144,378 Z",
    label: "Canela E.",
    labelPos: { x: 152, y: 340 },
  },
  // Right shin
  {
    id: "leg-shin",
    path: "M 165,298 L 192,298 L 186,378 L 168,378 Z",
    label: "Canela D.",
    labelPos: { x: 178, y: 340 },
  },
  // Left ankle + foot
  {
    id: "foot",
    path: "M 142,380 L 164,380 L 164,410 L 136,410 L 134,400 Z",
    label: "Pe E.",
    labelPos: { x: 150, y: 396 },
  },
  // Right foot
  {
    id: "foot",
    path: "M 166,380 L 188,380 L 196,400 L 194,410 L 166,410 Z",
    label: "Pe D.",
    labelPos: { x: 180, y: 396 },
  },
];

const BACK_ZONES: BodyZone[] = [
  // Head back
  {
    id: "head",
    path: "M 147,5 Q 147,0 165,0 Q 183,0 183,5 L 183,15 Q 183,10 165,12 Q 147,10 147,15 Z",
    label: "Cabeca",
    labelPos: { x: 165, y: 7 },
  },
  // Nape (back of head)
  {
    id: "nape",
    path: "M 147,15 Q 143,15 143,28 L 143,42 Q 143,56 165,56 Q 187,56 187,42 L 187,28 Q 187,15 183,15 Z",
    label: "Nuca",
    labelPos: { x: 165, y: 36 },
  },
  // Neck back
  {
    id: "neck",
    path: "M 153,56 L 153,70 L 177,70 L 177,56 Q 165,62 153,56 Z",
    label: "Pescoco",
    labelPos: { x: 165, y: 63 },
  },
  // Upper back (cervical)
  {
    id: "back-cervical",
    path: "M 110,76 L 153,70 L 177,70 L 220,76 L 220,106 Q 165,112 110,106 Z",
    label: "Cervical",
    labelPos: { x: 165, y: 90 },
  },
  // Mid back (thoracic)
  {
    id: "back-thoracic",
    path: "M 108,106 L 222,106 L 222,140 Q 165,146 108,140 Z",
    label: "Toracica",
    labelPos: { x: 165, y: 124 },
  },
  // Lower back (lumbar)
  {
    id: "back-lumbar",
    path: "M 112,140 L 218,140 L 210,164 Q 165,170 120,164 Z",
    label: "Lombar",
    labelPos: { x: 165, y: 152 },
  },
  // Left arm back
  {
    id: "arm",
    path: "M 110,76 L 92,80 L 78,88 L 68,130 L 80,130 L 88,96 L 100,84 L 108,120 Z",
    label: "Braco E.",
    labelPos: { x: 88, y: 104 },
  },
  // Left elbow back
  {
    id: "elbow",
    path: "M 66,126 Q 63,134 67,142 L 82,142 Q 84,134 82,126 Z",
    label: "Cotovelo",
    labelPos: { x: 74, y: 134 },
  },
  // Left forearm back
  {
    id: "arm-forearm",
    path: "M 65,144 L 80,144 L 72,195 L 66,200 L 56,195 Z",
    label: "Antebraco E.",
    labelPos: { x: 68, y: 170 },
  },
  // Left hand back
  {
    id: "hand",
    path: "M 54,197 L 74,197 L 76,218 L 70,225 L 64,225 L 58,222 L 52,218 Z",
    label: "Mao E.",
    labelPos: { x: 64, y: 210 },
  },
  // Right arm back
  {
    id: "arm",
    path: "M 220,76 L 238,80 L 252,88 L 262,130 L 250,130 L 242,96 L 230,84 L 222,120 Z",
    label: "Braco D.",
    labelPos: { x: 242, y: 104 },
  },
  // Right elbow back
  {
    id: "elbow",
    path: "M 248,126 Q 250,134 248,142 L 264,142 Q 267,134 264,126 Z",
    label: "Cotovelo",
    labelPos: { x: 256, y: 134 },
  },
  // Right forearm back
  {
    id: "arm-forearm",
    path: "M 250,144 L 265,144 L 274,195 L 264,200 L 258,195 Z",
    label: "Antebraco D.",
    labelPos: { x: 262, y: 170 },
  },
  // Right hand back
  {
    id: "hand",
    path: "M 256,197 L 276,197 L 278,218 L 272,222 L 266,225 L 260,225 L 254,218 Z",
    label: "Mao D.",
    labelPos: { x: 266, y: 210 },
  },
  // Butt / intimate
  {
    id: "intimate",
    path: "M 120,164 L 210,164 L 200,192 Q 165,200 130,192 Z",
    label: "Gluteo",
    labelPos: { x: 165, y: 178 },
  },
  // Left thigh back
  {
    id: "leg",
    path: "M 128,194 L 165,200 L 165,276 L 140,276 L 125,236 Z",
    label: "Coxa E.",
    labelPos: { x: 148, y: 238 },
  },
  // Right thigh back
  {
    id: "leg",
    path: "M 202,194 L 165,200 L 165,276 L 190,276 L 205,236 Z",
    label: "Coxa D.",
    labelPos: { x: 182, y: 238 },
  },
  // Left knee back
  {
    id: "knee",
    path: "M 138,272 L 165,276 L 165,296 L 140,296 Z",
    label: "Joelho",
    labelPos: { x: 152, y: 284 },
  },
  // Right knee back
  {
    id: "knee",
    path: "M 192,272 L 165,276 L 165,296 L 190,296 Z",
    label: "Joelho",
    labelPos: { x: 178, y: 284 },
  },
  // Left calf
  {
    id: "leg-calf",
    path: "M 138,298 L 165,298 L 162,378 L 144,378 Z",
    label: "Panturr. E.",
    labelPos: { x: 152, y: 340 },
  },
  // Right calf
  {
    id: "leg-calf",
    path: "M 165,298 L 192,298 L 186,378 L 168,378 Z",
    label: "Panturr. D.",
    labelPos: { x: 178, y: 340 },
  },
  // Left foot back
  {
    id: "foot",
    path: "M 142,380 L 164,380 L 164,410 L 136,410 L 134,400 Z",
    label: "Pe E.",
    labelPos: { x: 150, y: 396 },
  },
  // Right foot back
  {
    id: "foot",
    path: "M 166,380 L 188,380 L 196,400 L 194,410 L 166,410 Z",
    label: "Pe D.",
    labelPos: { x: 180, y: 396 },
  },
];

function getPainColor(additionalPrice: number): string {
  if (additionalPrice === 0) return "hsl(180, 70%, 50%)";      // cyan - sem custo extra
  if (additionalPrice <= 50) return "hsl(60, 80%, 55%)";       // amarelo
  if (additionalPrice <= 100) return "hsl(30, 90%, 55%)";      // laranja
  if (additionalPrice <= 150) return "hsl(10, 85%, 55%)";      // vermelho-laranja
  return "hsl(0, 80%, 45%)";                                     // vermelho escuro
}

function getZonePrice(
  zoneId: string,
  bodyLocations: { id: string; additionalPrice: number }[]
): number {
  const loc = bodyLocations.find((l) => l.id === zoneId);
  return loc?.additionalPrice ?? 0;
}

export function BodyLocation() {
  const { tattooDetails, updateTattooDetails, pricingConfig } =
    useBookingStore();
  const { goToNextStep, goToPreviousStep } = useBookingNavigation();
  const [viewSide, setViewSide] = useState<ViewSide>("front");
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);

  const zones = viewSide === "front" ? FRONT_ZONES : BACK_ZONES;

  const hasChildren = (parentId: string) =>
    pricingConfig.bodyLocations.some((l) => l.parentId === parentId);
  const getChildren = (parentId: string) =>
    pricingConfig.bodyLocations.filter((l) => l.parentId === parentId);

  const isSelected = (zoneId: string) => {
    if (tattooDetails.bodyLocation === zoneId) return true;
    return pricingConfig.bodyLocations.some(
      (l) => l.parentId === zoneId && l.id === tattooDetails.bodyLocation
    );
  };

  const handleZoneClick = (zoneId: string) => {
    if (hasChildren(zoneId)) {
      setExpandedParent(expandedParent === zoneId ? null : zoneId);
      return;
    }
    updateTattooDetails({ bodyLocation: zoneId });
    setExpandedParent(null);
  };

  const handleSubLocationChange = (location: string) => {
    updateTattooDetails({ bodyLocation: location });
    setExpandedParent(null);
  };

  const selectedLocation = pricingConfig.bodyLocations.find(
    (l) => l.id === tattooDetails.bodyLocation
  );

  const hoveredLocation = hoveredZone
    ? pricingConfig.bodyLocations.find((l) => l.id === hoveredZone)
    : null;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Text className="text-muted-foreground">
          Toque na parte do corpo onde deseja fazer a tatuagem
        </Text>

        <div className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-400/5 border border-amber-400/20 rounded-md px-3 py-2">
          <span className="shrink-0 mt-0.5">&#9888;&#65039;</span>
          <span>
            O valor pode variar pela dificuldade da area do corpo escolhida. Se
            quiser mudar o local no dia, o valor pode diminuir ou aumentar.
          </span>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            setViewSide("front");
            setExpandedParent(null);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-mono uppercase tracking-wider transition-all duration-200 ${
            viewSide === "front"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              : "bg-card border border-border text-muted-foreground hover:border-primary/40"
          }`}
        >
          Frente
        </button>
        <button
          type="button"
          onClick={() => {
            setViewSide("back");
            setExpandedParent(null);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-mono uppercase tracking-wider transition-all duration-200 ${
            viewSide === "back"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              : "bg-card border border-border text-muted-foreground hover:border-primary/40"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            Costas
          </span>
        </button>
      </div>

      {/* Body Model SVG */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-[330px]">
          <svg
            viewBox="0 0 330 420"
            className="w-full h-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background body silhouette */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="shadow">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodColor="rgba(0,0,0,0.3)"
                />
              </filter>
            </defs>

            {/* Body outline silhouette for context */}
            <path
              d="M 165,0 Q 145,0 143,20 L 143,44 Q 143,58 153,58 L 153,72 L 110,78 L 92,82 L 78,90 L 64,140 L 54,200 L 48,225 L 50,244 L 80,244 L 82,140 L 100,86 L 108,130 L 96,156 L 92,165 L 120,165 L 128,192 L 165,200 L 202,192 L 210,165 L 238,165 L 234,156 L 222,130 L 230,86 L 248,140 L 250,244 L 280,244 L 282,225 L 276,200 L 266,140 L 252,90 L 238,82 L 220,78 L 177,72 L 177,58 Q 187,58 187,44 L 187,20 Q 185,0 165,0 Z"
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              opacity="0.2"
            />
            {/* Legs outline */}
            <path
              d="M 125,192 L 140,278 L 138,298 L 144,380 L 134,412 L 166,412 L 165,380 L 165,298 L 165,200 Z"
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              opacity="0.2"
            />
            <path
              d="M 205,192 L 190,278 L 192,298 L 186,380 L 196,412 L 164,412 L 165,380 L 165,298 L 165,200 Z"
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
              opacity="0.2"
            />

            {/* Interactive zones */}
            {zones.map((zone, idx) => {
              const selected = isSelected(zone.id);
              const hovered = hoveredZone === zone.id;
              const price = getZonePrice(
                zone.id,
                pricingConfig.bodyLocations
              );
              const baseColor = getPainColor(price);

              return (
                <g key={`${zone.id}-${idx}`}>
                  <path
                    d={zone.path}
                    fill={
                      selected
                        ? "hsl(var(--primary))"
                        : hovered
                          ? baseColor
                          : baseColor
                    }
                    fillOpacity={selected ? 0.7 : hovered ? 0.6 : 0.35}
                    stroke={
                      selected
                        ? "hsl(var(--primary))"
                        : hovered
                          ? "hsl(var(--foreground))"
                          : "hsl(var(--border))"
                    }
                    strokeWidth={selected ? 2 : hovered ? 1.5 : 0.8}
                    className="cursor-pointer transition-all duration-200"
                    filter={selected ? "url(#glow)" : undefined}
                    onClick={() => handleZoneClick(zone.id)}
                    onMouseEnter={() => setHoveredZone(zone.id)}
                    onMouseLeave={() => setHoveredZone(null)}
                    onTouchStart={() => setHoveredZone(zone.id)}
                  />
                  {/* Label only on hover or selection */}
                  {(hovered || selected) && (
                    <text
                      x={zone.labelPos.x}
                      y={zone.labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="hsl(var(--foreground))"
                      fontSize="7"
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="pointer-events-none select-none"
                      style={{ textTransform: "uppercase" }}
                    >
                      {zone.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Side label */}
            <text
              x="165"
              y="418"
              textAnchor="middle"
              fill="hsl(var(--muted-foreground))"
              fontSize="8"
              fontFamily="monospace"
              className="select-none"
              style={{ textTransform: "uppercase", letterSpacing: "2px" }}
            >
              {viewSide === "front" ? "Vista Frontal" : "Vista Traseira"}
            </text>
          </svg>
        </div>
      </div>

      {/* Pain/Price Legend */}
      <div className="flex items-center justify-center gap-1">
        <span className="text-[10px] text-muted-foreground font-mono mr-1">
          Custo:
        </span>
        {[0, 50, 100, 150, 200].map((price) => (
          <div key={price} className="flex flex-col items-center gap-0.5">
            <div
              className="w-5 h-3 rounded-sm"
              style={{ backgroundColor: getPainColor(price), opacity: 0.6 }}
            />
            <span className="text-[8px] text-muted-foreground font-mono">
              {price === 0 ? "0" : `+${price}`}
            </span>
          </div>
        ))}
      </div>

      {/* Hovered zone info */}
      <AnimatePresence mode="wait">
        {hoveredLocation && !isSelected(hoveredZone!) && (
          <motion.div
            key="hover-info"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="text-center text-xs text-muted-foreground"
          >
            <span className="font-mono font-bold text-foreground">
              {hoveredLocation.name}
            </span>
            {hoveredLocation.additionalPrice > 0 && (
              <span className="ml-2 gradient-text font-semibold">
                +{formatPrice(hoveredLocation.additionalPrice)}
              </span>
            )}
            {hoveredLocation.additionalTime > 0 && (
              <span className="ml-2">
                +{formatTime(hoveredLocation.additionalTime)}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
