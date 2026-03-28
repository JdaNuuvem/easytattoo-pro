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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Minimize2, Maximize2, CreditCard, PenLine, Ruler } from "lucide-react";

const FIXED_SIZE = { width: 5, height: 5 };
const TEXT_HEIGHT = 2;

const SIZE_REFERENCES = [
  {
    name: "Cartão de Crédito",
    widthCm: 8.5,
    heightCm: 5.4,
    icon: CreditCard,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    name: "Caneta",
    widthCm: 14,
    heightCm: 1,
    icon: PenLine,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
  },
  {
    name: "Folha A4 (largura)",
    widthCm: 21,
    heightCm: 29.7,
    icon: Ruler,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
  },
];

function SizeComparisonBar({
  currentWidth,
  currentHeight,
}: {
  currentWidth: number;
  currentHeight: number;
}) {
  const maxRef = 22;
  const currentMax = Math.max(currentWidth, currentHeight);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 p-4 rounded-lg border border-border/50 bg-card/50"
    >
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
        Comparação de tamanho
      </span>

      <div className="space-y-3">
        {/* Tatuagem atual */}
        {currentMax > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary">
                Sua tatuagem
              </span>
              <span className="text-xs text-muted-foreground">
                {currentWidth}x{currentHeight}cm
              </span>
            </div>
            <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 progress-gradient rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((currentMax / maxRef) * 100, 100)}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
            </div>
          </div>
        )}

        {/* Referências */}
        {SIZE_REFERENCES.map((ref) => {
          const refMax = Math.max(ref.widthCm, ref.heightCm);
          const Icon = ref.icon;
          return (
            <div key={ref.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className={cn("w-3.5 h-3.5", ref.color)} />
                  <span className="text-xs text-muted-foreground">
                    {ref.name}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {ref.widthCm}x{ref.heightCm}cm
                </span>
              </div>
              <div className="relative h-2 bg-muted/20 rounded-full overflow-hidden">
                <div
                  className={cn("absolute inset-y-0 left-0 rounded-full opacity-40", ref.bgColor)}
                  style={{ width: `${Math.min((refMax / maxRef) * 100, 100)}%`, backgroundColor: `hsl(var(--muted-foreground) / 0.2)` }}
                />
                <div
                  className={cn("absolute inset-y-0 left-0 rounded-full", ref.color.replace("text-", "bg-"))}
                  style={{ width: `${Math.min((refMax / maxRef) * 100, 100)}%`, opacity: 0.5 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visualização proporcional dos objetos */}
      <div className="flex items-end justify-center gap-4 pt-3 border-t border-border/30">
        {/* Cartão de crédito */}
        <div className="flex flex-col items-center gap-1">
          <motion.div
            className="border-2 border-blue-400/50 rounded-md bg-blue-400/5 flex items-center justify-center"
            style={{
              width: `${8.5 * 3.5}px`,
              height: `${5.4 * 3.5}px`,
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <CreditCard className="w-4 h-4 text-blue-400/60" />
          </motion.div>
          <span className="text-[10px] text-muted-foreground">8.5cm</span>
        </div>

        {/* Sua tatuagem */}
        {currentMax > 0 && (
          <div className="flex flex-col items-center gap-1">
            <motion.div
              className="border-2 border-primary rounded-md bg-primary/10 flex items-center justify-center glow-magenta"
              style={{
                width: `${Math.max(currentWidth * 3.5, 14)}px`,
                height: `${Math.max(currentHeight * 3.5, 14)}px`,
                maxWidth: "105px",
                maxHeight: "105px",
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-[9px] font-mono text-primary font-bold">
                {currentWidth}x{currentHeight}
              </span>
            </motion.div>
            <span className="text-[10px] text-primary font-semibold">Tattoo</span>
          </div>
        )}

        {/* Caneta */}
        <div className="flex flex-col items-center gap-1">
          <motion.div
            className="border-2 border-amber-400/50 rounded-full bg-amber-400/5 flex items-center justify-center"
            style={{
              width: `${1 * 3.5 + 4}px`,
              height: `${14 * 3.5}px`,
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <PenLine className="w-3 h-3 text-amber-400/60 rotate-180" />
          </motion.div>
          <span className="text-[10px] text-muted-foreground">14cm</span>
        </div>

        {/* Folha A4 largura = ~21cm */}
        <div className="flex flex-col items-center gap-1">
          <motion.div
            className="border-2 border-emerald-400/50 rounded-md bg-emerald-400/5 flex items-center justify-center"
            style={{
              width: `${21 * 3.5}px`,
              height: `${10 * 3.5}px`,
              maxWidth: "75px",
              maxHeight: "50px",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Ruler className="w-4 h-4 text-emerald-400/60" />
          </motion.div>
          <span className="text-[10px] text-muted-foreground">21cm</span>
        </div>
      </div>
    </motion.div>
  );
}

export function TattooSize() {
  const { tattooDetails, updateTattooDetails, pricingConfig } =
    useBookingStore();
  const { goToNextStep, goToPreviousStep } = useBookingNavigation();

  const maxSize = pricingConfig.priceTable[pricingConfig.priceTable.length - 1];
  const minSize = pricingConfig.priceTable[0];
  const isTextType = tattooDetails.type === "text";

  const isFixedSize =
    tattooDetails.size.width === FIXED_SIZE.width &&
    tattooDetails.size.height === FIXED_SIZE.height;

  const handleSizeTypeChange = (type: "fixed" | "custom") => {
    if (type === "fixed") {
      updateTattooDetails({
        size: FIXED_SIZE,
      });
    }

    if (type === "custom") {
      updateTattooDetails({
        size: {
          width: 0,
          height: isTextType ? TEXT_HEIGHT : 0,
        },
      });
    }
  };

  const handleCustomSizeChange = (field: "width" | "height", value: string) => {
    if (value === "") {
      updateTattooDetails({
        size: {
          width: field === "width" ? 0 : tattooDetails.size.width,
          height:
            field === "height"
              ? isTextType
                ? TEXT_HEIGHT
                : 0
              : tattooDetails.size.height,
        },
      });
      return;
    }

    const numValue = Number(value);

    if (isNaN(numValue)) return;
    if (
      field === "width" &&
      (numValue < minSize.width || numValue > maxSize.width)
    )
      return;
    if (
      field === "height" &&
      (numValue < minSize.height || numValue > maxSize.height)
    )
      return;

    updateTattooDetails({
      size: {
        width: field === "width" ? numValue : tattooDetails.size.width,
        height:
          field === "height"
            ? numValue
            : isTextType
              ? TEXT_HEIGHT
              : tattooDetails.size.height,
      },
    });
  };

  const sizeOptions = [
    {
      id: "fixed",
      name: "Tamanho Mínimo",
      description: "Ideal para tatuagens delicadas e minimalistas (de 1x1 até 5x5)",
      size: "5x5cm",
      price:
        pricingConfig.priceTable.find(
          (entry) => entry.width === 5 && entry.height === 5
        )?.additionalPrice || 0,
      time:
        pricingConfig.priceTable.find(
          (entry) => entry.width === 5 && entry.height === 5
        )?.additionalTime || 0,
      icon: <Minimize2 className="w-7 h-7" />,
    },
    {
      id: "custom",
      name: "Tamanho Personalizado",
      description: isTextType
        ? "Escolha a largura do seu texto"
        : "Escolha as dimensoes exatas da sua tatuagem",
      size: "Dimensoes customizadas",
      price: 0,
      time: 0,
      icon: <Maximize2 className="w-7 h-7" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Text className="text-muted-foreground">
          Qual o tamanho da sua tatuagem?
        </Text>

        <RadioGroup
          value={isFixedSize ? "fixed" : "custom"}
          onValueChange={(value) =>
            handleSizeTypeChange(value as "fixed" | "custom")
          }
          className="grid grid-cols-2 gap-4"
        >
          {sizeOptions.map((option) => {
            const isSelected =
              (option.id === "fixed" && isFixedSize) ||
              (option.id === "custom" && !isFixedSize);
            return (
              <motion.div
                key={option.id}
                className="relative"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={option.id}
                  className={`flex h-[170px] flex-col justify-between rounded-lg border-2 bg-card/80 backdrop-blur-sm p-4 cursor-pointer transition-all duration-300
                    ${isSelected
                      ? "border-primary glow-magenta bg-primary/[0.03]"
                      : "border-border hover:border-primary/40 hover:shadow-lg hover:shadow-black/5"
                    }
                    peer-data-[state=checked]:border-primary peer-data-[state=checked]:glow-magenta
                    [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:glow-magenta`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2.5 rounded-xl transition-colors duration-300 ${isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {option.icon}
                    </div>
                    <span className="font-mono uppercase tracking-wider font-bold text-center text-sm text-foreground">
                      {option.name}
                    </span>
                    <span className="text-xs text-muted-foreground text-center line-clamp-2">
                      {option.description}
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-xs text-muted-foreground">
                    <span>{option.size}</span>
                    {option.id === "fixed" && (
                      <>
                        {option.time > 0 && (
                          <span>+{formatTime(option.time)}</span>
                        )}
                        {option.price > 0 && (
                          <span className="font-medium gradient-text">
                            +{formatPrice(option.price)}
                          </span>
                        )}
                      </>
                    )}
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
        </RadioGroup>

        {!isFixedSize && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 p-4 rounded-lg border border-border/50 glass-card"
          >
            <div
              className={cn(
                "flex",
                isTextType ? "justify-center" : "space-x-4"
              )}
            >
              {!isTextType && (
                <div className="space-y-2 flex-1 max-w-[200px]">
                  <Label htmlFor="height" className="text-foreground">
                    Altura (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    min={minSize.height}
                    max={maxSize.height}
                    step="1"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={tattooDetails.size.height || ""}
                    onChange={(e) =>
                      handleCustomSizeChange("height", e.target.value)
                    }
                    placeholder={`${minSize.height}-${maxSize.height}`}
                    className="bg-background/50 border-border focus-visible:ring-primary"
                  />
                </div>
              )}
              <div className="space-y-2 flex-1 max-w-[200px]">
                <Label htmlFor="width" className="text-foreground">
                  {isTextType ? "Largura do texto (cm)" : "Largura (cm)"}
                </Label>
                <Input
                  id="width"
                  type="number"
                  min={minSize.width}
                  max={maxSize.width}
                  step="1"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={tattooDetails.size.width || ""}
                  onChange={(e) =>
                    handleCustomSizeChange("width", e.target.value)
                  }
                  placeholder={`${minSize.width}-${maxSize.width}`}
                  className="bg-background/50 border-border focus-visible:ring-primary"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Comparação visual de tamanho */}
        <SizeComparisonBar
          currentWidth={tattooDetails.size.width}
          currentHeight={isTextType ? TEXT_HEIGHT : tattooDetails.size.height}
        />
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={goToPreviousStep}>
          Voltar
        </Button>
        <div className="flex items-center gap-4">
          <PriceEstimate />
          <Button onClick={goToNextStep}>Próximo</Button>
        </div>
      </div>
    </div>
  );
}
