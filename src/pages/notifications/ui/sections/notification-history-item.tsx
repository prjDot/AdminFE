import { Badge } from "@/shared/ui/badge";
import type { NotificationRecord } from "@/features/notifications/api/notification-hooks";
import {
  formatNotificationDate,
  getNotificationStatusBadge,
  getNotificationStatusLabelKey,
} from "@/pages/notifications/ui/sections/notification-history-utils";

interface NotificationHistoryItemProps {
  item: NotificationRecord;
  getTargetLabel: (target: string) => string;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export function NotificationHistoryItem({
  item,
  getTargetLabel,
  t,
}: NotificationHistoryItemProps) {
  const deliveredUserCount = item.deliveredUserCount ?? item.deliveredCount ?? 0;
  const failedTokenCount = item.failedTokenCount ?? 0;
  const skippedCount = item.skippedCount ?? 0;
  const targetCount = item.targetCount ?? null;
  const hasTokenDetails =
    item.deliveredUserCount !== undefined || failedTokenCount > 0;

  return (
    <div className="flex flex-col justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center">
      <div>
        <h3 className="text-lg font-semibold">{item.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {getTargetLabel(item.target)} • {formatNotificationDate(item.sentAt)}
        </p>
      </div>
      <div className="mt-4 flex flex-col items-end sm:mt-0">
        <Badge variant={getNotificationStatusBadge(item.status)} className="mb-2">
          {t(getNotificationStatusLabelKey(item.status))}
        </Badge>
        <div className="text-right text-sm text-muted-foreground">
          <p>
            {[
              targetCount !== null
                ? t("notifications.targetCount", {
                    count: targetCount.toLocaleString(),
                  })
                : null,
              t("notifications.deliveredUsers", {
                count: deliveredUserCount.toLocaleString(),
              }),
              t("notifications.failed", {
                count: item.failedCount.toLocaleString(),
              }),
              t("notifications.skipped", {
                count: skippedCount.toLocaleString(),
              }),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {hasTokenDetails && (
            <p className="mt-1 text-xs">
              {[
                t("notifications.deliveredTokens", {
                  count: item.deliveredCount.toLocaleString(),
                }),
                failedTokenCount > 0
                  ? t("notifications.failedTokens", {
                      count: failedTokenCount.toLocaleString(),
                    })
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
