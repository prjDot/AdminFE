import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { useUiPreferencesStore, type LanguageCode } from "@/features/preferences/model/ui-preferences-store";

export function SettingsPreferencesSection() {
  const { t } = useTranslation();
  const language = useUiPreferencesStore((state) => state.language);
  const setLanguage = useUiPreferencesStore((state) => state.setLanguage);
  const { setTheme, theme } = useTheme();
  const currentTheme = theme === "light" || theme === "dark" || theme === "system" ? theme : "system";

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-muted px-6 py-4">
        <h2 className="text-lg font-semibold">{t("sidebar.settings")}</h2>
      </div>
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
          <label className="text-sm font-medium md:col-span-1">{t("common.language.label")}</label>
          <div className="md:col-span-3">
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as LanguageCode)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="ko">{t("common.language.ko")}</option>
              <option value="en">{t("common.language.en")}</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
          <label className="text-sm font-medium md:col-span-1">{t("common.theme.label")}</label>
          <div className="md:col-span-3">
            <select
              value={currentTheme}
              onChange={(event) => setTheme(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="light">{t("common.theme.light")}</option>
              <option value="dark">{t("common.theme.dark")}</option>
              <option value="system">{t("common.theme.system")}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
