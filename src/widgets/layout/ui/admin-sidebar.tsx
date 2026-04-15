import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileWarning, Settings } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Users", path: "/users" },
  { icon: FileWarning, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="h-14 flex items-center px-6 border-b font-bold text-lg text-primary">
        Admin Web
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
