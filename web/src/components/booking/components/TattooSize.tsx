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

// Escala: 1cm = PX_PER_CM pixels na tela
const PX_PER_CM = 4.5;

function SizeComparisonBar({
  currentWidth,
  currentHeight,
}: {
  currentWidth: number;
  currentHeight: number;
}) {
  const hasTattoo = currentWidth > 0 && currentHeight > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border border-border/50 bg-card/50"
    >
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-4">
        Comparação de tamanho real
      </span>

      <div className="flex items-end justify-center gap-5 flex-wrap">

        {/* Cartão de crédito: 8.5 x 5.4 cm */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            className="relative border-2 border-blue-400/60 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-400/5 flex items-center justify-center overflow-hidden"
            style={{
              width: `${8.5 * PX_PER_CM}px`,
              height: `${5.4 * PX_PER_CM}px`,
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            {/* Chip do cartão */}
            <div className="absolute top-[20%] left-[12%] w-[18%] h-[30%] rounded-sm border border-blue-400/40 bg-blue-400/15" />
            {/* Bandeira */}
            <div className="absolute bottom-[12%] right-[8%] flex gap-0.5">
              <div className="w-2 h-2 rounded-full bg-blue-400/30" />
              <div className="w-2 h-2 rounded-full bg-blue-300/20 -ml-1" />
            </div>
            <CreditCard className="w-5 h-5 text-blue-400/40" />
          </motion.div>
          <div className="text-center">
            <span className="text-[11px] font-semibold text-blue-400 block">Cartão de Crédito</span>
            <span className="text-[10px] text-muted-foreground">8.5 x 5.4 cm</span>
          </div>
        </div>

        {/* Tatuagem do cliente */}
        {hasTattoo && (
          <div className="flex flex-col items-center gap-2">
            <motion.div
              className="border-2 border-primary rounded-lg bg-primary/10 flex items-center justify-center glow-magenta relative"
              style={{
                width: `${Math.max(currentWidth * PX_PER_CM, 18)}px`,
                height: `${Math.max(currentHeight * PX_PER_CM, 18)}px`,
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              layout
            >
              {/* Grid pontilhado interno */}
              <div className="absolute inset-1 border border-dashed border-primary/20 rounded" />
              <span className="text-[10px] font-mono text-primary font-bold relative z-10">
                {currentWidth}x{currentHeight}
              </span>
            </motion.div>
            <div className="text-center">
              <span className="text-[11px] font-semibold text-primary block">Sua Tatuagem</span>
              <span className="text-[10px] text-muted-foreground">{currentWidth} x {currentHeight} cm</span>
            </div>
          </div>
        )}

        {/* Caneta: ~14cm comprimento, ~1cm largura */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            className="relative flex items-center justify-center"
            style={{
              width: `${1.2 * PX_PER_CM}px`,
              height: `${14 * PX_PER_CM}px`,
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {/* Corpo da caneta */}
            <div
              className="absolute inset-x-0 rounded-full border-2 border-amber-400/60 bg-gradient-to-b from-amber-400/15 via-amber-400/10 to-amber-500/20"
              style={{ top: 0, bottom: `${1.5 * PX_PER_CM}px` }}
            />
            {/* Clip da caneta */}
            <div
              className="absolute right-0 bg-amber-400/30 rounded-sm"
              style={{ top: `${0.5 * PX_PER_CM}px`, width: "3px", height: `${2 * PX_PER_CM}px` }}
            />
            {/* Ponta da caneta */}
            <div
              className="absolute inset-x-[25%] bottom-0 bg-amber-400/40"
              style={{
                height: `${1.5 * PX_PER_CM}px`,
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              }}
            />
            <PenLine className="w-3 h-3 text-amber-400/50 rotate-180 relative z-10" />
          </motion.div>
          <div className="text-center">
            <span className="text-[11px] font-semibold text-amber-400 block">Caneta</span>
            <span className="text-[10px] text-muted-foreground">14 cm</span>
          </div>
        </div>

        {/* Régua / Controle remoto: ~21cm */}
        <div className="flex flex-col items-center gap-2">
          <motion.div
            className="relative border-2 border-emerald-400/60 rounded-md bg-gradient-to-b from-emerald-400/10 to-emerald-500/5 flex flex-col items-center justify-between overflow-hidden"
            style={{
              width: `${3 * PX_PER_CM}px`,
              height: `${21 * PX_PER_CM}px`,
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 200 }}
          >
            {/* Marcações de régua a cada 5cm */}
            {[0, 5, 10, 15, 20].map((cm) => (
              <div
                key={cm}
                className="absolute left-0 right-0 flex items-center"
                style={{ top: `${(cm / 21) * 100}%` }}
              >
                <div className="w-full h-px bg-emerald-400/25" />
                <span className="absolute right-1 text-[7px] text-emerald-400/50 font-mono">
                  {cm}
                </span>
              </div>
            ))}
            <Ruler className="w-4 h-4 text-emerald-400/40 relative z-10 mt-2" />
          </motion.div>
          <div className="text-center">
            <span className="text-[11px] font-semibold text-emerald-400 block">Régua 21cm</span>
            <span className="text-[10px] text-muted-foreground">21 cm</span>
          </div>
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
