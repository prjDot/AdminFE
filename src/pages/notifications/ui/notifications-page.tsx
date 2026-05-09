import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormStatus } from "@/shared/ui/form-status";
import { NotificationComposePanel } from "@/pages/notifications/ui/sections/notification-compose-panel";
import { NotificationHistoryPanel } from "@/pages/notifications/ui/sections/notification-history-panel";

export function NotificationsPage() {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("notifications.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("notifications.description")}</p>
      </div>

      {feedback && <FormStatus tone={feedback.tone} message={feedback.message} />}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <NotificationComposePanel
          onSendSuccess={() => setFeedback({ tone: "success", message: t("common.feedback.sent") })}
          onSendError={(message) =>
            setFeedback({
              tone: "error",
              message: message
                ? `${t("common.feedback.failed")} (${message})`
                : t("common.feedback.failed"),
            })
          }
        />
        <NotificationHistoryPanel />
      </div>
    </div>
  );
}
