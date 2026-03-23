"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useBookingStore } from "@/stores/booking";
import { useBookingNavigation } from "@/hooks/useBookingNavigation";
import type { PromotionType } from "@/stores/booking";
import { Gift, Sparkles, ThumbsUp } from "lucide-react";

const promotionSchema = z.object({
  type: z.enum(["none", "mini-pack", "second-tattoo"] as const),
});

type PromotionFormData = z.infer<typeof promotionSchema>;

const promotionOptions = [
  {
    value: "mini-pack" as const,
    title: "Pack Mini Tattoos",
    description:
      "Faca ate 2 mini tattoos (tamanho ate 6x6 cm) no mesmo dia por um preco promocional",
    icon: Gift,
  },
  {
    value: "second-tattoo" as const,
    title: "Pack Segunda Tattoo",
    description:
      "Em tatuagens maiores de 6x6 cm feitas no mesmo dia, a segunda tem 20% de desconto",
    icon: Sparkles,
  },
  {
    value: "none" as const,
    title: "Nao desejo adicionar mais tattoos",
    description: "Continue com apenas uma tatuagem",
    icon: ThumbsUp,
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export function FlashPromotion() {
  const { promotion, updatePromotion } = useBookingStore();
  const { goToNextStep, goToPreviousStep } = useBookingNavigation();

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      type: promotion.type,
    },
  });

  const onSubmit = (data: PromotionFormData) => {
    updatePromotion({
      type: data.type,
    });
    goToNextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-mono uppercase tracking-wider font-bold text-lg gradient-text">
          Promocao Relampago!
        </h3>
        <Text className="text-muted-foreground">
          Aproveite nossas promocoes especiais e faca mais de uma tatuagem com
          condicoes exclusivas.
        </Text>
      </div>

      <RadioGroup
        defaultValue={promotion.type}
        onValueChange={(value) => setValue("type", value as PromotionType)}
        className="grid gap-3"
      >
        <motion.div
          className="contents"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {promotionOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = promotion.type === option.value;
            return (
              <motion.div
                key={option.value}
                className="relative"
                variants={itemVariants}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={option.value}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300
                    ${isSelected
                      ? "border-primary glow-magenta bg-primary/[0.03]"
                      : "border-border hover:border-primary/40 hover:shadow-lg hover:shadow-black/5"
                    }
                    peer-data-[state=checked]:border-primary peer-data-[state=checked]:glow-magenta
                    [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:glow-magenta`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-mono uppercase tracking-wider font-bold text-foreground">
                      {option.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {option.description}
                    </p>
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

      {errors.type && (
        <p className="text-sm text-destructive">{errors.type.message}</p>
      )}

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={goToPreviousStep}>
          Voltar
        </Button>
        <Button type="submit" className="flex-1">
          Continuar
        </Button>
      </div>
    </form>
  );
}
