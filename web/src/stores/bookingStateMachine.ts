export const STEPS = [
  "artist",
  "personal",
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
  "payment",
] as const;

export type BookingStep = (typeof STEPS)[number];
