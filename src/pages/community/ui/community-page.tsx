import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { CommunityTableSection } from "@/widgets/community-table/ui/community-table-section";

export function CommunityPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("community.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("community.description")}</p>
        </div>
        <Button variant="outline">{t("common.actions.manageCategories")}</Button>
      </div>

      <CommunityTableSection />
    </div>
  );
}
