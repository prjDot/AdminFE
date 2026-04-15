import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Settings2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useUiPreferencesStore, type LanguageCode, type ThemeMode } from "@/features/preferences/model/ui-preferences-store";
import { i18n } from "@/shared/i18n/config";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export function SettingsPage() {
  const { t } = useTranslation();
  const language = useUiPreferencesStore((state) => state.language);
  const setLanguage = useUiPreferencesStore((state) => state.setLanguage);
  const theme = useUiPreferencesStore((state) => state.theme);
  const setTheme = useUiPreferencesStore((state) => state.setTheme);
  const { setTheme: setNextTheme } = useTheme();

  useEffect(() => {
    void i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    setNextTheme(theme);
  }, [setNextTheme, theme]);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      siteName: "PawGen",
      supportEmail: "support@pawgen.com",
      fcmServerKey: "AAAAxxxxxxxxxxxxxxxxxxxxxxx",
      apiEndpoint: "https://openapi.animal.go.kr/openapi/service/rest",
    }
  });

  const onSubmit = (data: any) => {
    console.log("Settings saved:", data);
    alert(t("common.actions.saveChanges"));
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Settings2 className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("settings.description")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="bg-muted px-6 py-4 border-b">
            <h2 className="font-semibold text-lg">{t("sidebar.settings")}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium md:col-span-1">{t("common.theme.label")}</label>
              <div className="md:col-span-3">
                <select
                  value={theme}
                  onChange={(event) => setTheme(event.target.value as ThemeMode)}
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
        
        {/* General Settings */}
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="bg-muted px-6 py-4 border-b">
            <h2 className="font-semibold text-lg">{t("settings.generalTitle")}</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium md:col-span-1">{t("settings.serviceName")}</label>
              <div className="md:col-span-3">
                <Input {...register("siteName")} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium md:col-span-1">{t("settings.supportEmail")}</label>
              <div className="md:col-span-3">
                <Input type="email" {...register("supportEmail")} />
              </div>
            </div>
          </div>
        </div>

        {/* Integration Settings */}
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="bg-muted px-6 py-4 border-b">
            <h2 className="font-semibold text-lg">{t("settings.integrationTitle")}</h2>
            <p className="text-xs text-muted-foreground mt-1">{t("settings.integrationDesc")}</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium md:col-span-1">{t("settings.fcmServerKey")}</label>
              <div className="md:col-span-3">
                <Input type="password" {...register("fcmServerKey")} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium md:col-span-1">{t("settings.shelterApiUrl")}</label>
              <div className="md:col-span-3">
                <Input {...register("apiEndpoint")} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Code Management (Mock representation) */}
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="bg-muted px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-lg">{t("settings.baseDataTitle")}</h2>
            <Button variant="outline" size="sm">{t("common.actions.editMode")}</Button>
          </div>
          <div className="p-6 space-y-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-muted-foreground">{t("settings.animalTypes")}</span>
              <span>1,204 entries</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium text-muted-foreground">{t("settings.regionCodes")}</span>
              <span>256 entries</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="font-medium text-muted-foreground">{t("settings.noticeStatusLabels")}</span>
              <span>4 entries</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">{t("common.actions.cancel")}</Button>
          <Button type="submit" className="gap-2"><Save className="w-4 h-4" /> {t("common.actions.saveChanges")}</Button>
        </div>
      </form>
    </div>
  );
}
