export const STEPS = [
  "artist",
  "ageTerms",
  "companion",
  "type",
  "size",
  "shading",
  "color",
  "location",
  "references",
  "promotion",
  "scheduling",
  "personal",
  "payment",
] as const;

export type BookingStep = (typeof STEPS)[number];
