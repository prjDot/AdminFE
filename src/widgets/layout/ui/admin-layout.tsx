import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

export function AdminLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
