import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  PawPrint,
  MessageSquare,
  AlertTriangle,
  Bell,
  Server,
  History,
  Settings 
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

const navGroups = [
  {
    title: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    ]
  },
  {
    title: "Management",
    items: [
      { icon: Users, label: "Users", path: "/users" },
      { icon: PawPrint, label: "Notices", path: "/notices" },
      { icon: MessageSquare, label: "Community", path: "/community" },
      { icon: AlertTriangle, label: "Reports", path: "/reports" },
    ]
  },
  {
    title: "System & Logs",
    items: [
      { icon: Bell, label: "Notifications", path: "/notifications" },
      { icon: Server, label: "Services & API", path: "/services" },
      { icon: History, label: "Audit Logs", path: "/audit" },
      { icon: Settings, label: "Settings", path: "/settings" },
    ]
  }
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-full overflow-y-auto">
      <div className="h-14 flex flex-shrink-0 items-center px-6 border-b font-bold text-lg text-primary sticky top-0 bg-card z-10">
        PawGen Admin
      </div>
      <div className="flex-1 py-4 flex flex-col gap-6">
        {navGroups.map((group) => (
          <div key={group.title} className="px-3">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {group.title}
            </h3>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}
