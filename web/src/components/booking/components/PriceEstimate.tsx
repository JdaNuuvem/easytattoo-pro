"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Text } from "@/components/ui/typography";
import { useBookingStore } from "@/stores/booking";
import {
  formatPrice,
  formatTime,
} from "@/components/booking/pricing/calculator";
import { Clock } from "lucide-react";

export function PriceEstimate() {
  const { priceCalculation } = useBookingStore();

  if (!priceCalculation) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={priceCalculation.totalPrice}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-end gap-0.5 px-3 py-1.5 rounded-lg glass-card"
      >
        <Text className="font-mono font-bold text-lg gradient-text leading-none">
          {formatPrice(priceCalculation.totalPrice)}
        </Text>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <Text className="text-[11px] text-muted-foreground leading-none">
            {formatTime(priceCalculation.totalTime)}
          </Text>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
