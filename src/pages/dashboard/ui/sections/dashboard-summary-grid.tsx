import { useTranslation } from "react-i18next";
import type {
  AdminDashboardResponse,
  AdminDashboardSummaryResponse,
} from "@/pages/dashboard/api/dashboard-api";
import { SummaryCard } from "@/pages/dashboard/ui/sections/dashboard-summary-card";
import { buildDashboardSummaryCards } from "@/pages/dashboard/ui/sections/dashboard-summary-card-data";

interface DashboardSummaryGridProps {
  overview?: AdminDashboardResponse;
  summary?: AdminDashboardSummaryResponse;
  isLoading: boolean;
  error: Error | null;
}

export function DashboardSummaryGrid({
  overview,
  summary,
  isLoading,
  error,
}: DashboardSummaryGridProps) {
  const { t } = useTranslation();
  const isUnavailable = Boolean(error);
  const loadingText = t("common.loading");
  const { liveCards, rangeCards } = buildDashboardSummaryCards({
    overview,
    summary,
    isLoading,
    isUnavailable,
    loadingText,
    t,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {liveCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>

      <h3 className="text-lg font-semibold tracking-tight">
        {t("dashboard.summary.selectedRangeMetrics")}
      </h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {rangeCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </div>
      {error ? (
        <p className="text-sm text-destructive">
          {t("dashboard.errors.summaryLoadFailed")}
        </p>
      ) : null}
    </div>
  );
}
