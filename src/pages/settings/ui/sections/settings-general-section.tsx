import { useTranslation } from "react-i18next";
import { Input } from "@/shared/ui/input";
import type { SettingsRegisterProps } from "@/pages/settings/ui/sections/types";

export function SettingsGeneralSection({ register }: SettingsRegisterProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-muted px-6 py-4">
        <h2 className="text-lg font-semibold">{t("settings.generalTitle")}</h2>
      </div>
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
          <label className="text-sm font-medium md:col-span-1">{t("settings.serviceName")}</label>
          <div className="md:col-span-3">
            <Input {...register("siteName")} />
          </div>
        </div>
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
          <label className="text-sm font-medium md:col-span-1">{t("settings.supportEmail")}</label>
          <div className="md:col-span-3">
            <Input type="email" {...register("supportEmail")} />
          </div>
        </div>
      </div>
    </div>
  );
}
