import { AlertTriangle, Bell, CheckCircle2, UserPlus, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DashboardSummaryGridProps {
  timeframe: "TODAY" | "WEEKLY" | "MONTHLY";
}

function SummaryCard({
  title,
  value,
  Icon,
  alert = false,
}: {
  title: string;
  value: string;
  Icon: React.ElementType;
  alert?: boolean;
}) {
  return (
    <div className={`flex flex-col rounded-xl border bg-card p-5 shadow-sm ${alert ? "border-destructive/20" : ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        <div className={`rounded-full p-2 ${alert ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export function DashboardSummaryGrid({ timeframe }: DashboardSummaryGridProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
      <SummaryCard
        title={t("dashboard.summary.reportedNotices")}
        value={timeframe === "TODAY" ? "12" : "56"}
        Icon={AlertTriangle}
        alert
      />
      <SummaryCard
        title={t("dashboard.summary.resolvedNotices")}
        value={timeframe === "TODAY" ? "4" : "120"}
        Icon={CheckCircle2}
      />
      <SummaryCard
        title={t("dashboard.summary.userReports")}
        value={timeframe === "TODAY" ? "3" : "45"}
        Icon={Bell}
      />
      <SummaryCard title={t("dashboard.summary.totalUsers")} value="12,450" Icon={Users} />
      <SummaryCard
        title={t("dashboard.summary.newSignups")}
        value={timeframe === "TODAY" ? "21" : "345"}
        Icon={UserPlus}
      />
    </div>
  );
}
