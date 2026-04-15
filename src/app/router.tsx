import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "@/widgets/layout/ui/admin-layout";
import { LoginPage } from "@/pages/login/ui/login-page";
import { DashboardPage } from "@/pages/dashboard/ui/dashboard-page";
import { UsersPage } from "@/pages/users/ui/users-page";
import { NoticesPage } from "@/pages/notices/ui/notices-page";
import { CommunityPage } from "@/pages/community/ui/community-page";
import { ReportsPage } from "@/pages/reports/ui/reports-page";
import { NotificationsPage } from "@/pages/notifications/ui/notifications-page";
import { ServicesPage } from "@/pages/services/ui/services-page";
import { AuditPage } from "@/pages/audit/ui/audit-page";
import { SettingsPage } from "@/pages/settings/ui/settings-page";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "notices",
        element: <NoticesPage />,
      },
      {
        path: "community",
        element: <CommunityPage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "services",
        element: <ServicesPage />,
      },
      {
        path: "audit",
        element: <AuditPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);
