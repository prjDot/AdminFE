import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardHeader } from "@/pages/dashboard/ui/sections/dashboard-header";
import { DashboardSummaryGrid } from "@/pages/dashboard/ui/sections/dashboard-summary-grid";
import { DashboardChartPanel } from "@/pages/dashboard/ui/sections/dashboard-chart-panel";
import { DashboardPriorityPanel } from "@/pages/dashboard/ui/sections/dashboard-priority-panel";

type Timeframe = "TODAY" | "WEEKLY" | "MONTHLY";

const buildChartData = (timeframe: Timeframe, dayLabel: (day: number) => string) => {
  if (timeframe === "TODAY") {
    return Array.from({ length: 24 }).map((_, index) => ({
      name: `${index}h`,
      notices: [0, 1, 1, 0, 0, 1, 2, 3, 4, 5, 4, 6, 5, 7, 8, 7, 6, 5, 4, 3, 2, 2, 1, 1][index] ?? 0,
      reports: [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 1, 3, 2, 2, 3, 2, 2, 1, 1, 1, 0, 1, 0, 0][index] ?? 0,
    }));
  }

  if (timeframe === "WEEKLY") {
    return [
      { name: dayLabel(1), notices: 8, reports: 3 },
      { name: dayLabel(2), notices: 11, reports: 2 },
      { name: dayLabel(3), notices: 9, reports: 1 },
      { name: dayLabel(4), notices: 13, reports: 4 },
      { name: dayLabel(5), notices: 10, reports: 3 },
      { name: dayLabel(6), notices: 7, reports: 2 },
      { name: dayLabel(7), notices: 12, reports: 5 },
    ];
  }

  return Array.from({ length: 30 }).map((_, index) => ({
    name: `D${index + 1}`,
    notices: ((index % 6) + 1) * 3 + (index % 4),
    reports: (index % 5) + (index % 3),
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
