import { Image as ImageIcon, UploadCloud } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SettingsRegisterProps } from "@/pages/settings/ui/sections/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

export function SettingsGeneralSection({ register }: SettingsRegisterProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-muted px-6 py-4">
        <h2 className="text-lg font-semibold">{t("settings.generalTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("settings.generalDescription")}</p>
      </div>
      <div className="space-y-8 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Label className="pt-2 text-sm font-medium md:col-span-1">{t("settings.logoLabel")}</Label>
          <div className="flex items-start gap-6 md:col-span-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed bg-muted/30"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" type="button" className="gap-2"><UploadCloud className="h-4 w-4" />{t("settings.uploadLogo")}</Button>
                <Button variant="ghost" size="sm" type="button" className="text-destructive">{t("settings.removeLogo")}</Button>
              </div>
              <p className="text-xs text-muted-foreground">{t("settings.logoGuide")}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
          <Label htmlFor="site-name" className="text-sm font-medium md:col-span-1">{t("settings.serviceName")}</Label>
          <div className="md:col-span-3"><Input id="site-name" {...register("siteName")} /></div>
        </div>

        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
          <Label htmlFor="support-email" className="text-sm font-medium md:col-span-1">{t("settings.supportEmail")}</Label>
          <div className="md:col-span-3"><Input id="support-email" type="email" {...register("supportEmail")} /></div>
        </div>

        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
          <Label htmlFor="default-language" className="text-sm font-medium md:col-span-1">{t("settings.defaultLanguage")}</Label>
          <div className="max-w-xs md:col-span-3">
            <Select defaultValue="ko">
              <SelectTrigger id="default-language"><SelectValue placeholder={t("settings.selectLanguage")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ko">{t("settings.languages.ko")}</SelectItem>
                <SelectItem value="en">{t("settings.languages.en")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
