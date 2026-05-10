import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Activity } from "lucide-react";
import { useTrafficConfig, useTrafficLogs } from "@/features/traffic/api/traffic-hooks";
import { cn } from "@/shared/lib/utils";
import {
  ALL_TRAFFIC_GROUP,
  formatTrafficLog,
  getTrafficGroupKey,
} from "./traffic-console-utils";

export function TrafficConsole() {
  const { t } = useTranslation();
  const [selectedGroup, setSelectedGroup] = useState(ALL_TRAFFIC_GROUP);
  const { data: config } = useTrafficConfig();
  const { data: logs = [], isError, isLoading } = useTrafficLogs(100);

  const grouped = useMemo(() => {
    const next = new Map<string, typeof logs>();
    logs.forEach((log) => {
      const key = getTrafficGroupKey(log.path);
      next.set(key, [...(next.get(key) ?? []), log]);
    });
    return Array.from(next.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [logs]);

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
      ? logs
      : logs.filter((log) => getTrafficGroupKey(log.path) === selectedGroup);

  const totalCount = grouped.reduce((sum, [, groupLogs]) => sum + groupLogs.length, 0);

  return (
    <section className="space-y-4 border-t pt-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
            <Activity className="h-4 w-4" />
            {t("traffic.eyebrow")}
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {t("traffic.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("traffic.description")}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("traffic.trackedPrefixes")}:{" "}
          {(config?.trackedApiPrefixes ?? []).join(", ") || "-"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <TrafficChip
          active={selectedGroup === ALL_TRAFFIC_GROUP}
          count={totalCount}
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

      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <ConsoleState>{t("traffic.loading")}</ConsoleState>
        ) : isError ? (
          <ConsoleState>{t("traffic.failed")}</ConsoleState>
        ) : visibleLogs.length === 0 ? (
          <ConsoleState>{t("traffic.empty")}</ConsoleState>
        ) : (
          <div className="max-h-[560px] divide-y overflow-auto">
            {visibleLogs.map((log, index) => (
              <pre
                key={`${log.timestamp}-${log.method}-${log.path}-${index}`}
                className="whitespace-pre-wrap break-words p-4 font-mono text-xs leading-relaxed text-foreground"
              >
                {formatTrafficLog(log)}
              </pre>
            ))}
          </div>
        )}
      </div>
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
    <button
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-muted",
      )}
      type="button"
      onClick={onClick}
    >
      {label} ({count})
    </button>
  );
}

function ConsoleState({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-40 items-center justify-center p-6 text-sm text-muted-foreground">
      {children}
    </div>
  );
}
