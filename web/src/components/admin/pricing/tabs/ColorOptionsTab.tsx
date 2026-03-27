"use client";

import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/typography";
import { COLOR_OPTIONS } from "@/lib/constants";

interface ColorOptionsTabProps {
  form: UseFormReturn<FormValues>;
}

export function ColorOptionsTab({ form }: ColorOptionsTabProps) {
  const currentOptions = form.watch("colorOptions");

  const isEnabled = (id: string) =>
    currentOptions.some((opt) => opt.id === id);

  const getOption = (id: string) =>
    currentOptions.find((opt) => opt.id === id);

  const toggleOption = (id: string, name: string, description: string) => {
    if (isEnabled(id)) {
      form.setValue(
        "colorOptions",
        currentOptions.filter((opt) => opt.id !== id)
      );
    } else {
      form.setValue("colorOptions", [
        ...currentOptions,
        { id, name, description, additionalPrice: 0, additionalTime: 0 },
      ]);
    }
  };

  const updateField = (
    id: string,
    field: "additionalPrice" | "additionalTime",
    value: number
  ) => {
    form.setValue(
      "colorOptions",
      currentOptions.map((opt) =>
        opt.id === id ? { ...opt, [field]: value } : opt
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-mono uppercase tracking-wider font-semibold">
          Opções de Cores
        </h2>
        <Text className="text-xs text-muted-foreground mt-1">
          Ative as opções de cor que você oferece e defina o valor adicional.
        </Text>
      </div>

      <div className="space-y-3">
        {COLOR_OPTIONS.map((opt) => {
          const enabled = isEnabled(opt.id);
          const data = getOption(opt.id);

          return (
            <div
              key={opt.id}
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
                    onCheckedChange={() => toggleOption(opt.id, opt.name, opt.description)}
                  />
                  <div>
                    <span className="font-mono uppercase tracking-wider font-semibold text-sm">
                      {opt.name}
                    </span>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </div>

                {enabled && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">R$</Label>
                      <Input
                        type="number"
                        value={data?.additionalPrice ?? 0}
                        onChange={(e) =>
                          updateField(opt.id, "additionalPrice", Number(e.target.value))
                        }
                        className="w-20 h-8 text-xs bg-background border-border"
                        min={0}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">min</Label>
                      <Input
                        type="number"
                        value={data?.additionalTime ?? 0}
                        onChange={(e) =>
                          updateField(opt.id, "additionalTime", Number(e.target.value))
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
