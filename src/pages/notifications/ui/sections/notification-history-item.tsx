import { Badge } from "@/shared/ui/badge";
import type { NotificationRecord } from "@/pages/notifications/api/notification-hooks";
import {
  formatNotificationDate,
  getNotificationStatusBadge,
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
  );
}
