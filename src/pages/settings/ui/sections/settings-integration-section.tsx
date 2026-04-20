import { useTranslation } from "react-i18next";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";
import { Copy, KeyRound, CloudSync } from "lucide-react";
import { toast } from "sonner";
import type { SettingsRegisterProps } from "@/pages/settings/ui/sections/types";

export function SettingsIntegrationSection({ register }: SettingsRegisterProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-muted px-6 py-4">
        <h2 className="text-lg font-semibold">{t("settings.integrationTitle")}</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage API keys, webhooks, and third-party data synchronizations.</p>
      </div>
      <div className="space-y-8 p-6">
        
        {/* API Endpoint Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-1 pt-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <CloudSync className="h-4 w-4 text-muted-foreground" />
              Shelter API Sync
            </h3>
          </div>
          <div className="md:col-span-3 space-y-4">
            <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/20">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Auto-Sync Shelter Data</p>
                <p className="text-xs text-muted-foreground">Automatically fetch new missing animals from National API every hour.</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">National API Endpoint</label>
              <Input {...register("apiEndpoint")} readOnly className="bg-muted/30" />
            </div>
          </div>
        </div>

        <hr className="bg-border" />

        {/* FCM Push Notification Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-1 pt-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              Push Notifications (FCM)
            </h3>
          </div>
          <div className="md:col-span-3 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">FCM Server Key</label>
              <div className="flex items-center gap-2">
                <Input type="password" {...register("fcmServerKey")} defaultValue="***************************" />
                <Button variant="outline" type="button" onClick={() => toast.success("Key copied to clipboard")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/20">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Global Push Alerts</p>
                <p className="text-xs text-muted-foreground">Allow the system to broadcast global push notifications to mobile users.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
