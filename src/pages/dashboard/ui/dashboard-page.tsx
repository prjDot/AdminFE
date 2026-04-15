import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardHeader } from "@/pages/dashboard/ui/sections/dashboard-header";
import { DashboardSummaryGrid } from "@/pages/dashboard/ui/sections/dashboard-summary-grid";
import { DashboardChartPanel } from "@/pages/dashboard/ui/sections/dashboard-chart-panel";
import { DashboardPriorityPanel } from "@/pages/dashboard/ui/sections/dashboard-priority-panel";

type Timeframe = "TODAY" | "WEEKLY" | "MONTHLY";

const buildChartData = (timeframe: Timeframe, dayLabel: (day: number) => string) => {
  const points = timeframe === "TODAY" ? 24 : timeframe === "WEEKLY" ? 7 : 30;

  return Array.from({ length: points }).map((_, index) => ({
    name: timeframe === "TODAY" ? `${index}h` : timeframe === "WEEKLY" ? dayLabel(index + 1) : `D${index + 1}`,
    notices: Math.floor(Math.random() * (timeframe === "MONTHLY" ? 50 : 10)) + 1,
    reports: Math.floor(Math.random() * (timeframe === "MONTHLY" ? 20 : 5)),
  }));
};

export function DashboardPage() {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState<Timeframe>("WEEKLY");
  const chartData = useMemo(
    () => buildChartData(timeframe, (day) => t("dashboard.charts.day", { day })),
    [timeframe, t]
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <DashboardHeader timeframe={timeframe} onChangeTimeframe={setTimeframe} />
      <DashboardSummaryGrid timeframe={timeframe} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardChartPanel chartData={chartData} />
        <DashboardPriorityPanel />
      </div>
    </div>
  );
}
