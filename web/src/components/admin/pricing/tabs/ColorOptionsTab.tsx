"use client";

import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../schema";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PricingOptionCard } from "@/components/pricing/PricingOptionCard";

interface ColorOptionsTabProps {
  form: UseFormReturn<FormValues>;
}

export function ColorOptionsTab({ form }: ColorOptionsTabProps) {
  const addNewColor = () => {
    const currentColors = form.getValues("colorOptions");
    form.setValue("colorOptions", [
      ...currentColors,
      {
        id: `col-${Date.now()}`,
        name: "",
        description: "",
        additionalPrice: 0,
        additionalTime: 0,
      },
    ]);
  };

  const removeColor = (index: number) => {
    const currentColors = form.getValues("colorOptions");
    form.setValue(
      "colorOptions",
      currentColors.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-mono uppercase tracking-wider font-semibold">
          Opcoes de Cores
        </h2>
        <Button
          type="button"
          onClick={addNewColor}
          variant="outline"
          size="sm"
          className="border-border"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Adicionar Cor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {form.watch("colorOptions").map((color, index) => (
          <PricingOptionCard
            key={color.id}
            id={color.id}
            index={index}
            form={form}
            fieldNamePrefix="colorOptions"
            onDelete={removeColor}
          />
        ))}
      </div>

      {form.watch("colorOptions").length === 0 && (
        <Card className="border-dashed border-border">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Nenhuma opcao de cor cadastrada
            </p>
            <Button
              type="button"
              onClick={addNewColor}
              variant="outline"
              size="sm"
              className="border-border"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Adicionar Primeira Cor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
