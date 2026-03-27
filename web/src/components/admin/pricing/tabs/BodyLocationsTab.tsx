"use client";

import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/typography";
import { BODY_LOCATIONS } from "@/lib/constants";

const BODY_LOCATION_EMOJI: Record<string, string> = {
  arm: "💪",
  hand: "🤚",
  fingers: "🖐️",
  leg: "🦵",
  foot: "🦶",
  knee: "🦿",
  elbow: "💪",
  neck: "🧣",
  nape: "🧑‍🦲",
  face: "😊",
  head: "🗣️",
  back: "🔙",
  chest: "👕",
  ribs: "🦴",
  sternum: "🫁",
  intimate: "🔒",
};

interface BodyLocationsTabProps {
  form: UseFormReturn<FormValues>;
}

export function BodyLocationsTab({ form }: BodyLocationsTabProps) {
  const currentLocations = form.watch("bodyLocations");

  const isEnabled = (id: string) =>
    currentLocations.some((loc) => loc.id === id);

  const getLocation = (id: string) =>
    currentLocations.find((loc) => loc.id === id);

  const toggleLocation = (id: string, name: string, description: string) => {
    if (isEnabled(id)) {
      form.setValue(
        "bodyLocations",
        currentLocations.filter((loc) => loc.id !== id)
      );
    } else {
      form.setValue("bodyLocations", [
        ...currentLocations,
        { id, name, description, additionalPrice: 0, additionalTime: 0 },
      ]);
    }
  };

  const updateLocationField = (
    id: string,
    field: "additionalPrice" | "additionalTime",
    value: number
  ) => {
    form.setValue(
      "bodyLocations",
      currentLocations.map((loc) =>
        loc.id === id ? { ...loc, [field]: value } : loc
      )
    );
  };

  // Only show parent locations (no parentId)
  const parentLocations = BODY_LOCATIONS.filter((l) => !("parentId" in l));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-mono uppercase tracking-wider font-semibold">
          Localizações no Corpo
        </h2>
        <Text className="text-xs text-muted-foreground mt-1">
          Ative as regiões que você tatua e defina o preço/tempo adicional de cada uma.
        </Text>
      </div>

      <div className="space-y-3">
        {parentLocations.map((loc) => {
          const enabled = isEnabled(loc.id);
          const data = getLocation(loc.id);

          return (
            <div
              key={loc.id}
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
                    onCheckedChange={() => toggleLocation(loc.id, loc.name, `Região: ${loc.name}`)}
                  />
                  <span className="text-xl" role="img" aria-label={loc.name}>
                    {BODY_LOCATION_EMOJI[loc.id] || "✨"}
                  </span>
                  <span className="font-mono uppercase tracking-wider font-semibold text-sm">
                    {loc.name}
                  </span>
                </div>

                {enabled && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">R$</Label>
                      <Input
                        type="number"
                        value={data?.additionalPrice ?? 0}
                        onChange={(e) =>
                          updateLocationField(loc.id, "additionalPrice", Number(e.target.value))
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
                          updateLocationField(loc.id, "additionalTime", Number(e.target.value))
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
