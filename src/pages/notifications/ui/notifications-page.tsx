import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Send, BellRing } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export function NotificationsPage() {
  const { t } = useTranslation();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = (data: any) => {
    console.log("Sending push notification:", data);
    alert(t("common.actions.sendNotification"));
    reset();
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("notifications.title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("notifications.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Send Notification Form */}
        <div className="lg:col-span-1 border rounded-xl bg-card shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <BellRing className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">{t("notifications.sendCardTitle")}</h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("notifications.targetAudience")}</label>
              <select {...register("target")} className="w-full h-10 px-3 py-2 rounded-md border border-input bg-transparent text-sm">
                <option value="all">{t("notifications.targetAll")}</option>
                <option value="active">{t("notifications.targetActive")}</option>
                <option value="specific">{t("notifications.targetSpecific")}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("notifications.titleField")}</label>
              <Input {...register("title")} placeholder={t("notifications.titlePlaceholder")} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("notifications.messageBody")}</label>
              <textarea 
                {...register("body")} 
                placeholder={t("notifications.messagePlaceholder")} 
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-transparent text-sm resize-none" 
                required
              />
            </div>
            <Button type="submit" className="w-full gap-2">
              <Send className="w-4 h-4" /> {t("common.actions.sendNotification")}
            </Button>
          </form>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 border rounded-xl bg-card shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">{t("notifications.historyTitle")}</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <h3 className="font-semibold text-lg">
                    {i === 1 ? t("notifications.systemMaintenanceAlert") : t("notifications.foundDogNearby")}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{t("notifications.mockBody")}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t("notifications.targetLine")} • 2026-04-{15 - i} 14:00
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-col items-end">
                  <Badge variant="default" className="mb-2">{t("common.status.success")}</Badge>
                  <span className="text-sm text-muted-foreground">{t("notifications.delivered", { count: `12,30${i}` })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
