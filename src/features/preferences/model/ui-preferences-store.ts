import { create } from "zustand";
import { persist } from "zustand/middleware";
import { I18N_STORAGE_KEY } from "@/shared/i18n/config";

export type ThemeMode = "light" | "dark" | "system";
export type LanguageCode = "ko" | "en";

interface UiPreferencesState {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
}

const getInitialLanguage = (): LanguageCode => {
  if (typeof window === "undefined") {
    return "ko";
  }

  const saved = window.localStorage.getItem(I18N_STORAGE_KEY);
  if (saved === "ko" || saved === "en") {
    return saved;
  }

  return navigator.language?.toLowerCase().startsWith("ko") ? "ko" : "en";
};

export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set) => ({
      language: getInitialLanguage(),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "paw-admin-ui-preferences",
    }
  )
);
