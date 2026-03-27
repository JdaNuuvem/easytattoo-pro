"use client";

import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const getType = (id: string) =>
    currentTypes.find((t) => t.id === id);

  const toggleType = (id: string, name: string, description: string) => {
    if (isEnabled(id)) {
      form.setValue(
        "tattooTypes",
        currentTypes.filter((t) => t.id !== id)
      );
    } else {
      form.setValue("tattooTypes", [
        ...currentTypes,
        { id, name, description, basePrice: 50, baseTime: 60 },
      ]);
    }
  };

  const updateField = (
    id: string,
    field: "basePrice" | "baseTime",
    value: number
  ) => {
    form.setValue(
      "tattooTypes",
      currentTypes.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-mono uppercase tracking-wider font-semibold">
          Tipos de Tatuagem
        </h2>
        <Text className="text-xs text-muted-foreground mt-1">
          Ative os tipos de tatuagem que você oferece e defina o preço base e tempo estimado.
        </Text>
      </div>

      <div className="space-y-3">
        {TATTOO_TYPES.map((type) => {
          const enabled = isEnabled(type.id);
          const data = getType(type.id);

          return (
            <div
              key={type.id}
              className={`rounded-lg border-2 p-4 transition-all ${
                enabled
                  ? "border-primary/30 bg-primary/[0.02]"
                  : "border-border bg-card opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
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

                {enabled && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">R$</Label>
                      <Input
                        type="number"
                        value={data?.basePrice ?? 0}
                        onChange={(e) =>
                          updateField(type.id, "basePrice", Number(e.target.value))
                        }
                        className="w-20 h-8 text-xs bg-background border-border"
                        min={0}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">min</Label>
                      <Input
                        type="number"
                        value={data?.baseTime ?? 0}
                        onChange={(e) =>
                          updateField(type.id, "baseTime", Number(e.target.value))
                        }
                        className="w-20 h-8 text-xs bg-background border-border"
                        min={0}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
