import { useAuthStore } from "@/features/auth/model/auth-store";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "react-i18next";
import { UiPreferenceControls } from "@/widgets/layout/ui/ui-preference-controls";
import { Menu, Bell, LogOut, RefreshCw } from "lucide-react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/shared/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Link } from "react-router-dom";
import { AdminSidebar } from "./admin-sidebar";
import { useNotificationHistory } from "@/features/notifications/api/notification-hooks";

export function AdminHeader() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isFetching = useIsFetching();
  const admin = useAuthStore((state) => state.admin);
  const logout = useAuthStore((state) => state.logout);
  const adminName = admin?.name || t("header.fallbackAdmin");
  const { data: notificationData } = useNotificationHistory({
    page: 1,
    pageSize: 5,
  });
  const notifications = notificationData?.items ?? [];
  const handleRefresh = () => {
    void queryClient.invalidateQueries({
      refetchType: "active",
    });
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-card px-2 sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
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
        <div className="hidden max-w-[180px] truncate text-sm font-semibold sm:block lg:max-w-[320px]">
          {t("header.welcome", { name: adminName })}
        </div>
      </div>
      
      <div className="flex min-w-0 items-center gap-1 sm:gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          aria-label={t("common.actions.refresh")}
          disabled={isFetching > 0}
        >
          <RefreshCw className={isFetching > 0 ? "h-5 w-5 animate-spin" : "h-5 w-5"} />
        </Button>

        {/* Alerts Notification Bell */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative group">
              <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] max-w-80 p-0" align="end">
            <div className="px-4 py-3 border-b bg-muted/20">
              <h4 className="text-sm font-semibold">{t("notifications.title")}</h4>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">
                  {t("notifications.noHistory")}
                </div>
              ) : (
                notifications.map((note) => (
                <Link key={note.id} to="/notifications" className="flex gap-3 border-b p-4 transition-colors last:border-0 hover:bg-muted/50">
                  <div className="mt-0.5 rounded-full bg-background border p-1.5 h-7 w-7 flex items-center justify-center shadow-sm">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{note.title}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{note.body}</p>
                  </div>
                </Link>
                ))
              )}
            </div>
            <div className="p-2 border-t text-center">
              <Button variant="ghost" size="sm" className="w-full text-xs text-primary" asChild>
                <Link to="/notifications">{t("notifications.viewAll")}</Link>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

        <UiPreferenceControls />
        
        <Button variant="ghost" size="icon" onClick={() => logout()} className="ml-1 sm:hidden" aria-label={t("common.actions.logout")}>
          <LogOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => logout()} className="ml-1 hidden sm:inline-flex md:ml-2">
          {t("common.actions.logout")}
        </Button>
      </div>
    </header>
  );
}
