"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pencil, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface PricingOptionCardProps {
  id: string;
  index: number;
  form: UseFormReturn<any>;
  fieldNamePrefix: string;
  onDelete?: (index: number) => void;
}

export function PricingOptionCard({
  id,
  index,
  form,
  fieldNamePrefix,
  onDelete,
}: PricingOptionCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const name = form.watch(`${fieldNamePrefix}.${index}.name`);
  const description = form.watch(`${fieldNamePrefix}.${index}.description`);
  const additionalPrice = form.watch(
    `${fieldNamePrefix}.${index}.additionalPrice`
  );
  const additionalTime = form.watch(
    `${fieldNamePrefix}.${index}.additionalTime`
  );

  return (
    <Card className="relative group border-border hover:border-primary/20 transition-colors">
      {isEditing ? (
        <>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start gap-2">
              <FormField
                control={form.control}
                name={`${fieldNamePrefix}.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        className="text-lg font-semibold bg-background border-border"
                        placeholder="Nome"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(false)}
                  className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name={`${fieldNamePrefix}.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Descricao"
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
                name={`${fieldNamePrefix}.${index}.additionalPrice`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preco Adicional</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          R$
                        </span>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="pl-9 bg-background border-border"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`${fieldNamePrefix}.${index}.additionalTime`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo Adicional</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                          className="pr-12 bg-background border-border"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          min
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold font-mono uppercase tracking-wider">
                {name || "Sem nome"}
              </h3>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                {onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(index)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {description || "Sem descricao"}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Preco Adicional
                </p>
                <p className="text-sm font-medium text-primary">
                  R$ {additionalPrice}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Tempo Adicional
                </p>
                <p className="text-sm font-medium">{additionalTime} min</p>
              </div>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}
