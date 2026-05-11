import { useTranslation } from "react-i18next";
import { AdminPromotionDialog } from "@/features/users/ui/admin-promotion-dialog";
import { UsersTableSection } from "@/widgets/users-table/ui/users-table-section";

export function UsersPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("users.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("users.description")}</p>
        </div>
        <AdminPromotionDialog triggerLabel={t("common.actions.inviteAdmin")} />
      </div>

      <UsersTableSection />
    </div>
  );
}
