import { useMemo, useState } from "react";
import { addDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import {
  getDashboardOverview,
  getDashboardPriorities,
  getDashboardSummary,
  getDashboardTimeline,
} from "@/pages/dashboard/api/dashboard-api";
import { DashboardHeader } from "@/pages/dashboard/ui/sections/dashboard-header";
import { DashboardSummaryGrid } from "@/pages/dashboard/ui/sections/dashboard-summary-grid";
import { DashboardChartPanel } from "@/pages/dashboard/ui/sections/dashboard-chart-panel";
import { DashboardPriorityPanel } from "@/pages/dashboard/ui/sections/dashboard-priority-panel";
import { queryKeys } from "@/shared/api/query-keys";

export function DashboardPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  const dateParams = useMemo(() => {
    return {
      from: date?.from,
      to: date?.to,
    };
  }, [date]);

  const overviewQuery = useQuery({
    queryKey: queryKeys.dashboard.overview(),
    queryFn: getDashboardOverview,
    staleTime: 30_000,
  });

  const summaryQuery = useQuery({
    queryKey: queryKeys.dashboard.summary(dateParams),
    queryFn: () => getDashboardSummary(dateParams),
    staleTime: 30_000,
    refetchInterval: 5_000,
  });

  const timelineQuery = useQuery({
    queryKey: queryKeys.dashboard.timeline(dateParams),
    queryFn: () => getDashboardTimeline(dateParams),
    staleTime: 30_000,
  });

  const prioritiesQuery = useQuery({
    queryKey: queryKeys.dashboard.priorities(),
    queryFn: getDashboardPriorities,
    staleTime: 30_000,
  });

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <DashboardHeader date={date} setDate={setDate} />
      <DashboardSummaryGrid
        overview={overviewQuery.data}
        summary={summaryQuery.data}
        isLoading={overviewQuery.isLoading || summaryQuery.isLoading}
        error={overviewQuery.error || summaryQuery.error}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardChartPanel
          chartData={timelineQuery.data?.series ?? []}
          isLoading={timelineQuery.isLoading}
          error={timelineQuery.error}
        />
        <DashboardPriorityPanel
          items={prioritiesQuery.data ?? []}
          isLoading={prioritiesQuery.isLoading}
          error={prioritiesQuery.error}
        />
      </div>
    </div>
  );
}
