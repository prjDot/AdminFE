import {
  Activity,
  Bell,
  CheckCircle2,
  Users,
  MessageSquare,
  FileText,
  Server
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface DashboardSummaryGridProps {
  timeframe: "TODAY" | "WEEKLY" | "MONTHLY";
}

function SummaryCard({
  title,
  value,
  Icon,
  alert = false,
  statusDot = false,
  statusColor = "bg-green-500",
}: {
  title: string;
  value: string;
  Icon: React.ElementType;
  alert?: boolean;
  statusDot?: boolean;
  statusColor?: string;
}) {
  return (
    <div className={`flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${alert ? "border-destructive/20" : ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        <div className={`relative rounded-full p-2 ${alert ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          <Icon className="h-4 w-4" />
          {statusDot && (
            <span className={`absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5`}>
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${statusColor}`}></span>
              <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${statusColor}`}></span>
            </span>
          )}
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export function DashboardSummaryGrid({ timeframe }: DashboardSummaryGridProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Live Status Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title={t("dashboard.summary.currentActiveUsers")}
          value="1,280"
          Icon={Activity}
          statusDot
          statusColor="bg-green-500"
        />
        <SummaryCard
          title={t("dashboard.summary.serverStatus")}
          value={t("dashboard.summary.serverOperational")}
          Icon={Server}
          statusDot
          statusColor="bg-green-500"
        />
      </div>

      {/* Timeframe Summary Grid */}
      <h3 className="text-lg font-semibold tracking-tight">{t("dashboard.summary.timeframeMetrics", { timeframe: t(`dashboard.timeframe.${timeframe.toLowerCase()}`) })}</h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        <SummaryCard
          title={t("dashboard.summary.newUsers")}
          value={timeframe === "TODAY" ? "42" : timeframe === "WEEKLY" ? "345" : "1,890"}
          Icon={Users}
        />
        <SummaryCard
          title={t("dashboard.summary.announcementsPosted")}
          value={timeframe === "TODAY" ? "3" : timeframe === "WEEKLY" ? "12" : "45"}
          Icon={FileText}
        />
        <SummaryCard
          title={t("dashboard.summary.communityPosts")}
          value={timeframe === "TODAY" ? "156" : timeframe === "WEEKLY" ? "892" : "4,120"}
          Icon={MessageSquare}
        />
        <SummaryCard
          title={t("dashboard.summary.processedTasks")}
          value={timeframe === "TODAY" ? "89" : timeframe === "WEEKLY" ? "520" : "2,300"}
          Icon={CheckCircle2}
        />
        <SummaryCard
          title={t("dashboard.summary.userReports")}
          value={timeframe === "TODAY" ? "12" : timeframe === "WEEKLY" ? "56" : "180"}
          Icon={Bell}
          alert
        />
      </div>
    </div>
  );
}
