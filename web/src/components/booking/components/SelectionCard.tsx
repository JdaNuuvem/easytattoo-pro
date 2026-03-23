"use client";

import { motion } from "framer-motion";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SelectionCardProps {
  id: string;
  isSelected: boolean;
  className?: string;
  children: React.ReactNode;
}

export function SelectionCard({
  id,
  isSelected,
  className,
  children,
}: SelectionCardProps) {
  return (
    <motion.div
      className="relative"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <RadioGroupItem value={id} id={id} className="peer sr-only" />
      <Label
        htmlFor={id}
        className={cn(
          "flex rounded-lg border-2 border-border bg-card/80 backdrop-blur-sm cursor-pointer transition-all duration-300",
          "hover:border-primary/40 hover:shadow-lg hover:shadow-black/5",
          "peer-data-[state=checked]:border-primary peer-data-[state=checked]:glow-magenta peer-data-[state=checked]:bg-primary/[0.03]",
          "[&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:glow-magenta [&:has([data-state=checked])]:bg-primary/[0.03]",
          className
        )}
      >
        {children}
        {/* Selected indicator dot */}
        {isSelected && (
          <motion.div
            layoutId="selection-indicator"
            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </Label>
    </motion.div>
  );
}
