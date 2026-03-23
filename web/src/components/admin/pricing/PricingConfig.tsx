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
  baseSmallTattooTime: 30,
  priceTable: [],
  bodyLocations: [],
  shadingOptions: [],
  colorOptions: [],
  tattooTypes: [],
  maxDailyTime: 480,
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
  table: Array<Record<string, number>> | undefined
): Array<{ id: string; width: number; height: number; additionalPrice: number; additionalTime: number }> {
  if (!table || !Array.isArray(table)) return [];
  return table.map((entry, i) => ({
    id: `pt-${i}`,
    width: entry.width ?? 0,
    height: entry.height ?? 0,
    additionalPrice: entry.price ?? entry.additionalPrice ?? 0,
    additionalTime: entry.additionalTime ?? 0,
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
  arr: Array<{ width: number; height: number; additionalPrice: number }>
): Array<{ width: number; height: number; price: number }> {
  return arr.map((entry) => ({
    width: entry.width,
    height: entry.height,
    price: entry.additionalPrice,
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
