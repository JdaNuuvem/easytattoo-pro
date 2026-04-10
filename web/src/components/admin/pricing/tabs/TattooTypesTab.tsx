"use client";

import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../schema";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/typography";
import { TATTOO_TYPES } from "@/lib/constants";

interface TattooTypesTabProps {
  form: UseFormReturn<FormValues>;
}

export function TattooTypesTab({ form }: TattooTypesTabProps) {
  const currentTypes = form.watch("tattooTypes");

  const isEnabled = (id: string) =>
    currentTypes.some((t) => t.id === id);

  const toggleType = (id: string, name: string, description: string) => {
    if (isEnabled(id)) {
      form.setValue(
        "tattooTypes",
        currentTypes.filter((t) => t.id !== id)
      );
    } else {
      form.setValue("tattooTypes", [
        ...currentTypes,
        { id, name, description, basePrice: 0, baseTime: 0 },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-mono uppercase tracking-wider font-semibold">
          Tipos de Tatuagem
        </h2>
        <Text className="text-xs text-muted-foreground mt-1">
          Ative os tipos de tatuagem que voce oferece.
        </Text>
      </div>

      <div className="space-y-3">
        {TATTOO_TYPES.map((type) => {
          const enabled = isEnabled(type.id);

          return (
            <div
              key={type.id}
              className={`rounded-lg border-2 p-4 transition-all ${
                enabled
                  ? "border-primary/30 bg-primary/[0.02]"
                  : "border-border bg-card opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={enabled}
                  onCheckedChange={() => toggleType(type.id, type.name, type.description)}
                />
                <div>
                  <span className="font-mono uppercase tracking-wider font-semibold text-sm">
                    {type.name}
                  </span>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
