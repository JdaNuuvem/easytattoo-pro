import { PricingConfig, PriceTableEntry } from "./types";
import { BookingState } from "@/stores/booking";

export interface PriceCalculation {
  basePrice: number;
  locationPrice: number;
  colorPrice: number;
  shadingPrice: number;
  totalPrice: number;
  baseTime: number;
  locationTime: number;
  colorTime: number;
  shadingTime: number;
  totalTime: number;
  numberOfSessions: number;
  depositAmount: number;
}

export function interpolatePrice(
  width: number,
  height: number,
  priceTable: PriceTableEntry[]
): { price: number; time: number } {
  const requestedArea = width * height;

  const sortedTable = [...priceTable].sort((a, b) => {
    const aArea = a.width * a.height;
    const bArea = b.width * b.height;
    const aDiff = Math.abs(aArea - requestedArea);
    const bDiff = Math.abs(bArea - requestedArea);
    return aDiff - bDiff;
  });

  const size1 = sortedTable[0];
  const size2 = sortedTable[1];

  const area1 = size1.width * size1.height;
  const area2 = size2.width * size2.height;

  const d1 = Math.abs(area1 - requestedArea);
  const d2 = Math.abs(area2 - requestedArea);

  const w1 = 1 / (d1 + 0.0001);
  const w2 = 1 / (d2 + 0.0001);
  const totalWeight = w1 + w2;

  const price =
    (w1 * size1.additionalPrice + w2 * size2.additionalPrice) / totalWeight;
  const time =
    (w1 * size1.additionalTime + w2 * size2.additionalTime) / totalWeight;

  return {
    price: Math.round(price * (requestedArea / Math.max(area1, area2))),
    time: Math.round(time * (requestedArea / Math.max(area1, area2))),
  };
}

export function calculatePrice(
  config: Partial<BookingState["tattooDetails"]>,
  pricingConfig: PricingConfig
): PriceCalculation {
  const typeOption = config.type
    ? pricingConfig.tattooTypes.find((t) => t.id === config.type)
    : null;
  const basePrice = typeOption?.basePrice || 0;
  const baseTime = typeOption?.baseTime || 0;

  let sizePrice = 0;
  let sizeTime = 0;

  if (config.size?.width && config.size?.height) {
    if (config.size.width <= 5 && config.size.height <= 5) {
      const smallSizeEntry = pricingConfig.priceTable.find(
        (entry) => entry.width === 5 && entry.height === 5
      );
      sizePrice = smallSizeEntry?.additionalPrice || 0;
      sizeTime = smallSizeEntry?.additionalTime || 0;
    } else {
      const interpolated = interpolatePrice(
        config.size.width,
        config.size.height,
        pricingConfig.priceTable
      );
      sizePrice = interpolated.price;
      sizeTime = interpolated.time;
    }
  }

  const location = config.bodyLocation
    ? pricingConfig.bodyLocations.find((loc) => loc.id === config.bodyLocation)
    : null;
  const locationPrice = location?.additionalPrice || 0;
  const locationTime = location?.additionalTime || 0;

  const colorOption = config.colors
    ? pricingConfig.colorOptions.find((c) => c.id === config.colors)
    : null;
  const colorPrice = colorOption?.additionalPrice || 0;
  const colorTime = colorOption?.additionalTime || 0;

  const shadingOption = config.shading
    ? pricingConfig.shadingOptions.find((s) => s.id === config.shading)
    : null;
  const shadingPrice = shadingOption?.additionalPrice || 0;
  const shadingTime = shadingOption?.additionalTime || 0;

  const totalPrice =
    basePrice + sizePrice + locationPrice + colorPrice + shadingPrice;
  const totalTime =
    baseTime + sizeTime + locationTime + colorTime + shadingTime;

  const numberOfSessions = Math.ceil(totalTime / pricingConfig.maxDailyTime);

  const depositAmount = pricingConfig.fixedDeposit;

  return {
    basePrice,
    locationPrice,
    colorPrice,
    shadingPrice,
    totalPrice,
    baseTime,
    locationTime,
    colorTime,
    shadingTime,
    totalTime,
    numberOfSessions,
    depositAmount,
  };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h${remainingMinutes}min`;
}
