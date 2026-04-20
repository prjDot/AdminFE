import { useTranslation } from "react-i18next";
import { ReportsTableSection } from "@/widgets/reports-table/ui/reports-table-section";

export function ReportsPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("reports.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("reports.description")}</p>
        </div>
      </div>

      <ReportsTableSection />
    </div>
  );
}
