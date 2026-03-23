/**
 * Tattoo pricing calculator.
 *
 * Uses bilinear interpolation on a price table grid keyed by
 * (width, height) breakpoints, then applies multipliers for
 * body location, shading, color, tattoo type, and promotions.
 */

interface PriceTableEntry {
  readonly width: number;
  readonly height: number;
  readonly price: number;
}

interface CalculateInput {
  readonly priceTable: PriceTableEntry[];
  readonly bodyLocations: Record<string, number>;
  readonly shadingOptions: Record<string, number>;
  readonly colorOptions: Record<string, number>;
  readonly tattooTypes: Record<string, number>;
  readonly depositPercentage: number;
  readonly miniPackPrice?: number | null;
  readonly secondTattooDiscount?: number | null;
  readonly tattooWidth: number;
  readonly tattooHeight: number;
  readonly bodyLocation: string;
  readonly shadingType: string;
  readonly colorType: string;
  readonly tattooType: string;
  readonly promotion: string;
}

export interface CalculateResult {
  readonly basePrice: number;
  readonly locationMultiplier: number;
  readonly shadingMultiplier: number;
  readonly colorMultiplier: number;
  readonly typeMultiplier: number;
  readonly subtotal: number;
  readonly promotionDiscount: number;
  readonly totalPrice: number;
  readonly depositPercentage: number;
  readonly depositAmount: number;
}

/**
 * Linearly interpolate between two values.
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolate price from the price table grid.
 *
 * The price table is a flat list of {width, height, price} entries that
 * forms a grid. We find the surrounding 4 entries and bilinearly
 * interpolate based on the requested width/height.
 */
function interpolatePrice(
  priceTable: PriceTableEntry[],
  width: number,
  height: number,
): number {
  if (!priceTable || priceTable.length === 0) {
    return 0;
  }

  // Extract unique sorted breakpoints
  const widths = [...new Set(priceTable.map((e) => e.width))].sort(
    (a, b) => a - b,
  );
  const heights = [...new Set(priceTable.map((e) => e.height))].sort(
    (a, b) => a - b,
  );

  // Clamp to grid bounds
  const clampedW = Math.max(widths[0], Math.min(width, widths[widths.length - 1]));
  const clampedH = Math.max(heights[0], Math.min(height, heights[heights.length - 1]));

  // Find surrounding breakpoints for width
  let wLow = widths[0];
  let wHigh = widths[widths.length - 1];
  for (let i = 0; i < widths.length - 1; i++) {
    if (clampedW >= widths[i] && clampedW <= widths[i + 1]) {
      wLow = widths[i];
      wHigh = widths[i + 1];
      break;
    }
  }

  // Find surrounding breakpoints for height
  let hLow = heights[0];
  let hHigh = heights[heights.length - 1];
  for (let i = 0; i < heights.length - 1; i++) {
    if (clampedH >= heights[i] && clampedH <= heights[i + 1]) {
      hLow = heights[i];
      hHigh = heights[i + 1];
      break;
    }
  }

  // Lookup helper
  const lookup = (w: number, h: number): number => {
    const entry = priceTable.find((e) => e.width === w && e.height === h);
    return entry ? entry.price : 0;
  };

  // Four corner values
  const q11 = lookup(wLow, hLow);
  const q12 = lookup(wLow, hHigh);
  const q21 = lookup(wHigh, hLow);
  const q22 = lookup(wHigh, hHigh);

  // Interpolation factors (0..1)
  const tW = wHigh === wLow ? 0 : (clampedW - wLow) / (wHigh - wLow);
  const tH = hHigh === hLow ? 0 : (clampedH - hLow) / (hHigh - hLow);

  // Bilinear interpolation
  const r1 = lerp(q11, q21, tW);
  const r2 = lerp(q12, q22, tW);
  return lerp(r1, r2, tH);
}

/**
 * Full price calculation with all multipliers and promotions.
 */
export function calculateTattooPrice(input: CalculateInput): CalculateResult {
  const basePrice = interpolatePrice(
    input.priceTable,
    input.tattooWidth,
    input.tattooHeight,
  );

  const locationMultiplier =
    input.bodyLocations[input.bodyLocation] ?? 1.0;
  const shadingMultiplier =
    input.shadingOptions[input.shadingType] ?? 1.0;
  const colorMultiplier =
    input.colorOptions[input.colorType] ?? 1.0;
  const typeMultiplier =
    input.tattooTypes[input.tattooType] ?? 1.0;

  const subtotal =
    basePrice *
    locationMultiplier *
    shadingMultiplier *
    colorMultiplier *
    typeMultiplier;

  // Apply promotions
  let promotionDiscount = 0;
  let totalPrice = subtotal;

  if (input.promotion === 'MINI_PACK' && input.miniPackPrice != null) {
    totalPrice = input.miniPackPrice;
    promotionDiscount = subtotal - input.miniPackPrice;
  } else if (
    input.promotion === 'SECOND_TATTOO' &&
    input.secondTattooDiscount != null
  ) {
    promotionDiscount = subtotal * (input.secondTattooDiscount / 100);
    totalPrice = subtotal - promotionDiscount;
  }

  // Ensure non-negative
  totalPrice = Math.max(0, Math.round(totalPrice * 100) / 100);
  promotionDiscount = Math.max(
    0,
    Math.round(promotionDiscount * 100) / 100,
  );

  const depositAmount = Math.round(
    totalPrice * (input.depositPercentage / 100) * 100,
  ) / 100;

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    locationMultiplier,
    shadingMultiplier,
    colorMultiplier,
    typeMultiplier,
    subtotal: Math.round(subtotal * 100) / 100,
    promotionDiscount,
    totalPrice,
    depositPercentage: input.depositPercentage,
    depositAmount,
  };
}
