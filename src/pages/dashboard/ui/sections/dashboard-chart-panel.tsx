import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useTranslation } from "react-i18next";

interface DashboardChartPanelProps {
  chartData: Array<{
    name: string;
    notices: number;
    reports: number;
  }>;
}

export function DashboardChartPanel({ chartData }: DashboardChartPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{t("dashboard.charts.timeline")}</h2>
      <div className="min-h-[300px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="notices" name={t("dashboard.charts.newNotices")} stroke="var(--color-primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
