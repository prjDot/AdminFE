import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Activity, AlertTriangle, Clock3, Layers3, Radio } from "lucide-react";
import { useTrafficConfig, useTrafficLogs } from "@/features/traffic/api/traffic-hooks";
import type { TrafficLog } from "@/features/traffic/api/traffic-api";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import {
  ALL_TRAFFIC_GROUP,
  formatTrafficBody,
  getTrafficGroupKey,
} from "./traffic-console-utils";

export function TrafficConsole() {
  const { t } = useTranslation();
  const [selectedGroup, setSelectedGroup] = useState(ALL_TRAFFIC_GROUP);
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { data: config } = useTrafficConfig();
  const { data: logs = [], isError, isLoading } = useTrafficLogs(
    100,
    errorsOnly,
    sortOrder,
  );

  const sortedLogs = useMemo(
    () =>
      [...logs].sort((a, b) => {
        const left = new Date(a.timestamp).getTime();
        const right = new Date(b.timestamp).getTime();
        return sortOrder === "asc" ? left - right : right - left;
      }),
    [logs, sortOrder],
  );

  const grouped = useMemo(() => {
    const next = new Map<string, typeof sortedLogs>();
    sortedLogs.forEach((log) => {
      const key = getTrafficGroupKey(log.path);
      next.set(key, [...(next.get(key) ?? []), log]);
    });
    return Array.from(next.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [sortedLogs]);

  useEffect(() => {
    if (
      selectedGroup !== ALL_TRAFFIC_GROUP &&
      !grouped.some(([group]) => group === selectedGroup)
    ) {
      setSelectedGroup(ALL_TRAFFIC_GROUP);
    }
  }, [grouped, selectedGroup]);

  const visibleLogs =
    selectedGroup === ALL_TRAFFIC_GROUP
      ? sortedLogs
      : sortedLogs.filter((log) => getTrafficGroupKey(log.path) === selectedGroup);

  const stats = useMemo(
    () => getTrafficStats(sortedLogs, grouped.length),
    [sortedLogs, grouped],
  );

  return (
    <section className="mx-auto max-w-screen-xl px-4 pb-8 sm:px-8">
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
                <Activity className="h-4 w-4" />
                {t("traffic.eyebrow")}
              </div>
              <div>
                <CardTitle>{t("traffic.title")}</CardTitle>
                <CardDescription className="mt-2">
                  {t("traffic.description")}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="w-fit bg-background">
              {t("traffic.trackedPrefixes")}:{" "}
              {(config?.trackedApiPrefixes ?? []).join(", ") || "-"}
            </Badge>
            <Badge variant="outline" className="w-fit bg-background">
              {t("traffic.errorFilter")}: {config?.errorStatusFilter ?? "-"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TrafficMetric icon={Radio} label={t("traffic.metrics.total")} value={stats.total} />
            <TrafficMetric icon={Layers3} label={t("traffic.metrics.groups")} value={stats.groups} />
            <TrafficMetric icon={AlertTriangle} label={t("traffic.metrics.errors")} value={stats.errors} />
            <TrafficMetric icon={Clock3} label={t("traffic.metrics.avgLatency")} value={`${stats.avgDuration}ms`} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{t("traffic.filters")}</p>
              <div className="flex items-center gap-3">
                <Label
                  htmlFor="traffic-sort-order"
                  className="text-xs text-muted-foreground"
                >
                  {t("common.sort.label")}
                </Label>
                <Select
                  value={sortOrder}
                  onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
                >
                  <SelectTrigger id="traffic-sort-order" className="h-8 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">{t("common.sort.desc")}</SelectItem>
                    <SelectItem value="asc">{t("common.sort.asc")}</SelectItem>
                  </SelectContent>
                </Select>
                <Label
                  htmlFor="traffic-errors-only"
                  className="text-xs text-muted-foreground"
                >
                  {t("traffic.errorsOnly")}
                </Label>
                <Switch
                  id="traffic-errors-only"
                  checked={errorsOnly}
                  onCheckedChange={setErrorsOnly}
                />
                <p className="text-xs text-muted-foreground">{t("traffic.livePolling")}</p>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <TrafficChip
                active={selectedGroup === ALL_TRAFFIC_GROUP}
                count={stats.total}
                label={t("traffic.all")}
                onClick={() => setSelectedGroup(ALL_TRAFFIC_GROUP)}
              />
              {grouped.map(([group, groupLogs]) => (
                <TrafficChip
                  key={group}
                  active={selectedGroup === group}
                  count={groupLogs.length}
                  label={group}
                  onClick={() => setSelectedGroup(group)}
                />
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border">
            {isLoading ? (
              <ConsoleState>{t("traffic.loading")}</ConsoleState>
            ) : isError ? (
              <ConsoleState>{t("traffic.failed")}</ConsoleState>
            ) : visibleLogs.length === 0 ? (
              <ConsoleState>{t("traffic.empty")}</ConsoleState>
            ) : (
              <div className="max-h-[620px] divide-y overflow-auto bg-background">
                {visibleLogs.map((log, index) => (
                  <TrafficLogItem
                    key={`${log.timestamp}-${log.method}-${log.path}-${index}`}
                    log={log}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

interface TrafficChipProps {
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
}

function TrafficChip({ active, count, label, onClick }: TrafficChipProps) {
  return (
    <Button
      className={cn(
        "h-9 shrink-0 rounded-full px-3",
        active && "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
      )}
      size="sm"
      type="button"
      variant={active ? "default" : "outline"}
      onClick={onClick}
    >
      {label} ({count})
    </Button>
  );
}

function ConsoleState({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-40 items-center justify-center p-6 text-sm text-muted-foreground">
      {children}
    </div>
  );
}

interface TrafficMetricProps {
  icon: typeof Activity;
  label: string;
  value: number | string;
}

function TrafficMetric({ icon: Icon, label, value }: TrafficMetricProps) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function TrafficLogItem({ log }: { log: TrafficLog }) {
  const { t } = useTranslation();
  const statusVariant = log.status >= 500 ? "destructive" : log.status >= 400 ? "warning" : "success";

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none flex-col gap-3 p-4 transition-colors hover:bg-muted/40 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{log.direction}</Badge>
            <Badge variant="outline">{log.method}</Badge>
            <Badge variant={statusVariant}>{log.status}</Badge>
            <span className="text-xs text-muted-foreground">{log.durationMs}ms</span>
          </div>
          <p className="truncate font-mono text-sm font-medium">{log.path}</p>
        </div>
        <div className="shrink-0 text-xs text-muted-foreground">
          {new Date(log.timestamp).toLocaleString("ko-KR")}
        </div>
      </summary>
      <div className="grid gap-3 border-t bg-muted/20 p-4 lg:grid-cols-2">
        <PayloadBlock title={t("traffic.requestBody")} value={formatTrafficBody(log.requestBody)} />
        <PayloadBlock title={t("traffic.responseBody")} value={formatTrafficBody(log.responseBody)} />
      </div>
    </details>
  );
}

function PayloadBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="min-w-0 space-y-2">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{title}</p>
      <pre className="max-h-80 overflow-auto rounded-md border bg-background p-3 font-mono text-xs leading-relaxed">
        {value}
      </pre>
    </div>
  );
}

function getTrafficStats(logs: TrafficLog[], groups: number) {
  const totalDuration = logs.reduce((sum, log) => sum + (log.durationMs || 0), 0);

  return {
    avgDuration: logs.length ? Math.round(totalDuration / logs.length) : 0,
    errors: logs.filter((log) => log.status < 200 || log.status >= 300).length,
    groups,
    total: logs.length,
  };
}
