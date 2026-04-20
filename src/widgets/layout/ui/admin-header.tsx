import { useAuthStore } from "@/features/auth/model/auth-store";
import { Button } from "@/shared/ui/button";
import { useTranslation } from "react-i18next";
import { UiPreferenceControls } from "@/widgets/layout/ui/ui-preference-controls";
import { Menu, Bell, AlertCircle, FileText, User as UserIcon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/shared/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Link } from "react-router-dom";
import { AdminSidebar } from "./admin-sidebar";

const mockNotifications = [
  { id: 1, type: "report", title: "New High-Priority Report", desc: "Spam reported on Post #P001", to: "/reports", icon: AlertCircle, color: "text-destructive" },
  { id: 2, type: "notice", title: "Missing Notice Matched", desc: "Similar cat found in Seoul", to: "/notices", icon: FileText, color: "text-amber-500" },
  { id: 3, type: "user", title: "New Manager Joined", desc: "Admin User #U002 registered", to: "/users", icon: UserIcon, color: "text-primary" },
];

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
      
      <div className="flex items-center gap-4">
        {/* Alerts Notification Bell */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative group">
              <Bell className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="px-4 py-3 border-b bg-muted/20">
              <h4 className="text-sm font-semibold">Notifications</h4>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {mockNotifications.map((note) => (
                <Link key={note.id} to={note.to} className="flex gap-3 p-4 hover:bg-muted/50 border-b last:border-0 transition-colors">
                  <div className={`mt-0.5 rounded-full bg-background border p-1.5 h-7 w-7 flex items-center justify-center shadow-sm`}>
                    <note.icon className={`h-4 w-4 ${note.color}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{note.title}</p>
                    <p className="text-xs text-muted-foreground">{note.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="p-2 border-t text-center">
              <Button variant="ghost" size="sm" className="w-full text-xs text-primary">Mark all as read</Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="hidden sm:block w-px h-6 bg-border mx-1" />

        <UiPreferenceControls />
        
        <Button variant="ghost" size="sm" onClick={logout} className="ml-2">
          {t("common.actions.logout")}
        </Button>
      </div>
    </header>
  );
}
