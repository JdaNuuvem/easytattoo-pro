import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface DashboardState {
  isLoading: boolean;
  error: string | null;
}

interface DashboardActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  devtools((set) => ({
    isLoading: false,
    error: null,
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
  }))
);
