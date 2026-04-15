import { Button } from "@/shared/ui/button";
import { useTranslation } from "react-i18next";
import { CommunityTableSection } from "@/pages/community/ui/sections/community-table-section";

export function CommunityPage() {
  const { t } = useTranslation();

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("community.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("community.description")}
          </p>
        </div>
        <Button variant="outline">{t("common.actions.manageCategories")}</Button>
      </div>

      <CommunityTableSection />
    </div>
  );
}
