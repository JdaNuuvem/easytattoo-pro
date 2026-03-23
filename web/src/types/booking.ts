export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type TattooType = "DRAWING" | "TEXT";
export type ShadingType = "NONE" | "LIGHT" | "MEDIUM" | "REALISM";
export type ColorType = "BLACK" | "ONE_COLOR" | "TWO_COLORS" | "THREE_COLORS";
export type PromotionType = "NONE" | "MINI_PACK" | "SECOND_TATTOO";

export interface Booking {
  id: string;
  status: BookingStatus;
  clientId: string;
  client?: Client;
  userId: string;
  studioId?: string;
  tattooType: TattooType;
  tattooWidth: number;
  tattooHeight: number;
  shadingType: ShadingType;
  colorType: ColorType;
  bodyLocation: string;
  hasCompanion: boolean;
  description?: string;
  promotion: PromotionType;
  scheduledDate?: string;
  scheduledTime?: string;
  estimatedDuration?: number;
  totalPrice: number;
  depositAmount: number;
  depositPaid: boolean;
  paymentProof?: string;
  references?: BookingReference[];
  createdAt: string;
  updatedAt: string;
}

export interface BookingReference {
  id: string;
  bookingId: string;
  imageUrl: string;
  notes?: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  instagram?: string;
  createdAt: string;
}
