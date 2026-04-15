import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/ui/badge";

export function NotificationHistoryPanel() {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
      <h2 className="mb-6 text-xl font-semibold">{t("notifications.historyTitle")}</h2>
      <div className="space-y-4">
        {[1, 2, 3].map((itemNumber) => (
          <div
            key={itemNumber}
            className="flex flex-col justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center"
          >
            <div>
              <h3 className="text-lg font-semibold">
                {itemNumber === 1 ? t("notifications.systemMaintenanceAlert") : t("notifications.foundDogNearby")}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("notifications.mockBody")}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("notifications.targetLine")} • 2026-04-{15 - itemNumber} 14:00
              </p>
            </div>
            <div className="mt-4 flex flex-col items-end sm:mt-0">
              <Badge variant="default" className="mb-2">
                {t("common.status.success")}
              </Badge>
              <span className="text-sm text-muted-foreground">{t("notifications.delivered", { count: `12,30${itemNumber}` })}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
