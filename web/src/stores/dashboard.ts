import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type ArtistProfile = {
  name: string;
  email: string;
  password: string;
  document: string;
  phone: string;
  photo: string;
  description: string;
  instagram: string;
  pixKey: string;
  depositAmount: number;
  styles: string[];
  colorPreference: string;
  workingHours: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isWorking: boolean;
  }[];
};

interface DashboardState {
  profile: ArtistProfile;
  isLoading: boolean;
  error: string | null;
}

interface DashboardActions {
  updateProfile: (profile: Partial<ArtistProfile>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState: DashboardState = {
  profile: {
    photo: "",
    description: "",
    instagram: "",
    name: "",
    email: "",
    password: "",
    document: "",
    phone: "",
    pixKey: "",
    depositAmount: 0,
    styles: [],
    colorPreference: "only-black",
    workingHours: Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      startTime: "09:00",
      endTime: "18:00",
      isWorking: i < 5, // Mon-Fri working by default
    })),
  },
  isLoading: false,
  error: null,
};

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        updateProfile: (profile) =>
          set((state) => ({
            profile: { ...state.profile, ...profile },
          })),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
      }),
      { name: "dashboard-storage" }
    )
  )
);
