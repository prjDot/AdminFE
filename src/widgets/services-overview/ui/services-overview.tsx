import { useState, type ElementType } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Image as ImageIcon,
  RefreshCw,
  Server,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import {
  useRebootService,
  useRefreshIntegration,
  useServiceLogs,
  useServicesOverview,
} from "@/features/services/api/services-hooks";
import { queryKeys } from "@/shared/api/query-keys";
import type { ServiceStatus } from "@/features/services/api/services-api";

// Mapping known service IDs to UI metadata (icons, i18n keys)
const SERVICE_META: Record<string, { icon: ElementType; nameKey?: string }> = {
  api: { icon: Server, nameKey: "services.components.coreApi" },
  db: { icon: Database, nameKey: "services.components.appDatabase" },
  media: { icon: ImageIcon, nameKey: "services.components.mediaAnalysis" },
};

type StatusVariant = "operational" | "degraded" | "outage" | "maintenance";

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

const INTEGRATION_KEYS = new Set(["DATABASE", "REDIS", "FIREBASE", "SHELTER_API"]);

function isIntegrationKey(key: string) {
  return INTEGRATION_KEYS.has(key.toUpperCase());
}

export function ServicesOverview() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    data: services = [],
    isLoading,
    isError,
    refetch,
  } = useServicesOverview();
  const rebootMutation = useRebootService();
  const refreshIntegrationMutation = useRefreshIntegration();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  const { data: logs = [], isLoading: logsLoading } = useServiceLogs(
    selectedServiceId ?? "",
  );

  const selectedService =
    services.find((s) => s.id === selectedServiceId) ?? null;
  const selectedMeta = selectedService
    ? SERVICE_META[selectedService.id.toLowerCase()]
    : null;
  const SelectedIcon = selectedMeta?.icon ?? Server;
  const globalStatus = deriveGlobalStatus(services);

  const handleServiceAction = (targetId: string) => {
    if (!targetId) return;
    const integrationKey = targetId.toUpperCase();
    const isIntegration = isIntegrationKey(targetId);
    const mutation = isIntegration
      ? refreshIntegrationMutation
      : rebootMutation;

    mutation.mutate(isIntegration ? integrationKey : targetId, {
      onSuccess: () => {
        toast.success(
          isIntegration
            ? t("services.feedback.recheckRequested")
            : t("services.feedback.rebootRequested"),
        );
        void queryClient.invalidateQueries({
          queryKey: queryKeys.services.overview(),
        });
      },
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : t("common.errors.unknown")),
    });
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">{t("common.errors.failed")}</p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          {t("common.actions.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl space-y-8 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("services.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("services.description")}
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {t("services.manualOverride")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("services.manualControlTitle")}</DialogTitle>
              <DialogDescription>
                {t("services.manualControlDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="service-target">
                  {t("services.overrideTarget")}
                </Label>
                <Select
                  defaultValue={services[0]?.id ?? ""}
                  onValueChange={(id) => setSelectedServiceId(id)}
                >
                  <SelectTrigger id="service-target">
                    <SelectValue placeholder={t("services.selectTarget")} />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {getServiceName(s, t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-status">
                  {t("services.overrideStatus")}
                </Label>
                <Select defaultValue="degraded">
                  <SelectTrigger id="service-status">
                    <SelectValue placeholder={t("services.selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">
                      {t("services.status.operational")}
                    </SelectItem>
                    <SelectItem value="degraded">
                      {t("services.status.degraded")}
                    </SelectItem>
                    <SelectItem value="outage">
                      {t("services.status.partialOutage")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() =>
                  handleServiceAction(selectedServiceId ?? services[0]?.id ?? "")
                }
                disabled={
                  rebootMutation.isPending ||
                  refreshIntegrationMutation.isPending ||
                  !selectedServiceId
                }
              >
                {rebootMutation.isPending || refreshIntegrationMutation.isPending
                  ? t("common.loading")
                  : t("services.actions.runCheck")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Global Status Banner */}
      <div className="relative flex w-full items-center justify-between overflow-hidden rounded-xl border p-6">
        <div
          className={`absolute inset-0 opacity-10 ${statusDotClass[globalStatus]}`}
        />
        <div className="relative z-10 flex items-center gap-4">
          <div
            className={`rounded-full p-3 ${statusContainerClass[globalStatus]}`}
          >
            {globalStatus === "operational" ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : (
              <AlertTriangle className="h-8 w-8" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {globalStatus === "operational"
                ? t("services.status.allOperational")
                : t("services.status.partialOutage")}
            </h2>
            <p className="mt-1 text-muted-foreground">
              {t("services.dashboardRefresh")}
            </p>
          </div>
        </div>
      </div>

      {/* Service Cards */}
      <h3 className="text-xl font-semibold tracking-tight">
        {t("services.coreServices")}
      </h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {services.map((service) => {
          const meta = SERVICE_META[service.id.toLowerCase()];
          const ServiceIcon = meta?.icon ?? Server;
          return (
            <button
              key={service.id}
              type="button"
              className="flex cursor-pointer flex-col gap-4 rounded-xl border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary"
              onClick={() => setSelectedServiceId(service.id)}
            >
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-muted p-2.5">
                  <ServiceIcon className="h-6 w-6 text-foreground" />
                </div>
                <Badge variant="outline" className="gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${statusDotClass[service.status]}`}
                  />
                  {t(`services.status.${service.status}`)}
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold">{getServiceName(service, t)}</h4>
                {service.message && (
                  <p className="mt-1 text-sm text-muted-foreground truncate">
                    {service.message}
                  </p>
                )}
                <div className="mt-3 flex gap-4">
                  {service.uptime && (
                    <div className="space-y-1 border-r pr-4">
                      <p className="text-xs text-muted-foreground">
                        {t("services.metrics.uptime")}
                      </p>
                      <p className="font-medium">{service.uptime}</p>
                    </div>
                  )}
                  {service.latency && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {t("services.metrics.latency")}
                      </p>
                      <p className="font-medium text-warning-foreground">
                        {service.latency}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Service Detail Sheet */}
      <Sheet
        open={Boolean(selectedServiceId)}
        onOpenChange={(opened) => !opened && setSelectedServiceId(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t("services.telemetry.title")}</SheetTitle>
            <SheetDescription>
              {t("services.telemetry.description")}
            </SheetDescription>
          </SheetHeader>
          {selectedService && (
            <div className="space-y-6 py-6">
              <div className="flex items-start justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-3">
                    <SelectedIcon className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {getServiceName(selectedService, t)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedService.id}-cluster-us-east
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="gap-2 text-sm">
                  <span
                    className={`h-2 w-2 rounded-full ${statusDotClass[selectedService.status]}`}
                  />
                  {t(`services.status.${selectedService.status}`)}
                </Badge>
              </div>

              <div className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-semibold">
                  {t("services.telemetry.consoleTitle")}
                </h4>
                <div className="overflow-hidden rounded-lg bg-black/90 p-4 font-mono text-xs text-green-400 max-h-64 overflow-y-auto">
                  {logsLoading ? (
                    <p className="text-muted-foreground">
                      {t("common.loading")}...
                    </p>
                  ) : logs.length === 0 ? (
                    <p className="text-muted-foreground">
                      {t("services.logs.empty")}
                    </p>
                  ) : (
                    logs.map((log, i) => (
                      <p
                        key={i}
                        className={
                          log.level === "error"
                            ? "text-destructive"
                            : log.level === "warn"
                              ? "text-warning"
                              : ""
                        }
                      >
                        [{formatTime(log.timestamp)}] {log.level.toUpperCase()}:{" "}
                        {log.message}
                      </p>
                    ))
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleServiceAction(selectedService.id)}
                  disabled={
                    rebootMutation.isPending ||
                    refreshIntegrationMutation.isPending
                  }
                >
                  {isIntegrationKey(selectedService.id)
                    ? t("services.actions.recheck")
                    : t("services.actions.reboot")}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Recent Incidents Timeline */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="mb-6 font-semibold">{t("services.recentIncidents")}</h3>
        <div className="space-y-6">
          {services
            .filter((s) => s.status !== "operational" || s.message)
            .sort(
              (a, b) =>
                new Date(b.checkedAt).getTime() -
                new Date(a.checkedAt).getTime(),
            )
            .slice(0, 5)
            .map((item, index, arr) => (
              <div key={item.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`mt-1.5 h-3 w-3 rounded-full ${statusDotClass[item.status]}`}
                  />
                  {index !== arr.length - 1 && (
                    <div className="my-2 h-full w-px bg-border" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium">
                    {getServiceName(item, t)} -{" "}
                    {item.message || t(`services.status.${item.status}`)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatRelativeTime(item.checkedAt, t)}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// Helpers
function getServiceName(service: ServiceStatus, t: (key: string) => string) {
  const meta = SERVICE_META[service.id.toLowerCase()];
  return meta?.nameKey ? t(meta.nameKey) : service.name;
}

function deriveGlobalStatus(services: ServiceStatus[]): StatusVariant {
  if (services.some((s) => s.status === "outage")) return "outage";
  if (services.some((s) => s.status === "degraded")) return "degraded";
  if (services.some((s) => s.status === "maintenance")) return "maintenance";
  return "operational";
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatRelativeTime(
  isoString: string,
  t: (key: string) => string,
): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return t("services.time.justNow");
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}
