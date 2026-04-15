import { useTranslation } from "react-i18next";
import { ReportsTableSection } from "@/pages/reports/ui/sections/reports-table-section";

export function ReportsPage() {
  const { t } = useTranslation();

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("reports.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("reports.description")}
          </p>
        </div>
      </div>

      <ReportsTableSection />
    </div>
  );
}
