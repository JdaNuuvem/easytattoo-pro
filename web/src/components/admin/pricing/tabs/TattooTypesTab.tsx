"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../schema";
import { PlusCircle, Trash2 } from "lucide-react";

interface TattooTypesTabProps {
  form: UseFormReturn<FormValues>;
}

export function TattooTypesTab({ form }: TattooTypesTabProps) {
  const addNewType = () => {
    const currentTypes = form.getValues("tattooTypes");
    form.setValue("tattooTypes", [
      ...currentTypes,
      {
        id: `type-${Date.now()}`,
        name: "",
        description: "",
        basePrice: 0,
        baseTime: 0,
      },
    ]);
  };

  const removeType = (index: number) => {
    const currentTypes = form.getValues("tattooTypes");
    form.setValue(
      "tattooTypes",
      currentTypes.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-mono uppercase tracking-wider font-semibold">
          Tipos de Tatuagem
        </h2>
        <Button
          type="button"
          onClick={addNewType}
          variant="outline"
          size="sm"
          className="border-border"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Adicionar Tipo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {form.watch("tattooTypes").map((_, index) => (
          <Card key={index} className="border-border">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <FormField
                control={form.control}
                name={`tattooTypes.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nome do tipo"
                        className="bg-background border-border text-lg font-semibold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeType(index)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 ml-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name={`tattooTypes.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descricao</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Descricao do tipo"
                        className="bg-background border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`tattooTypes.${index}.basePrice`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preco Base (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="bg-background border-border"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`tattooTypes.${index}.baseTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo Base (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="bg-background border-border"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {form.watch("tattooTypes").length === 0 && (
        <Card className="border-dashed border-border">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Nenhum tipo de tatuagem cadastrado
            </p>
            <Button
              type="button"
              onClick={addNewType}
              variant="outline"
              size="sm"
              className="border-border"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Adicionar Primeiro Tipo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
