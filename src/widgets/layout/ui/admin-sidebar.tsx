import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  MessageSquare,
  AlertTriangle,
  Bell,
  Server,
  History,
  Settings,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

const navGroups = [
  {
    titleKey: "sidebar.overview",
    items: [{ icon: LayoutDashboard, labelKey: "sidebar.dashboard", path: "/dashboard" }],
  },
  {
    titleKey: "sidebar.management",
    items: [
      { icon: Users, labelKey: "sidebar.users", path: "/users" },
      { icon: PawPrint, labelKey: "sidebar.notices", path: "/notices" },
      { icon: MessageSquare, labelKey: "sidebar.community", path: "/community" },
      { icon: AlertTriangle, labelKey: "sidebar.reports", path: "/reports" },
    ],
  },
  {
    titleKey: "sidebar.systemLogs",
    items: [
      { icon: Bell, labelKey: "sidebar.notifications", path: "/notifications" },
      { icon: Server, labelKey: "sidebar.services", path: "/services" },
      { icon: History, labelKey: "sidebar.audit", path: "/audit" },
      { icon: Settings, labelKey: "sidebar.settings", path: "/settings" },
    ],
  },
];

export function AdminSidebar() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b bg-card px-6 text-lg font-bold text-primary">
        {t("common.appName")}
      </div>
      <div className="flex flex-1 flex-col gap-6 py-4">
        {navGroups.map((group) => (
          <div key={group.titleKey} className="px-3">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t(group.titleKey)}
            </h3>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
}
