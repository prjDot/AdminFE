import { AlertTriangle } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { useTranslation } from "react-i18next";

export function DashboardPriorityPanel() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{t("dashboard.priority.title")}</h2>
      <div className="flex-1 space-y-3">
        {[1, 2, 3].map((itemNumber) => (
          <div key={itemNumber} className="flex items-start gap-4 rounded-lg border p-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{t("dashboard.priority.target", { id: `10${itemNumber}` })}</p>
                {itemNumber === 1 && (
                  <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                    {t("dashboard.priority.badge")}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t("dashboard.priority.reason")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
