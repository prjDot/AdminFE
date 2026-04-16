import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Server,
  Database,
  CloudLightning,
  CheckCircle2,
  Clock,
  Activity,
  Calendar,
  Settings,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";

export function ServicesPage() {
  const { t } = useTranslation();

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("services.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("services.description")}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              {t("services.manualControl")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("services.manualControlTitle")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("services.overrideStatus")}</label>
                <Input placeholder={t("services.overrideReasonPlaceholder")} />
              </div>
              <Button className="w-full">{t("common.actions.saveChanges")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Global Status Banner */}
      <div className="flex items-center gap-4 p-4 lg:p-6 rounded-xl border bg-emerald-500/10 border-emerald-500/20">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        <div>
          <h2 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">All Systems Operational</h2>
          <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80">Last updated: Just now</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Metrics Grid */}
        <div className="border rounded-xl bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Server className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">{t("services.components.coreApi")}</h3>
            </div>
            <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/5">{t("services.status.operational")}</Badge>
          </div>
          <div className="text-sm text-muted-foreground flex justify-between">
            <span>Uptime (90d)</span>
            <span className="font-mono">99.99%</span>
          </div>
        </div>

        <div className="border rounded-xl bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">{t("services.components.appDatabase")}</h3>
            </div>
            <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/5">{t("services.status.operational")}</Badge>
          </div>
          <div className="text-sm text-muted-foreground flex justify-between">
            <span>Uptime (90d)</span>
            <span className="font-mono">99.95%</span>
          </div>
        </div>

        <div className="border rounded-xl bg-card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <CloudLightning className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base">{t("services.components.mediaAnalysis")}</h3>
            </div>
            <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/5">{t("services.status.degraded")}</Badge>
          </div>
          <div className="text-sm text-muted-foreground flex justify-between">
            <span>Queue Pending</span>
            <span className="font-mono text-amber-600">45 jobs</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Uptime Trend (Mock 90-day chart) */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-muted-foreground" />
            {t("services.uptime.title")}
          </h2>
          <div className="border rounded-xl bg-card p-6 shadow-sm">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-sm text-muted-foreground">{t("services.uptime.overall")}</p>
                <p className="text-3xl font-bold">99.98%</p>
              </div>
              <div className="text-sm text-muted-foreground">Past 90 Days</div>
            </div>
            <div className="flex gap-[2px] h-14 w-full items-end">
              {Array.from({ length: 90 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${i === 83 ? "bg-amber-500 h-8" : i === 45 ? "bg-destructive h-4" : "bg-emerald-500 h-full"}`}
                  title={i === 83 ? "Degraded Performance" : i === 45 ? "Partial Outage" : "Operational"}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="col-span-1 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            {t("services.incidents.title")}
          </h2>
          <div className="border rounded-xl bg-card shadow-sm divide-y">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10">Degraded</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> 2 days ago
                </span>
              </div>
              <p className="text-sm font-medium">Media Analysis Queue Delays</p>
              <p className="text-xs text-muted-foreground line-clamp-2">High volume of uploads caused delayed queue processing. Resolved by auto-scaling workers.</p>
            </div>
            <div className="p-4 space-y-2 bg-muted/20">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-destructive border-destructive/50 bg-destructive/10">Partial Outage</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> 45 days ago
                </span>
              </div>
              <p className="text-sm font-medium">API Database Latency</p>
              <p className="text-xs text-muted-foreground line-clamp-2">Database failover triggered a 4 minute partial outage on core API endpoints.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
