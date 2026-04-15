import { useAuthStore } from "@/features/auth/model/auth-store";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "react-i18next";
import { UiPreferenceControls } from "@/widgets/layout/ui/ui-preference-controls";

export function AdminHeader() {
  const { t } = useTranslation();
  const admin = useAuthStore((state) => state.admin);
  const logout = useAuthStore((state) => state.logout);
  const adminName = admin?.name || t("header.fallbackAdmin");

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6">
      <div className="font-semibold text-sm">{t("header.welcome", { name: adminName })}</div>
      <div className="flex items-center gap-2">
        <UiPreferenceControls />
        <Button variant="ghost" size="sm" onClick={logout}>
          {t("common.actions.logout")}
        </Button>
      </div>
    </header>
  );
}
