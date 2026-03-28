"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/typography";
import { useBookingStore } from "@/stores/booking";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import { Pen, Type, Layers, Minus, CircleDot, PaintBucket } from "lucide-react";

const getTypeIcon = (type: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    drawing: <Pen className="w-8 h-8" />,
    text: <Type className="w-8 h-8" />,
    closure: <Layers className="w-8 h-8" />,
  };
  return iconMap[type] || <Pen className="w-8 h-8" />;
};

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export function TattooType() {
  const { tattooDetails, updateTattooDetails, pricingConfig } =
    useBookingStore();
  const { goToNextStep, goToPreviousStep } = useBookingNavigation();

  const handleTypeChange = (type: string) => {
    const updates: Partial<typeof tattooDetails> = {
      type: type as (typeof pricingConfig.tattooTypes)[number]["id"],
    };
    if (type === "closure") {
      updates.size = { width: 30, height: 30 };
      updates.shading = "realism";
    }
    if (type !== "drawing") {
      updates.drawingStyle = undefined;
    }
    updateTattooDetails(updates);
  };

  const handleDrawingStyleChange = (style: string) => {
    updateTattooDetails({
      drawingStyle: style as typeof tattooDetails.drawingStyle,
    });
  };

  const drawingStyleOptions = [
    {
      id: "lines-only",
      name: "Apenas Traços",
      description: "Somente linhas, sem preenchimento",
      icon: <Minus className="w-6 h-6" />,
    },
    {
      id: "dotwork",
      name: "Pontilhismo",
      description: "Feita com pontos",
      icon: <CircleDot className="w-6 h-6" />,
    },
    {
      id: "blackfill",
      name: "Parte Pintada de Preto",
      description: "Com áreas preenchidas em preto",
      icon: <PaintBucket className="w-6 h-6" />,
    },
  ];

  const isDrawing = tattooDetails.type === "drawing";
  const canProceed = tattooDetails.type && (!isDrawing || tattooDetails.drawingStyle);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Text className="text-muted-foreground">
          Que tipo de tatuagem voce quer fazer?
        </Text>

        <RadioGroup
          value={tattooDetails.type}
          onValueChange={handleTypeChange}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <motion.div
            className="contents"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {pricingConfig.tattooTypes.map((option) => {
              const isSelected = tattooDetails.type === option.id;
              return (
                <motion.div
                  key={option.id}
                  className="relative"
                  variants={itemVariants}
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
                    className={`flex flex-col rounded-lg border-2 bg-card/80 backdrop-blur-sm h-[170px] cursor-pointer transition-all duration-300
                      ${isSelected
                        ? "border-primary glow-magenta bg-primary/[0.03]"
                        : "border-border hover:border-primary/40 hover:shadow-lg hover:shadow-black/5"
                      }
                      peer-data-[state=checked]:border-primary peer-data-[state=checked]:glow-magenta
                      [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:glow-magenta`}
                  >
                    <div className="flex flex-col items-center justify-center h-full gap-3 p-4">
                      <div className={`p-3 rounded-xl transition-colors duration-300 ${isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {getTypeIcon(option.id)}
                      </div>
                      <div className="text-center">
                        <span className="font-mono uppercase tracking-wider font-bold block text-base text-foreground">
                          {option.name}
                        </span>
                        <span className="text-sm text-muted-foreground block mt-1">
                          {option.description}
                        </span>
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

        {/* Sub-opções para Desenho */}
        {isDrawing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <Text className="text-muted-foreground text-sm">
              Sua tatuagem tem:
            </Text>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {drawingStyleOptions.map((option) => {
                const isStyleSelected = tattooDetails.drawingStyle === option.id;
                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    onClick={() => handleDrawingStyleChange(option.id)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300
                      ${isStyleSelected
                        ? "border-primary glow-magenta bg-primary/[0.03]"
                        : "border-border hover:border-primary/40 hover:shadow-lg hover:shadow-black/5"
                      }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className={`p-2 rounded-lg transition-colors duration-300 ${isStyleSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {option.icon}
                    </div>
                    <span className="font-mono uppercase tracking-wider font-bold text-xs text-foreground text-center">
                      {option.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground text-center">
                      {option.description}
                    </span>
                    {isStyleSelected && (
                      <motion.div
                        className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={goToPreviousStep}>
          Voltar
        </Button>
        <Button onClick={goToNextStep} disabled={!canProceed}>
          Próximo
        </Button>
      </div>
    </div>
  );
}
