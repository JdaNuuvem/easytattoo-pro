"use client";

import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormValues, pricingConfigSchema } from "./schema";
import { PriceTableTab } from "./tabs/PriceTableTab";
import { BodyLocationsTab } from "./tabs/BodyLocationsTab";
import { ShadingOptionsTab } from "./tabs/ShadingOptionsTab";
import { ColorOptionsTab } from "./tabs/ColorOptionsTab";
import { TattooTypesTab } from "./tabs/TattooTypesTab";
import { GeneralSettingsTab } from "./tabs/GeneralSettingsTab";
import { Save } from "lucide-react";
import api from "@/lib/api";

const defaultValues: FormValues = {
  baseSmallTattooPrice: 150,
  baseSmallTattooTime: 0.5,
  priceTable: [
    { id: "pt-0", type: "drawing", width: 4, height: 4, additionalPrice: 150, additionalTime: 0.5 },
    { id: "pt-1", type: "drawing", width: 5, height: 5, additionalPrice: 147, additionalTime: 0.5 },
    { id: "pt-2", type: "drawing", width: 6, height: 6, additionalPrice: 177, additionalTime: 0.5 },
    { id: "pt-3", type: "drawing", width: 7, height: 7, additionalPrice: 197, additionalTime: 1 },
    { id: "pt-4", type: "drawing", width: 8, height: 8, additionalPrice: 207, additionalTime: 1.5 },
    { id: "pt-5", type: "drawing", width: 9, height: 9, additionalPrice: 227, additionalTime: 1.5 },
    { id: "pt-6", type: "drawing", width: 10, height: 10, additionalPrice: 247, additionalTime: 1.5 },
    { id: "pt-7", type: "drawing", width: 11, height: 11, additionalPrice: 307, additionalTime: 2.5 },
    { id: "pt-8", type: "drawing", width: 12, height: 12, additionalPrice: 357, additionalTime: 2.5 },
    { id: "pt-9", type: "drawing", width: 13, height: 13, additionalPrice: 427, additionalTime: 3.5 },
    { id: "pt-10", type: "drawing", width: 14, height: 14, additionalPrice: 487, additionalTime: 4.5 },
    { id: "pt-11", type: "drawing", width: 15, height: 15, additionalPrice: 557, additionalTime: 5 },
    { id: "pt-12", type: "drawing", width: 16, height: 16, additionalPrice: 647, additionalTime: 5.5 },
    { id: "pt-13", type: "drawing", width: 17, height: 17, additionalPrice: 727, additionalTime: 5.5 },
    { id: "pt-14", type: "drawing", width: 18, height: 18, additionalPrice: 817, additionalTime: 6.5 },
    { id: "pt-15", type: "drawing", width: 19, height: 19, additionalPrice: 897, additionalTime: 6.5 },
    { id: "pt-16", type: "drawing", width: 20, height: 20, additionalPrice: 987, additionalTime: 7 },
    { id: "pt-17", type: "drawing", width: 21, height: 21, additionalPrice: 1067, additionalTime: 7.5 },
    { id: "pt-18", type: "drawing", width: 24, height: 24, additionalPrice: 1157, additionalTime: 8 },
    { id: "pt-19", type: "drawing", width: 25, height: 25, additionalPrice: 1157, additionalTime: 8 },
    { id: "pt-20", type: "drawing", width: 26, height: 26, additionalPrice: 1207, additionalTime: 10 },
    { id: "pt-21", type: "drawing", width: 27, height: 27, additionalPrice: 1257, additionalTime: 10 },
    { id: "pt-22", type: "drawing", width: 28, height: 28, additionalPrice: 1307, additionalTime: 12 },
    { id: "pt-23", type: "drawing", width: 29, height: 29, additionalPrice: 1357, additionalTime: 12 },
    { id: "pt-24", type: "drawing", width: 30, height: 30, additionalPrice: 1407, additionalTime: 12 },
  ],
  bodyLocations: [
    { id: "bl-0", name: "Bracos", description: "Grupo 1 - Membros", additionalPrice: 0, additionalTime: 0 },
    { id: "bl-1", name: "Pernas", description: "Grupo 1 - Membros", additionalPrice: 0, additionalTime: 0 },
    { id: "bl-2", name: "Maos", description: "Grupo 1 - Membros", additionalPrice: 0, additionalTime: 0 },
    { id: "bl-3", name: "Pes", description: "Grupo 1 - Membros", additionalPrice: 0, additionalTime: 0 },
    { id: "bl-4", name: "Joelho", description: "Grupo 2 - Articulacoes/Cabeca", additionalPrice: 0, additionalTime: 0 },
    { id: "bl-5", name: "Cotovelo", description: "Grupo 2 - Articulacoes/Cabeca", additionalPrice: 0, additionalTime: 0 },
    { id: "bl-6", name: "Pescoco", description: "Grupo 2 - Articulacoes/Cabeca", additionalPrice: 0, additionalTime: 0 },
    { id: "bl-7", name: "Nuca", description: "Grupo 2 - Articulacoes/Cabeca", additionalPrice: 0, additionalTime: 0 },
    { id: "bl-8", name: "Rosto", description: "Grupo 2 - Articulacoes/Cabeca", additionalPrice: 0, additionalTime: 0 },
    { id: "bl-9", name: "Cabeca", description: "Grupo 2 - Articulacoes/Cabeca", additionalPrice: 0, additionalTime: 0 },
    { id: "bl-10", name: "Costas", description: "Grupo 3 - Tronco", additionalPrice: 0, additionalTime: 0 },
    { id: "bl-11", name: "Peito", description: "Grupo 3 - Tronco", additionalPrice: 0, additionalTime: 0 },
    { id: "bl-12", name: "Costela", description: "Grupo 3 - Tronco", additionalPrice: 0, additionalTime: 0 },
    { id: "bl-13", name: "Meio dos Seios", description: "Grupo 3 - Tronco", additionalPrice: 0, additionalTime: 0 },
    { id: "bl-14", name: "Partes Intimas", description: "Grupo 4 - Areas Especiais", additionalPrice: 0, additionalTime: 0 },
    { id: "bl-15", name: "Areas de fechamento", description: "Grupo 4 - Areas Especiais", additionalPrice: 0, additionalTime: 0 },
  ],
  shadingOptions: [
    { id: "sh-0", name: "Linhas simples", description: "Base - sem sombreamento", additionalPrice: 0, additionalTime: 0 },
    { id: "sh-1", name: "Sombreamento leve", description: "", additionalPrice: 0, additionalTime: 0 },
    { id: "sh-2", name: "Sombreamento medio", description: "", additionalPrice: 0, additionalTime: 0 },
    { id: "sh-3", name: "Sombreamento complexo", description: "", additionalPrice: 0, additionalTime: 0 },
  ],
  colorOptions: [
    { id: "co-0", name: "Preto e cinza", description: "Base", additionalPrice: 0, additionalTime: 0 },
    { id: "co-1", name: "1 cor adicional", description: "", additionalPrice: 0, additionalTime: 0 },
    { id: "co-2", name: "2 cores", description: "", additionalPrice: 0, additionalTime: 0 },
    { id: "co-3", name: "3 cores ou mais", description: "", additionalPrice: 0, additionalTime: 0 },
    { id: "co-4", name: "Tattoo toda colorida", description: "", additionalPrice: 0, additionalTime: 0 },
  ],
  tattooTypes: [],
  maxDailyTime: 8,
  fixedDeposit: 50,
};

// Transform API Record<string, number> to form array format
function recordToOptionArray(
  record: Record<string, number> | undefined
): Array<{ id: string; name: string; description: string; additionalPrice: number; additionalTime: number }> {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return Array.isArray(record) ? record : [];
  }
  return Object.entries(record).map(([name, multiplier]) => ({
    id: `item-${name}`,
    name,
    description: "",
    additionalPrice: typeof multiplier === "number" ? multiplier : 0,
    additionalTime: 0,
  }));
}

// Transform API Record<string, number> to tattoo types form array
function recordToTypeArray(
  record: Record<string, number> | undefined
): Array<{ id: string; name: string; description: string; basePrice: number; baseTime: number }> {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return Array.isArray(record) ? record : [];
  }
  return Object.entries(record).map(([name, multiplier]) => ({
    id: `type-${name}`,
    name,
    description: "",
    basePrice: typeof multiplier === "number" ? multiplier : 0,
    baseTime: 0,
  }));
}

// Transform API price table {width, height, price}[] to form format
function apiPriceTableToForm(
  table: Array<Record<string, any>> | undefined
): Array<{ id: string; type: "drawing" | "text"; width: number; height: number; additionalPrice: number; additionalTime: number }> {
  if (!table || !Array.isArray(table)) return [];
  return table.map((entry, i) => ({
    id: `pt-${i}`,
    type: (entry.type === "text" ? "text" : "drawing") as "drawing" | "text",
    width: entry.width ?? 0,
    height: entry.height ?? 0,
    additionalPrice: entry.price ?? entry.additionalPrice ?? 0,
    additionalTime: entry.time ?? entry.additionalTime ?? 0,
  }));
}

// Transform form arrays back to API format for saving
function optionArrayToRecord(
  arr: Array<{ name: string; additionalPrice: number }>
): Record<string, number> {
  const record: Record<string, number> = {};
  for (const item of arr) {
    if (item.name) record[item.name] = item.additionalPrice;
  }
  return record;
}

function typeArrayToRecord(
  arr: Array<{ name: string; basePrice: number }>
): Record<string, number> {
  const record: Record<string, number> = {};
  for (const item of arr) {
    if (item.name) record[item.name] = item.basePrice;
  }
  return record;
}

function formPriceTableToApi(
  arr: Array<{ type?: string; width: number; height: number; additionalPrice: number; additionalTime: number }>
): Array<{ type: string; width: number; height: number; price: number; time: number }> {
  return arr.map((entry) => ({
    type: entry.type ?? "drawing",
    width: entry.width,
    height: entry.height,
    price: entry.additionalPrice,
    time: entry.additionalTime,
  }));
}

export function PricingConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(pricingConfigSchema),
    defaultValues,
  });

  useEffect(() => {
    async function fetchPricing() {
      try {
        const response = await api.get("/pricing/me");
        const apiData = response.data;

        const formData: FormValues = {
          baseSmallTattooPrice: apiData.baseSmallTattooPrice ?? defaultValues.baseSmallTattooPrice,
          baseSmallTattooTime: apiData.baseSmallTattooTime ?? defaultValues.baseSmallTattooTime,
          priceTable: apiPriceTableToForm(apiData.priceTable),
          bodyLocations: recordToOptionArray(apiData.bodyLocations),
          shadingOptions: recordToOptionArray(apiData.shadingOptions),
          colorOptions: recordToOptionArray(apiData.colorOptions),
          tattooTypes: recordToTypeArray(apiData.tattooTypes),
          maxDailyTime: apiData.maxDailyTime ?? defaultValues.maxDailyTime,
          fixedDeposit: apiData.fixedDeposit ?? defaultValues.fixedDeposit,
        };

        form.reset(formData);
      } catch (error) {
        console.error("Erro ao carregar configuracao de precos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPricing();
  }, [form]);

  const onSubmit = async (data: FormValues) => {
    try {
      const apiData = {
        priceTable: formPriceTableToApi(data.priceTable),
        bodyLocations: optionArrayToRecord(data.bodyLocations),
        shadingOptions: optionArrayToRecord(data.shadingOptions),
        colorOptions: optionArrayToRecord(data.colorOptions),
        tattooTypes: typeArrayToRecord(data.tattooTypes),
        maxDailyTime: data.maxDailyTime,
        fixedDeposit: data.fixedDeposit,
      };

      await api.put("/pricing", apiData);
      toast({
        title: "Configuracao salva",
        description: "Suas alteracoes foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configuracoes.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <span className="text-muted-foreground animate-pulse">
          Carregando configuracoes...
        </span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-wider"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Alteracoes
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full bg-muted">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="priceTable">Tabela</TabsTrigger>
            <TabsTrigger value="bodyLocations">Locais</TabsTrigger>
            <TabsTrigger value="shadingOptions">Sombreamento</TabsTrigger>
            <TabsTrigger value="colorOptions">Cores</TabsTrigger>
            <TabsTrigger value="tattooTypes">Tipos</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <GeneralSettingsTab form={form} />
          </TabsContent>

          <TabsContent value="priceTable" className="mt-6">
            <PriceTableTab form={form} />
          </TabsContent>

          <TabsContent value="bodyLocations" className="mt-6">
            <BodyLocationsTab form={form} />
          </TabsContent>

          <TabsContent value="shadingOptions" className="mt-6">
            <ShadingOptionsTab form={form} />
          </TabsContent>

          <TabsContent value="colorOptions" className="mt-6">
            <ColorOptionsTab form={form} />
          </TabsContent>

          <TabsContent value="tattooTypes" className="mt-6">
            <TattooTypesTab form={form} />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
