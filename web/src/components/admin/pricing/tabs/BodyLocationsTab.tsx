"use client";

import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../schema";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PricingOptionCard } from "@/components/pricing/PricingOptionCard";

interface BodyLocationsTabProps {
  form: UseFormReturn<FormValues>;
}

export function BodyLocationsTab({ form }: BodyLocationsTabProps) {
  const addNewLocation = () => {
    const currentLocations = form.getValues("bodyLocations");
    form.setValue("bodyLocations", [
      ...currentLocations,
      {
        id: `loc-${Date.now()}`,
        name: "",
        description: "",
        additionalPrice: 0,
        additionalTime: 0,
      },
    ]);
  };

  const removeLocation = (index: number) => {
    const currentLocations = form.getValues("bodyLocations");
    form.setValue(
      "bodyLocations",
      currentLocations.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-mono uppercase tracking-wider font-semibold">
          Localizacoes no Corpo
        </h2>
        <Button
          type="button"
          onClick={addNewLocation}
          variant="outline"
          size="sm"
          className="border-border"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Adicionar Localizacao
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {form.watch("bodyLocations").map((location, index) => (
          <PricingOptionCard
            key={location.id}
            id={location.id}
            index={index}
            form={form}
            fieldNamePrefix="bodyLocations"
            onDelete={removeLocation}
          />
        ))}
      </div>

      {form.watch("bodyLocations").length === 0 && (
        <Card className="border-dashed border-border">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Nenhuma localizacao cadastrada
            </p>
            <Button
              type="button"
              onClick={addNewLocation}
              variant="outline"
              size="sm"
              className="border-border"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Adicionar Primeira Localizacao
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
