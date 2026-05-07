import { AlertTriangle } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "react-i18next";
import type { AdminDashboardPriorityItem } from "@/pages/dashboard/api/dashboard-api";

interface DashboardPriorityPanelProps {
  items: AdminDashboardPriorityItem[];
  isLoading: boolean;
  error: Error | null;
}

export function DashboardPriorityPanel({
  items,
  isLoading,
  error,
}: DashboardPriorityPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{t("dashboard.priority.title")}</h2>
      <div className="flex-1 space-y-3">
        {isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] items-center justify-center text-sm text-destructive">
            {t("dashboard.errors.priorityLoadFailed")}
          </div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="flex items-start gap-4 rounded-lg border p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{item.targetLabel}</p>
                  {item.priority ? (
                    <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                      {t("dashboard.priority.badge")}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
                <p className="mt-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {item.type}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
            {t("dashboard.empty.priorities")}
          </div>
        )}
      </div>
    </div>
  );
}
