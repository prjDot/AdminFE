import { REPORT_STATUS, type ReportStatus } from "@/shared/config/constants";

export const PAGE_SIZE = 20;

export const REPORT_STATUS_LABEL_KEY: Record<ReportStatus, string> = {
  [REPORT_STATUS.PENDING]: "reports.status.pending",
  [REPORT_STATUS.REVIEWING]: "reports.status.reviewing",
  [REPORT_STATUS.RESOLVED]: "reports.status.resolved",
  [REPORT_STATUS.REJECTED]: "reports.status.rejected",
};

export const TARGET_TYPE_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "NOTICE", label: "공고" },
  { value: "COMMUNITY_POST", label: "커뮤니티 게시글" },
  { value: "COMMUNITY_COMMENT", label: "커뮤니티 댓글" },
  { value: "NOTICE_CHAT_ROOM", label: "공고 채팅방" },
  { value: "USER", label: "사용자" },
];

export const STATUS_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: REPORT_STATUS.PENDING, label: "대기" },
  { value: REPORT_STATUS.REVIEWING, label: "검토 중" },
  { value: REPORT_STATUS.RESOLVED, label: "해결됨" },
  { value: REPORT_STATUS.REJECTED, label: "기각됨" },
];

export function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "warning" | "outline" {
  switch (status) {
    case REPORT_STATUS.PENDING:
      return "destructive";
    case REPORT_STATUS.REVIEWING:
      return "warning";
    case REPORT_STATUS.RESOLVED:
      return "default";
    case REPORT_STATUS.REJECTED:
      return "secondary";
    default:
      return "outline";
  }
}

export function getReportStatusLabelKey(status: string): string {
  return (
    REPORT_STATUS_LABEL_KEY[status as ReportStatus] ??
    `reports.status.${status.toLowerCase()}`
  );
}

export function isReportActionable(status: string): boolean {
  return status === REPORT_STATUS.PENDING || status === REPORT_STATUS.REVIEWING;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ko-KR");
}
