import { BellRing, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useSendNotification } from "@/pages/notifications/api/notification-hooks";
import {
  ApiResponseError,
  toApiResponseError,
} from "@/shared/api/api-response";

interface NotificationFormValues {
  target: "all" | "active" | "specific";
  title: string;
  body: string;
  userIdsText: string;
}

interface NotificationComposePanelProps {
  onSendSuccess: () => void;
  onSendError: (message?: string) => void;
}

export function NotificationComposePanel({
  onSendSuccess,
  onSendError,
}: NotificationComposePanelProps) {
  const { t } = useTranslation();
  const { register, handleSubmit, reset } = useForm<NotificationFormValues>({
    defaultValues: {
      target: "all",
      title: "",
      body: "",
      userIdsText: "",
    },
  });

  const sendMutation = useSendNotification();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await sendMutation.mutateAsync({
        target: data.target,
        title: data.title,
        body: data.body,
        userIds: parseUserIds(data.userIdsText),
      });
      reset();
      onSendSuccess();
    } catch (error) {
      onSendError(getNotificationErrorMessage(error));
    }
  });

  return (
    <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm lg:col-span-1">
      <div className="flex items-center gap-2 border-b pb-4">
        <BellRing className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">
          {t("notifications.sendCardTitle")}
        </h2>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="space-y-2">
          <span className="text-sm font-medium">
            {t("notifications.targetAudience")}
          </span>
          <select
            {...register("target")}
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          >
            <option value="all">{t("notifications.targetAll")}</option>
            <option value="active">{t("notifications.targetActive")}</option>
            <option value="specific">
              {t("notifications.targetSpecific")}
            </option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">
            {t("notifications.titleField")}
          </span>
          <Input
            {...register("title")}
            placeholder={t("notifications.titlePlaceholder")}
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">
            {t("notifications.messageBody")}
          </span>
          <textarea
            {...register("body")}
            placeholder={t("notifications.messagePlaceholder")}
            className="min-h-[100px] w-full resize-none rounded-md border border-input bg-transparent p-3 text-sm"
            required
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">
            {t("notifications.userIdsField")}
          </span>
          <textarea
            {...register("userIdsText")}
            placeholder={t("notifications.userIdsPlaceholder")}
            className="min-h-[72px] w-full resize-none rounded-md border border-input bg-transparent p-3 text-sm"
          />
        </label>
        <Button
          type="submit"
          className="w-full gap-2"
          disabled={sendMutation.isPending}
        >
          <Send className="h-4 w-4" />{" "}
          {sendMutation.isPending
            ? t("common.actions.sending")
            : t("common.actions.sendNotification")}
        </Button>
      </form>
    </div>
  );
}

function parseUserIds(value: string) {
  const userIds = value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
  return userIds.length > 0 ? userIds : undefined;
}

function getNotificationErrorMessage(error: unknown) {
  const normalizedError = toApiResponseError(error);
  if (!(normalizedError instanceof ApiResponseError)) {
    return undefined;
  }

  return [
    normalizedError.code,
    normalizedError.requestId ? `requestId=${normalizedError.requestId}` : null,
  ]
    .filter(Boolean)
    .join(" / ");
}
