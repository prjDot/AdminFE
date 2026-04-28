import { useEffect } from "react";
import { Outlet, Navigate, useNavigation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { Toaster } from "@/shared/ui/sonner";
import { RoutePending } from "@/shared/ui/route-pending";

export function AdminLayout() {
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const step = useAuthStore((state) => state.step);
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession);
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  if (!bootstrapped) {
    return <RoutePending />;
  }

  if (step !== "AUTHENTICATED") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-card">
        <AdminSidebar />
      </aside>
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader />
        {isNavigating && (
          <div className="h-0.5 w-full overflow-hidden bg-border">
            <div className="h-full w-1/3 animate-pulse bg-primary" />
          </div>
        )}
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}
