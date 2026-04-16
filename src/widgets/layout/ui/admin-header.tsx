import { useAuthStore } from "@/features/auth/model/auth-store";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "react-i18next";
import { UiPreferenceControls } from "@/widgets/layout/ui/ui-preference-controls";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/shared/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";

export function AdminHeader() {
  const { t } = useTranslation();
  const admin = useAuthStore((state) => state.admin);
  const logout = useAuthStore((state) => state.logout);
  const adminName = admin?.name || t("header.fallbackAdmin");

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <AdminSidebar />
          </SheetContent>
        </Sheet>
        <div className="text-sm font-semibold">{t("header.welcome", { name: adminName })}</div>
      </div>
      <div className="flex items-center gap-2">
        <UiPreferenceControls />
        <Button variant="ghost" size="sm" onClick={logout}>
          {t("common.actions.logout")}
        </Button>
      </div>
    </header>
  );
}
