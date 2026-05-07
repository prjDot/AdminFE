import {
  Activity,
  Bell,
  CheckCircle2,
  EyeOff,
  FileText,
  MessageSquare,
  Server,
  ShieldAlert,
  Users,
} from "lucide-react";
import type {
  AdminDashboardResponse,
  AdminDashboardSummaryResponse,
} from "@/pages/dashboard/api/dashboard-api";
import type { SummaryCardProps } from "@/pages/dashboard/ui/sections/dashboard-summary-card";

interface BuildDashboardSummaryCardsParams {
  overview?: AdminDashboardResponse;
  summary?: AdminDashboardSummaryResponse;
  isLoading: boolean;
  isUnavailable: boolean;
  loadingText: string;
  t: (key: string) => string;
}

function formatNumber(value?: number) {
  return typeof value === "number" ? value.toLocaleString() : "-";
}

function getServerStatusColor(status?: string) {
  const normalized = status?.toUpperCase();
  if (normalized === "UP" || normalized === "OK" || normalized === "HEALTHY") {
    return "bg-green-500";
  }
  if (normalized === "DEGRADED" || normalized === "WARN") {
    return "bg-yellow-500";
  }
  return "bg-red-500";
}

function valueOrLoading(isLoading: boolean, loadingText: string, value?: number) {
  return isLoading ? loadingText : formatNumber(value);
}

export function buildDashboardSummaryCards({
  overview,
  summary,
  isLoading,
  isUnavailable,
  loadingText,
  t,
}: BuildDashboardSummaryCardsParams) {
  const hiddenContent =
    (overview?.hiddenCommunityPosts ?? 0) + (overview?.hiddenMissingPosts ?? 0);
  const liveCards: SummaryCardProps[] = [
    {
      title: t("dashboard.summary.currentActiveUsers"),
      value: valueOrLoading(isLoading, loadingText, summary?.connectedUsers),
      Icon: Activity,
      statusDot: true,
      statusColor: isUnavailable ? "bg-red-500" : "bg-green-500",
    },
    {
      title: t("dashboard.summary.serverStatus"),
      value: isLoading ? loadingText : summary?.serverStatus || "-",
      Icon: Server,
      statusDot: true,
      statusColor: isUnavailable ? "bg-red-500" : getServerStatusColor(summary?.serverStatus),
    },
    {
      title: t("dashboard.summary.todayReports"),
      value: valueOrLoading(isLoading, loadingText, overview?.todayReports),
      Icon: Bell,
      alert: true,
    },
    {
      title: t("dashboard.summary.pendingReports"),
      value: valueOrLoading(isLoading, loadingText, overview?.pendingReports),
      Icon: ShieldAlert,
      alert: true,
    },
  ];
  const rangeCards: SummaryCardProps[] = [
    {
      title: t("dashboard.summary.newUsers"),
      value: valueOrLoading(isLoading, loadingText, summary?.newUsers),
      Icon: Users,
    },
    {
      title: t("dashboard.summary.announcementsPosted"),
      value: valueOrLoading(isLoading, loadingText, summary?.announcementsPosted),
      Icon: FileText,
    },
    {
      title: t("dashboard.summary.communityPosts"),
      value: valueOrLoading(isLoading, loadingText, summary?.communityPosts),
      Icon: MessageSquare,
    },
    {
      title: t("dashboard.summary.processedTasks"),
      value: valueOrLoading(isLoading, loadingText, summary?.processedTasks),
      Icon: CheckCircle2,
    },
    {
      title: t("dashboard.summary.userReports"),
      value: valueOrLoading(isLoading, loadingText, summary?.userReports),
      Icon: Bell,
      alert: true,
    },
    {
      title: t("dashboard.summary.hiddenContent"),
      value: valueOrLoading(isLoading, loadingText, hiddenContent),
      Icon: EyeOff,
    },
    {
      title: t("dashboard.summary.sanctionedUsers"),
      value: valueOrLoading(isLoading, loadingText, overview?.sanctionedUsers),
      Icon: Users,
      alert: true,
    },
  ];

  return { liveCards, rangeCards };
}
