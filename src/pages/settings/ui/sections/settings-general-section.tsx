import { useTranslation } from "react-i18next";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import type { SettingsRegisterProps } from "@/pages/settings/ui/sections/types";

export function SettingsGeneralSection({ register }: SettingsRegisterProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-muted px-6 py-4">
        <h2 className="text-lg font-semibold">{t("settings.generalTitle")}</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure foundational settings of the platform.</p>
      </div>
      <div className="space-y-8 p-6">
        
        {/* Logo Upload Simulation */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <label className="text-sm font-medium md:col-span-1 pt-2">Platform Logo</label>
          <div className="md:col-span-3 flex items-start gap-6">
            <div className="h-20 w-20 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" type="button" className="gap-2">
                  <UploadCloud className="h-4 w-4" /> Upload Custom Logo
                </Button>
                <Button variant="ghost" size="sm" type="button" className="text-destructive">Remove</Button>
              </div>
              <p className="text-xs text-muted-foreground">Supported formats: PNG, JPG, SVG. Recommended size: 512x512px.</p>
            </div>
          </div>
        </div>

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

        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
          <label className="text-sm font-medium md:col-span-1">Default System Language</label>
          <div className="md:col-span-3 max-w-xs">
            <Select defaultValue="ko">
              <SelectTrigger>
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ko">Korean (한국어)</SelectItem>
                <SelectItem value="en">English (US)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      </div>
    </div>
  );
}
