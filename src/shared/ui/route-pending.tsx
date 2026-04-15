import { useTranslation } from "react-i18next";

export function RoutePending() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8">
      <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <span>{t("common.loading")}</span>
      </div>
    </div>
  );
}
