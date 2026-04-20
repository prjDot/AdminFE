import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { addDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { DashboardHeader } from "@/pages/dashboard/ui/sections/dashboard-header";
import { DashboardSummaryGrid } from "@/pages/dashboard/ui/sections/dashboard-summary-grid";
import { DashboardChartPanel } from "@/pages/dashboard/ui/sections/dashboard-chart-panel";
import { DashboardPriorityPanel } from "@/pages/dashboard/ui/sections/dashboard-priority-panel";

// Mock data builder scaled by date diff length
const buildChartData = (daysCount: number, dayLabel: (day: number) => string) => {
  if (daysCount === 1) {
    return Array.from({ length: 24 }).map((_, index) => ({
      name: `${index}h`,
      notices: [0, 1, 1, 0, 0, 1, 2, 3, 4, 5, 4, 6, 5, 7, 8, 7, 6, 5, 4, 3, 2, 2, 1, 1][index] ?? 0,
      reports: [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 1, 3, 2, 2, 3, 2, 2, 1, 1, 1, 0, 1, 0, 0][index] ?? 0,
    }));
  }

  // Normal daily generation
  return Array.from({ length: Math.min(daysCount, 30) }).map((_, index) => ({
    name: dayLabel(index + 1),
    notices: ((index % 6) + 1) * 3 + (index % 4),
    reports: (index % 5) + (index % 3),
  }));
};

export function DashboardPage() {
  const { t } = useTranslation();
  
  // Convert standard Timeframe concept into actual Dates
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  const daysDiff = useMemo(() => {
    if (!date?.from || !date?.to) return 7; // Default 7 days
    const diffTime = Math.abs(date.to.getTime() - date.from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays; // handle same day selection
  }, [date]);

  const chartData = useMemo(
    () => buildChartData(daysDiff, (day) => t("dashboard.charts.day", { day })),
    [daysDiff, t]
  );

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <DashboardHeader date={date} setDate={setDate} />
      {/* Pass daysDiff to summary scale its simulated values */}
      <DashboardSummaryGrid daysScale={daysDiff} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardChartPanel chartData={chartData} />
        <DashboardPriorityPanel />
      </div>
    </div>
  );
}
