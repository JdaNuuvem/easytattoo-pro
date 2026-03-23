export type TattooType = "drawing" | "text" | "closure";
export type ShadingType = "none" | "light" | "medium" | "realism";
export type ColorType = "black" | "oneColor" | "twoColors" | "threeColors";

export interface PriceTableEntry {
  id: string;
  width: number;
  height: number;
  additionalPrice: number;
  additionalTime: number;
}

export interface BodyLocation {
  id: string;
  name: string;
  description: string;
  additionalPrice: number;
  additionalTime: number;
}

export interface ShadingOption {
  id: ShadingType;
  name: string;
  description: string;
  additionalPrice: number;
  additionalTime: number;
}

export interface ColorOption {
  id: ColorType;
  name: string;
  description: string;
  additionalPrice: number;
  additionalTime: number;
}

export interface TattooTypeOption {
  id: TattooType;
  name: string;
  description: string;
  basePrice: number;
  baseTime: number;
}

export interface MiniPackPrice {
  quantity: number;
  totalPrice: number;
  discountPercentage: number;
}

export interface SecondTattooDiscount {
  discountPercentage: number;
  minPurchaseAmount: number;
}

export interface PricingConfig {
  priceTable: PriceTableEntry[];
  bodyLocations: BodyLocation[];
  shadingOptions: ShadingOption[];
  colorOptions: ColorOption[];
  tattooTypes: TattooTypeOption[];
  maxDailyTime: number;
  fixedDeposit: number;
  miniPackPrices?: MiniPackPrice[];
  secondTattooDiscount?: SecondTattooDiscount;
}
