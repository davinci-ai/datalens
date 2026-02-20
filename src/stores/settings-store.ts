"use client";

import { create } from "zustand";

interface SettingsState {
  apiBaseUrl: string;
  authToken: string;
  modelName: string;
  setApiBaseUrl: (url: string) => void;
  setAuthToken: (token: string) => void;
  setModelName: (model: string) => void;
  isConfigured: () => boolean;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const STORAGE_KEY = "datalens-settings";

export const useSettingsStore = create<SettingsState>((set, get) => ({
  apiBaseUrl: "",
  authToken: "",
  modelName: "",

  setApiBaseUrl: (apiBaseUrl) => {
    set({ apiBaseUrl });
    get().saveToStorage();
  },

  setAuthToken: (authToken) => {
    set({ authToken });
    get().saveToStorage();
  },

  setModelName: (modelName) => {
    set({ modelName });
    get().saveToStorage();
  },

  isConfigured: () => {
    const state = get();
    return !!(state.apiBaseUrl && state.authToken && state.modelName);
  },

  loadFromStorage: () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { apiBaseUrl, authToken, modelName } = JSON.parse(stored);
        set({
          apiBaseUrl: apiBaseUrl || "",
          authToken: authToken || "",
          modelName: modelName || "",
        });
      }
    } catch {
      // ignore corrupted storage
    }
  },

  saveToStorage: () => {
    if (typeof window === "undefined") return;
    const { apiBaseUrl, authToken, modelName } = get();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ apiBaseUrl, authToken, modelName })
    );
  },
}));
