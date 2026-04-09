export type TattooType = "drawing" | "text" | "closure";
export type ShadingType = "none" | "light" | "medium" | "realism";
export type ColorType = "black" | "oneColor" | "twoColors" | "threeColors";

export type PriceTableEntryType = "drawing" | "text";

export interface PriceTableEntry {
  id: string;
  type: PriceTableEntryType;
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
  parentId?: string;
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

export interface PricingConfig {
  priceTable: PriceTableEntry[];
  bodyLocations: BodyLocation[];
  shadingOptions: ShadingOption[];
  colorOptions: ColorOption[];
  tattooTypes: TattooTypeOption[];
  maxDailyTime: number;
  fixedDeposit: number;
}
