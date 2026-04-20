import { CloudSync, Copy, KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { SettingsRegisterProps } from "@/pages/settings/ui/sections/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";

export function SettingsIntegrationSection({ register }: SettingsRegisterProps) {
  const { t } = useTranslation();

  const handleCopyMaskedKey = () => {
    void navigator.clipboard.writeText("****************");
    toast.success(t("settings.feedback.maskedKeyCopied"));
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-muted px-6 py-4">
        <h2 className="text-lg font-semibold">{t("settings.integrationTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("settings.integrationDescription")}</p>
      </div>
      <div className="space-y-8 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="pt-2 md:col-span-1">
            <h3 className="flex items-center gap-2 text-sm font-medium"><CloudSync className="h-4 w-4 text-muted-foreground" />{t("settings.shelterSyncTitle")}</h3>
          </div>
          <div className="space-y-4 md:col-span-3">
            <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{t("settings.autoSyncTitle")}</p>
                <p className="text-xs text-muted-foreground">{t("settings.autoSyncDescription")}</p>
              </div>
              <Switch defaultChecked aria-label={t("settings.autoSyncTitle")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-endpoint" className="text-xs font-medium text-muted-foreground">{t("settings.apiEndpointLabel")}</Label>
              <Input id="api-endpoint" {...register("apiEndpoint")} readOnly className="bg-muted/30" />
            </div>
          </div>
        </div>

        <hr className="bg-border" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="pt-2 md:col-span-1">
            <h3 className="flex items-center gap-2 text-sm font-medium"><KeyRound className="h-4 w-4 text-muted-foreground" />{t("settings.pushSectionTitle")}</h3>
          </div>
          <div className="space-y-4 md:col-span-3">
            <div className="space-y-2">
              <Label htmlFor="fcm-server-key" className="text-xs font-medium text-muted-foreground">{t("settings.fcmServerKey")}</Label>
              <div className="flex items-center gap-2">
                <Input id="fcm-server-key" type="password" {...register("fcmServerKey")} defaultValue="***************************" />
                <Button variant="outline" type="button" onClick={handleCopyMaskedKey} aria-label={t("settings.copyMaskedKey")}><Copy className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{t("settings.globalPushTitle")}</p>
                <p className="text-xs text-muted-foreground">{t("settings.globalPushDescription")}</p>
              </div>
              <Switch defaultChecked aria-label={t("settings.globalPushTitle")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
