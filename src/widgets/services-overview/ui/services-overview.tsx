import { useState, type ElementType } from "react";
import { AlertTriangle, CheckCircle2, Database, Image as ImageIcon, RefreshCw, Server } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet";

type StatusVariant = "operational" | "degraded" | "outage" | "maintenance";

interface ServiceBlock {
  id: string;
  nameKey: string;
  status: StatusVariant;
  uptime: string;
  latency: string;
  icon: ElementType;
}

interface TimelineEvent {
  time: string;
  eventKey: string;
  status: StatusVariant;
}

const mockServices: ServiceBlock[] = [
  { id: "api", nameKey: "services.components.coreApi", status: "operational", uptime: "99.98%", latency: "42ms", icon: Server },
  { id: "db", nameKey: "services.components.appDatabase", status: "operational", uptime: "99.99%", latency: "12ms", icon: Database },
  { id: "media", nameKey: "services.components.mediaAnalysis", status: "degraded", uptime: "98.50%", latency: "1,200ms", icon: ImageIcon },
];

const mockTimeline: TimelineEvent[] = [
  { time: "10:45", eventKey: "services.incidents.mediaLatency", status: "degraded" },
  { time: "09:00", eventKey: "services.incidents.dbBackup", status: "operational" },
  { time: "2026-04-19", eventKey: "services.incidents.apiOutage", status: "outage" },
];

const statusDotClass: Record<StatusVariant, string> = {
  operational: "bg-success",
  degraded: "bg-warning",
  outage: "bg-destructive",
  maintenance: "bg-secondary",
};

const statusContainerClass: Record<StatusVariant, string> = {
  operational: "bg-success/20 text-success",
  degraded: "bg-warning/20 text-warning-foreground",
  outage: "bg-destructive/20 text-destructive",
  maintenance: "bg-secondary/20 text-secondary-foreground",
};

export function ServicesOverview() {
  const { t } = useTranslation();
  const [globalStatus, setGlobalStatus] = useState<StatusVariant>("degraded");
  const [selectedService, setSelectedService] = useState<ServiceBlock | null>(null);

  const overrideStatus = () => {
    setGlobalStatus("degraded");
    toast.success(t("services.feedback.manualOverrideApplied"));
  };

  return (
    <div className="mx-auto max-w-screen-xl space-y-8 p-4 sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("services.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("services.description")}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" />{t("services.manualOverride")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("services.manualControlTitle")}</DialogTitle>
              <DialogDescription>{t("services.manualControlDescription")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="service-target">{t("services.overrideTarget")}</Label>
                <Select defaultValue="global">
                  <SelectTrigger id="service-target"><SelectValue placeholder={t("services.selectTarget")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">{t("services.target.global")}</SelectItem>
                    <SelectItem value="api">{t("services.components.coreApi")}</SelectItem>
                    <SelectItem value="media">{t("services.components.mediaAnalysis")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-status">{t("services.overrideStatus")}</Label>
                <Select defaultValue="degraded">
                  <SelectTrigger id="service-status"><SelectValue placeholder={t("services.selectStatus")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">{t("services.status.operational")}</SelectItem>
                    <SelectItem value="degraded">{t("services.status.degraded")}</SelectItem>
                    <SelectItem value="outage">{t("services.status.partialOutage")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button onClick={overrideStatus}>{t("common.actions.save")}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative flex w-full items-center justify-between overflow-hidden rounded-xl border p-6">
        <div className={`absolute inset-0 opacity-10 ${statusDotClass[globalStatus]}`} />
        <div className="relative z-10 flex items-center gap-4">
          <div className={`rounded-full p-3 ${statusContainerClass[globalStatus]}`}>
            {globalStatus === "operational" ? <CheckCircle2 className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{globalStatus === "operational" ? t("services.status.allOperational") : t("services.status.partialOutage")}</h2>
            <p className="mt-1 text-muted-foreground">{t("services.dashboardRefresh")}</p>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold tracking-tight">{t("services.coreServices")}</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {mockServices.map((service) => (
          <button
            key={service.id}
            type="button"
            className="flex cursor-pointer flex-col gap-4 rounded-xl border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary"
            onClick={() => setSelectedService(service)}
          >
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-muted p-2.5"><service.icon className="h-6 w-6 text-foreground" /></div>
              <Badge variant="outline" className="gap-2"><span className={`h-2 w-2 rounded-full ${statusDotClass[service.status]}`} />{t(`services.status.${service.status}`)}</Badge>
            </div>
            <div>
              <h4 className="font-semibold">{t(service.nameKey)}</h4>
              <div className="mt-3 flex gap-4">
                <div className="space-y-1 border-r pr-4"><p className="text-xs text-muted-foreground">{t("services.metrics.uptime")}</p><p className="font-medium">{service.uptime}</p></div>
                <div className="space-y-1"><p className="text-xs text-muted-foreground">{t("services.metrics.latency")}</p><p className="font-medium text-warning-foreground">{service.latency}</p></div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <Sheet open={Boolean(selectedService)} onOpenChange={(opened) => !opened && setSelectedService(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t("services.telemetry.title")}</SheetTitle>
            <SheetDescription>{t("services.telemetry.description")}</SheetDescription>
          </SheetHeader>
          {selectedService && (
            <div className="space-y-6 py-6">
              <div className="flex items-start justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-3"><selectedService.icon className="h-6 w-6 text-foreground" /></div>
                  <div>
                    <h3 className="text-lg font-bold">{t(selectedService.nameKey)}</h3>
                    <p className="text-sm text-muted-foreground">{selectedService.id}-cluster-us-east</p>
                  </div>
                </div>
                <Badge variant="outline" className="gap-2 text-sm"><span className={`h-2 w-2 rounded-full ${statusDotClass[selectedService.status]}`} />{t(`services.status.${selectedService.status}`)}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <MetricCard label={t("services.telemetry.memory")} value="4.2" unit="GB" />
                <MetricCard label={t("services.telemetry.cpu")} value="65" unit="%" />
                <MetricCard label={t("services.telemetry.totalReq")} value="12.4" unit="K/M" />
                <MetricCard label={t("services.telemetry.dropRate")} value="0.05" unit="%" isDanger />
              </div>
              <div className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-semibold">{t("services.telemetry.consoleTitle")}</h4>
                <div className="overflow-hidden rounded-lg bg-black/90 p-4 font-mono text-xs text-green-400">
                  <p>[10:45:01] GET /health - 200 OK</p>
                  <p>[10:45:02] WORKER NODE 04 starting process...</p>
                  <p className="text-warning">[10:45:05] WARN: Memory threshold reached 75%</p>
                  <p className="text-destructive">[10:45:06] ERR: Connection timeout to Redis shard 2</p>
                  <p>[10:45:08] Auto-scaling initiated. Provisioning NODE 05.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => toast.success(t("services.feedback.rebootRequested"))}>{t("services.actions.reboot")}</Button>
                <Button>{t("services.actions.viewLogs")}</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="mb-6 font-semibold">{t("services.recentIncidents")}</h3>
        <div className="space-y-6">
          {mockTimeline.map((item, index) => (
            <div key={`${item.time}-${item.eventKey}`} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`mt-1.5 h-3 w-3 rounded-full ${statusDotClass[item.status]}`} />
                {index !== mockTimeline.length - 1 && <div className="my-2 h-full w-px bg-border" />}
              </div>
              <div className="pb-4">
                <p className="text-sm font-medium">{t(item.eventKey)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, isDanger = false }: { label: string; value: string; unit: string; isDanger?: boolean }) {
  return (
    <div className="space-y-1 rounded-xl border bg-muted/30 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${isDanger ? "text-destructive" : ""}`}>{value}<span className="text-lg text-muted-foreground">{unit}</span></p>
    </div>
  );
}
