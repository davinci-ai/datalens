"use client";

import { create } from "zustand";
import type { DataProfile } from "@/types/dataset";

interface DatasetState {
  profile: DataProfile | null;
  isLoading: boolean;
  error: string | null;
  setProfile: (profile: DataProfile) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useDatasetStore = create<DatasetState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,
  setProfile: (profile) => set({ profile, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ profile: null, isLoading: false, error: null }),
}));
