import * as z from "zod";

export const priceTableEntrySchema = z.object({
  id: z.string(),
  width: z
    .number()
    .min(1, "Largura minima e 1cm")
    .max(30, "Largura maxima e 30cm"),
  height: z
    .number()
    .min(1, "Altura minima e 1cm")
    .max(30, "Altura maxima e 30cm"),
  additionalPrice: z.number().min(0, "Preco nao pode ser negativo"),
  additionalTime: z.number().min(0, "Tempo nao pode ser negativo"),
});

export const bodyLocationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome e obrigatorio"),
  description: z.string(),
  additionalPrice: z.number().min(0, "Preco nao pode ser negativo"),
  additionalTime: z.number().min(0, "Tempo nao pode ser negativo"),
});

export const shadingOptionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome e obrigatorio"),
  description: z.string(),
  additionalPrice: z.number().min(0, "Preco nao pode ser negativo"),
  additionalTime: z.number().min(0, "Tempo nao pode ser negativo"),
});

export const colorOptionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome e obrigatorio"),
  description: z.string(),
  additionalPrice: z.number().min(0, "Preco nao pode ser negativo"),
  additionalTime: z.number().min(0, "Tempo nao pode ser negativo"),
});

export const tattooTypeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome e obrigatorio"),
  description: z.string(),
  basePrice: z.number().min(0, "Preco nao pode ser negativo"),
  baseTime: z.number().min(0, "Tempo nao pode ser negativo"),
});

export const pricingConfigSchema = z.object({
  baseSmallTattooPrice: z.number().min(0, "Preco base nao pode ser negativo"),
  baseSmallTattooTime: z.number().min(0, "Tempo base nao pode ser negativo"),
  priceTable: z.array(priceTableEntrySchema),
  bodyLocations: z.array(bodyLocationSchema),
  shadingOptions: z.array(shadingOptionSchema),
  colorOptions: z.array(colorOptionSchema),
  tattooTypes: z.array(tattooTypeSchema),
  maxDailyTime: z
    .number()
    .min(0, "Tempo maximo diario nao pode ser negativo"),
  fixedDeposit: z
    .number()
    .min(0, "Valor do sinal nao pode ser negativo"),
});

export type FormValues = z.infer<typeof pricingConfigSchema>;
