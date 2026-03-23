"use client";

import { Card, CardContent } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../schema";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PricingOptionCard } from "@/components/pricing/PricingOptionCard";

interface ShadingOptionsTabProps {
  form: UseFormReturn<FormValues>;
}

export function ShadingOptionsTab({ form }: ShadingOptionsTabProps) {
  const addNewShading = () => {
    const currentShadings = form.getValues("shadingOptions");
    form.setValue("shadingOptions", [
      ...currentShadings,
      {
        id: `shd-${Date.now()}`,
        name: "",
        description: "",
        additionalPrice: 0,
        additionalTime: 0,
      },
    ]);
  };

  const removeShading = (index: number) => {
    const currentShadings = form.getValues("shadingOptions");
    form.setValue(
      "shadingOptions",
      currentShadings.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-mono uppercase tracking-wider font-semibold">
          Opcoes de Sombreamento
        </h2>
        <Button
          type="button"
          onClick={addNewShading}
          variant="outline"
          size="sm"
          className="border-border"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Adicionar Sombreamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {form.watch("shadingOptions").map((shading, index) => (
          <PricingOptionCard
            key={shading.id}
            id={shading.id}
            index={index}
            form={form}
            fieldNamePrefix="shadingOptions"
            onDelete={removeShading}
          />
        ))}
      </div>

      {form.watch("shadingOptions").length === 0 && (
        <Card className="border-dashed border-border">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Nenhuma opcao de sombreamento cadastrada
            </p>
            <Button
              type="button"
              onClick={addNewShading}
              variant="outline"
              size="sm"
              className="border-border"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Adicionar Primeira Opcao
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
