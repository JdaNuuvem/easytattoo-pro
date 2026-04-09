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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../schema";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Plus, Trash2, Pen, Type } from "lucide-react";
import { PriceTableEntryType } from "@/components/booking/pricing/types";

interface PriceTableTabProps {
  form: UseFormReturn<FormValues>;
}

export function PriceTableTab({ form }: PriceTableTabProps) {
  const [idCounter, setIdCounter] = useState(0);
  const [activeType, setActiveType] = useState<PriceTableEntryType>("drawing");

  const isText = activeType === "text";

  const allEntries = form.watch("priceTable");
  const filteredIndices = allEntries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => (entry.type ?? "drawing") === activeType);

  const addNewSize = () => {
    const currentPriceTable = form.getValues("priceTable");
    const newId = `new-${Date.now()}-${idCounter}`;
    setIdCounter((prev) => prev + 1);
    form.setValue("priceTable", [
      ...currentPriceTable,
      {
        id: newId,
        type: activeType,
        width: 5,
        height: isText ? 0 : 5,
        additionalPrice: 0,
        additionalTime: 0,
      },
    ]);
  };

  const removeSize = (index: number) => {
    const currentTable = form.getValues("priceTable");
    form.setValue(
      "priceTable",
      currentTable.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-6">
      {/* Type Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={activeType === "drawing" ? "default" : "outline"}
          onClick={() => setActiveType("drawing")}
          className="flex items-center gap-2"
        >
          <Pen className="w-4 h-4" />
          Desenho
        </Button>
        <Button
          type="button"
          variant={activeType === "text" ? "default" : "outline"}
          onClick={() => setActiveType("text")}
          className="flex items-center gap-2"
        >
          <Type className="w-4 h-4" />
          Escrita
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">
            {isText
              ? "Precos por Largura (Escrita/Texto)"
              : "Precos por Tamanho (Desenho)"}
          </CardTitle>
          <Button
            type="button"
            onClick={addNewSize}
            variant="outline"
            size="sm"
            className="border-border"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Tamanho
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                {!isText && <TableHead>Altura (cm)</TableHead>}
                <TableHead>Largura (cm)</TableHead>
                <TableHead>Preco (R$)</TableHead>
                <TableHead>Tempo (h)</TableHead>
                <TableHead className="w-[80px]">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIndices.map(({ entry, index }) => (
                <TableRow key={entry.id || index} className="border-border">
                  {!isText && (
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`priceTable.${index}.height`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                                className="bg-background border-border w-20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`priceTable.${index}.width`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              className="bg-background border-border w-20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`priceTable.${index}.additionalPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              className="bg-background border-border w-24"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`priceTable.${index}.additionalTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              className="bg-background border-border w-20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSize(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredIndices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isText ? 4 : 5} className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Nenhum tamanho configurado para {isText ? "escrita" : "desenho"}. Clique em &quot;Adicionar Tamanho&quot; para comecar.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
