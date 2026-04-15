import { Button } from "@/shared/ui/button";
import { useTranslation } from "react-i18next";
import { UsersTableSection } from "@/pages/users/ui/sections/users-table-section";

export function UsersPage() {
  const { t } = useTranslation();

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("users.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("users.description")}
          </p>
        </div>
        <Button>{t("common.actions.inviteAdmin")}</Button>
      </div>

      <UsersTableSection />
    </div>
  );
}
