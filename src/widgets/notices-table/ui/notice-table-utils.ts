import { NOTICE_STATUS, type NoticeStatus } from "@/shared/config/constants";

export const PAGE_SIZE = 20;

export const NOTICE_STATUS_LABEL_KEY: Record<NoticeStatus, string> = {
  [NOTICE_STATUS.LOST]: "notices.status.lost",
  [NOTICE_STATUS.FOUND]: "notices.status.found",
  [NOTICE_STATUS.RESOLVED]: "notices.status.resolved",
  [NOTICE_STATUS.HIDDEN]: "notices.status.hidden",
  [NOTICE_STATUS.REPORTED]: "notices.status.reported",
};

export function getNoticeStatusLabelKey(status: string): string {
  return (
    NOTICE_STATUS_LABEL_KEY[status as NoticeStatus] ??
    `notices.status.${status.toLowerCase()}`
  );
}

export function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "warning" | "outline" {
  switch (status) {
    case NOTICE_STATUS.FOUND:
    case NOTICE_STATUS.RESOLVED:
      return "default";
    case NOTICE_STATUS.LOST:
      return "destructive";
    case NOTICE_STATUS.REPORTED:
      return "warning";
    default:
      return "secondary";
  }
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ko-KR");
}
