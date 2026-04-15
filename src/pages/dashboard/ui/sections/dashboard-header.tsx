import { useTranslation } from "react-i18next";

interface DashboardHeaderProps {
  timeframe: "TODAY" | "WEEKLY" | "MONTHLY";
  onChangeTimeframe: (value: "TODAY" | "WEEKLY" | "MONTHLY") => void;
}

export function DashboardHeader({ timeframe, onChangeTimeframe }: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("dashboard.description")}</p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{t("dashboard.timeframe.label")}</span>
        <select
          className="rounded-md border border-input bg-background px-3 py-2"
          value={timeframe}
          onChange={(event) => onChangeTimeframe(event.target.value as "TODAY" | "WEEKLY" | "MONTHLY")}
        >
          <option value="TODAY">{t("dashboard.timeframe.today")}</option>
          <option value="WEEKLY">{t("dashboard.timeframe.weekly")}</option>
          <option value="MONTHLY">{t("dashboard.timeframe.monthly")}</option>
        </select>
      </label>
    </div>
  );
}
