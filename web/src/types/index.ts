export type {
  BookingStatus,
  TattooType as BookingTattooType,
  ShadingType as BookingShadingType,
  ColorType as BookingColorType,
  PromotionType,
  Booking,
  BookingReference,
  Client,
} from "./booking";

export type {
  TattooType as PricingTattooType,
  ShadingType as PricingShadingType,
  ColorType as PricingColorType,
  PriceTableEntry,
  BodyLocation,
  ShadingOption,
  ColorOption,
  TattooTypeOption,
  MiniPackPrice,
  SecondTattooDiscount,
  PricingConfig,
} from "./pricing";

export type {
  User,
  Studio,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "./auth";
