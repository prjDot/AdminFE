import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "@/shared/i18n/locales/en/common.json";
import koCommon from "@/shared/i18n/locales/ko/common.json";

export const I18N_STORAGE_KEY = "paw-admin-language";

const getBrowserLanguage = (): "ko" | "en" => {
  if (typeof navigator === "undefined") {
    return "ko";
  }

  const language = navigator.language?.toLowerCase() ?? "";
  return language.startsWith("ko") ? "ko" : "en";
};

const getInitialLanguage = (): "ko" | "en" => {
  if (typeof window === "undefined") {
    return "ko";
  }

  const saved = window.localStorage.getItem(I18N_STORAGE_KEY);
  if (saved === "ko" || saved === "en") {
    return saved;
  }

  return getBrowserLanguage();
};

const resources = {
  ko: { translation: koCommon },
  en: { translation: enCommon },
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "ko",
  interpolation: {
    escapeValue: false,
  },
});

if (typeof window !== "undefined") {
  i18n.on("languageChanged", (language) => {
    window.localStorage.setItem(I18N_STORAGE_KEY, language);
  });
}

export { i18n };
