import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ServerCrash, Image as ImageIcon, Activity, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ServicesPage() {
  const { t } = useTranslation();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("services.title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("services.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Status Panel */}
        <div className="border rounded-xl bg-card shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">{t("services.apiStatus")}</h2>
            </div>
            <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90">
              {t("common.status.connected")}
            </Badge>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("services.endpoint")}</span>
              <span className="font-mono">openapi.animal.go.kr</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("services.lastSync")}</span>
              <span>{t("services.tenMinsAgo")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("services.syncRate")}</span>
              <span>{t("services.everyHour")}</span>
            </div>
          </div>
          <Button variant="outline" className="w-full gap-2">
            <RefreshCw className="w-4 h-4" /> {t("common.actions.forceSyncNow")}
          </Button>
        </div>

        {/* Media Analysis Queue */}
        <div className="border rounded-xl bg-card shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">{t("services.photoQueue")}</h2>
            </div>
            <Badge variant="secondary">{t("services.queuePending", { count: 3 })}</Badge>
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Job #102{i}</p>
                    <p className="text-xs text-muted-foreground">{t("services.failedMinsAgo", { count: 5 })}</p>
                  </div>
                </div>
                <Button size="sm" variant="secondary">{t("common.actions.retry")}</Button>
              </div>
            ))}
          </div>
        </div>

        {/* Error Logs */}
        <div className="md:col-span-2 border rounded-xl bg-card shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <ServerCrash className="w-5 h-5 text-destructive" />
            <h2 className="text-xl font-semibold">{t("services.recentFailures")}</h2>
          </div>
          <div className="rounded-md border">
            <div className="p-4 flex items-center justify-center text-sm text-muted-foreground h-32">
              {t("services.noErrors")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
