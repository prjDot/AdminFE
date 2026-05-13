import { Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  useNotificationHistory,
  useNotificationHistoryExport,
} from "@/pages/notifications/api/notification-hooks";
import { downloadCsv } from "@/pages/notifications/ui/sections/notification-history-utils";
import { NotificationHistoryItem } from "@/pages/notifications/ui/sections/notification-history-item";

export function NotificationHistoryPanel() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError } = useNotificationHistory({
    page,
    pageSize,
  });
  const exportMutation = useNotificationHistoryExport();

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync();
      downloadCsv(blob, `notification-history-${Date.now()}.csv`);
    } catch {
      return;
    }
  };

  const getTargetLabel = (target: string) => {
    const normalized = target.toLowerCase();
    const labels: Record<string, string> = {
      all: t("notifications.targetAll"),
      active: t("notifications.targetActive"),
      specific: t("notifications.targetSpecific"),
    };
    return labels[normalized] || target;
  };

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {t("notifications.historyTitle")}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className="gap-2"
        >
          {exportMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {t("common.actions.export")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          {t("common.errors.failedToLoad")}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          {t("notifications.noHistory")}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {data?.items.map((item) => (
              <NotificationHistoryItem
                key={item.id}
                item={item}
                getTargetLabel={getTargetLabel}
                t={t}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t("common.pagination.previous", "이전")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t("common.pagination.page", {
                  current: page,
                  total: totalPages,
                  defaultValue: "{{current}} / {{total}}",
                })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t("common.pagination.next", "다음")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
