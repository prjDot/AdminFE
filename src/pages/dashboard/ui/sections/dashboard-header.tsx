import { useTranslation } from "react-i18next";
import { DatePickerWithRange } from "@/shared/ui/date-range-picker";
import type { DateRange } from "react-day-picker";

interface DashboardHeaderProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export function DashboardHeader({ date, setDate }: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("dashboard.description")}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t("dashboard.timeframe.label")}</span>
        <DatePickerWithRange date={date} setDate={setDate} />
      </div>
    </div>
  );
}
