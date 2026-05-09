import { Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  useNotificationHistory,
  useNotificationHistoryExport,
} from "@/pages/notifications/api/notification-hooks";

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
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `notification-history-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch {
      // Error handled by mutation state if needed
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTargetLabel = (target: string) => {
    const labels: Record<string, string> = {
      all: t("notifications.targetAll"),
      active: t("notifications.targetActive"),
      specific: t("notifications.targetSpecific"),
    };
    return labels[target] || target;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      completed: "default",
      sending: "secondary",
      failed: "destructive",
    };
    return variants[status] || "secondary";
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
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.body}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {getTargetLabel(item.target)} • {formatDate(item.sentAt)}
                  </p>
                </div>
                <div className="mt-4 flex flex-col items-end sm:mt-0">
                  <Badge variant={getStatusBadge(item.status)} className="mb-2">
                    {item.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {t("notifications.delivered", {
                      count: item.deliveredCount.toLocaleString(),
                    })}
                  </span>
                  {item.failedCount > 0 && (
                    <span className="text-xs text-destructive">
                      {t("notifications.failed", {
                        count: item.failedCount.toLocaleString(),
                      })}
                    </span>
                  )}
                </div>
              </div>
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
                {t("common.pagination.previous")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t("common.pagination.page", {
                  current: page,
                  total: totalPages,
                })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t("common.pagination.next")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
