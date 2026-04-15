import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Users, AlertTriangle, PawPrint, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const generateMockData = (dayLabel: (day: number) => string) => {
  return Array.from({ length: 7 }).map((_, i) => ({
    name: dayLabel(i + 1),
    notices: Math.floor(Math.random() * 50) + 10,
    reports: Math.floor(Math.random() * 20),
  }));
};

export function DashboardPage() {
  const { t } = useTranslation();
  const chartData = useMemo(() => generateMockData((day) => t("dashboard.charts.day", { day })), [t]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("dashboard.description")}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title={t("dashboard.summary.totalUsers")}
          value="12,450"
          icon={Users}
          trend="+12%"
          trendLabel={t("dashboard.summary.fromLastMonth")}
        />
        <SummaryCard
          title={t("dashboard.summary.activeNotices")}
          value="3,210"
          icon={PawPrint}
          trend="+5%"
          trendLabel={t("dashboard.summary.fromLastMonth")}
        />
        <SummaryCard
          title={t("dashboard.summary.unresolvedReports")}
          value="45"
          icon={AlertTriangle}
          trend="-2%"
          trendLabel={t("dashboard.summary.fromLastWeek")}
          alert
        />
        <SummaryCard
          title={t("dashboard.summary.resolvedCases")}
          value="892"
          icon={CheckCircle2}
          trend="+18%"
          trendLabel={t("dashboard.summary.fromLastMonth")}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="p-6 border rounded-xl bg-card shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-4">{t("dashboard.charts.newNotices")}</h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="notices"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="p-6 border rounded-xl bg-card shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-4">{t("dashboard.charts.reports")}</h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "var(--muted)" }} />
                <Bar
                  dataKey="reports"
                  fill="var(--destructive)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  alert,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: string;
  trendLabel: string;
  alert?: boolean;
}) {
  return (
    <div className="p-6 border rounded-xl bg-card shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        <div className={`p-2 rounded-full ${alert ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">
          <span className={trend.startsWith("+") ? "font-medium text-success" : "font-medium text-destructive"}>
            {trend}
          </span>{" "}
          {trendLabel}
        </p>
      </div>
    </div>
  );
}
