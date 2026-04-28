import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              stroke="var(--color-border)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                boxShadow: "0 12px 32px rgb(0 0 0 / 0.24)",
                color: "var(--color-popover-foreground)",
              }}
              cursor={{
                stroke: "var(--color-muted-foreground)",
                strokeOpacity: 0.35,
                strokeWidth: 1,
              }}
              itemStyle={{ color: "var(--color-popover-foreground)" }}
              labelStyle={{
                color: "var(--color-muted-foreground)",
                fontWeight: 600,
                marginBottom: 4,
              }}
            />
            <Line
              type="monotone"
              dataKey="notices"
              name={t("dashboard.charts.newNotices")}
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{
                fill: "var(--color-primary)",
                r: 5,
                stroke: "var(--color-background)",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
