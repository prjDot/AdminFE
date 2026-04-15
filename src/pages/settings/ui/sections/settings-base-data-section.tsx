import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";

export function SettingsBaseDataSection() {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b bg-muted px-6 py-4">
        <h2 className="text-lg font-semibold">{t("settings.baseDataTitle")}</h2>
        <Button variant="outline" size="sm">
          {t("common.actions.editMode")}
        </Button>
      </div>
      <div className="space-y-4 p-6 text-sm">
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium text-muted-foreground">{t("settings.animalTypes")}</span>
          <span>1,204 entries</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="font-medium text-muted-foreground">{t("settings.regionCodes")}</span>
          <span>256 entries</span>
        </div>
        <div className="flex justify-between pb-2">
          <span className="font-medium text-muted-foreground">{t("settings.noticeStatusLabels")}</span>
          <span>4 entries</span>
        </div>
      </div>
    </div>
  );
}
