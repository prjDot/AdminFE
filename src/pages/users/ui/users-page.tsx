import { Button } from "@/shared/ui/button";
import { useTranslation } from "react-i18next";
import { UsersTableSection } from "@/widgets/users-table/ui/users-table-section";

export function UsersPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("users.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("users.description")}</p>
        </div>
        <Button>{t("common.actions.inviteAdmin")}</Button>
      </div>

      <UsersTableSection />
    </div>
  );
}
