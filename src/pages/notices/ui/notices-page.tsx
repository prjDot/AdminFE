import { useTranslation } from "react-i18next";
import { NoticesTableSection } from "@/pages/notices/ui/sections/notices-table-section";

export function NoticesPage() {
  const { t } = useTranslation();

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("notices.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("notices.description")}
          </p>
        </div>
      </div>

      <NoticesTableSection />
    </div>
  );
}
