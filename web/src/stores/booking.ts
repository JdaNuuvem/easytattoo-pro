import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { PriceCalculation, calculatePrice } from "../components/booking/pricing/calculator";
import { mockPricingConfig } from "../components/booking/pricing/mockData";
import {
  TattooType,
  ShadingType,
  ColorType,
  PricingConfig,
} from "../components/booking/pricing/types";
import { STEPS } from "./bookingStateMachine";

export type PromotionType = "none" | "mini-pack" | "second-tattoo";

export interface BookingState {
  currentStep: number;
  maxStep: number;
  pricingConfig: PricingConfig;
  artistInfo: {
    id: string;
    name: string;
    photo: string;
    description: string;
    styles: Array<string>;
    portfolio: Array<string>;
    phone?: string;
    pixKey?: string;
    pixName?: string;
    pixBank?: string;
    acceptsCompanion?: boolean;
    maxCompanions?: number;
    paymentMethods?: string[];
    studios?: Array<{ id: string; name: string; address?: string }>;
  } | null;
  personalInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    instagram: string | "";
    birthDate: string;
  };
  geolocation: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    country: string;
  } | null;
  companion: {
    hasCompanion: boolean;
    companionCount: number;
    companionPurpose?: "just-watching" | "will-tattoo";
    studioLocation: string;
  };
  tattooDetails: {
    type: TattooType | undefined;
    size: {
      width: number;
      height: number;
    };
    shading: ShadingType | undefined;
    colors: ColorType | undefined;
    bodyLocation: string;
    references: Array<string>;
    description: string;
  };
  promotion: {
    type: PromotionType;
  };
  scheduling: {
    date: string;
    time: string;
  };
  payment: {
    proofOfPayment: string;
  };
  priceCalculation: PriceCalculation | null;
}

interface BookingActions {
  setStep: (step: number) => void;
  updateArtistInfo: (info: BookingState["artistInfo"]) => void;
  updatePersonalInfo: (info: BookingState["personalInfo"]) => void;
  updateGeolocation: (geo: BookingState["geolocation"]) => void;
  updateCompanion: (info: BookingState["companion"]) => void;
  updateTattooDetails: (info: Partial<BookingState["tattooDetails"]>) => void;
  updatePromotion: (info: BookingState["promotion"]) => void;
  updateScheduling: (info: BookingState["scheduling"]) => void;
  updatePayment: (info: BookingState["payment"]) => void;
  updatePricingConfig: (config: PricingConfig) => void;
  reset: () => void;
}

const initialState: BookingState = {
  currentStep: 0,
  maxStep: STEPS.length - 1,
  pricingConfig: mockPricingConfig,
  artistInfo: null,
  personalInfo: {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    instagram: "",
    birthDate: "",
  },
  geolocation: null,
  companion: {
    hasCompanion: false,
    companionCount: 0,
    companionPurpose: undefined,
    studioLocation: "",
  },
  tattooDetails: {
    type: undefined,
    size: {
      width: 0,
      height: 0,
    },
    shading: undefined,
    colors: undefined,
    bodyLocation: "",
    references: [],
    description: "",
  },
  promotion: {
    type: "none",
  },
  scheduling: {
    date: "",
    time: "",
  },
  payment: {
    proofOfPayment: "",
  },
  priceCalculation: calculatePrice({}, mockPricingConfig),
};

export const useBookingStore = create<BookingState & BookingActions>()(
  devtools((set) => ({
    ...initialState,
    setStep: (step) => set({ currentStep: step }),
    updateArtistInfo: (info) => set({ artistInfo: info }),
    updatePersonalInfo: (info) => set({ personalInfo: info }),
    updateGeolocation: (geo) => set({ geolocation: geo }),
    updateCompanion: (info) => set({ companion: info }),
    updateTattooDetails: (details) =>
      set((state) => {
        const updatedDetails = {
          ...state.tattooDetails,
          ...details,
        };

        const priceCalculation = state.pricingConfig
          ? calculatePrice(updatedDetails, state.pricingConfig)
          : null;

        return {
          ...state,
          tattooDetails: updatedDetails,
          priceCalculation,
        };
      }),
    updatePromotion: (info) => set({ promotion: info }),
    updateScheduling: (info) => set({ scheduling: info }),
    updatePayment: (info) => set({ payment: info }),
    updatePricingConfig: (config) => set({ pricingConfig: config }),
    reset: () => set(initialState),
  }))
);
