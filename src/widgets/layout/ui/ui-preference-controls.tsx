import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useUiPreferencesStore, type LanguageCode } from "@/features/preferences/model/ui-preferences-store";
import { i18n } from "@/shared/i18n/config";

export function UiPreferenceControls() {
  const { t } = useTranslation();
  const language = useUiPreferencesStore((state) => state.language);
  const setLanguage = useUiPreferencesStore((state) => state.setLanguage);
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    void i18n.changeLanguage(language);
  }, [language]);

  const currentTheme = theme === "light" || theme === "dark" || theme === "system" ? theme : "system";

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground sm:gap-2">
        <span className="hidden md:inline">{t("common.language.label")}</span>
        <span className="sr-only md:hidden">{t("common.language.label")}</span>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value as LanguageCode)}
          className="h-8 w-[92px] rounded-md border border-input bg-background px-2 text-xs text-foreground sm:w-[120px]"
          aria-label={t("common.language.label")}
        >
          <option value="ko">{t("common.language.ko")}</option>
          <option value="en">{t("common.language.en")}</option>
        </select>
      </label>
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground sm:gap-2">
        <span className="hidden md:inline">{t("common.theme.label")}</span>
        <span className="sr-only md:hidden">{t("common.theme.label")}</span>
        <select
          value={currentTheme}
          onChange={(event) => setTheme(event.target.value)}
          className="h-8 w-[92px] rounded-md border border-input bg-background px-2 text-xs text-foreground sm:w-[120px]"
          aria-label={t("common.theme.label")}
        >
          <option value="light">{t("common.theme.light")}</option>
          <option value="dark">{t("common.theme.dark")}</option>
          <option value="system">{t("common.theme.system")}</option>
        </select>
      </label>
    </div>
  );
}
