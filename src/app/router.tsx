import type { ComponentType } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { RouteErrorPage } from "@/pages/error/ui/route-error-page";
import { RoutePending } from "@/shared/ui/route-pending";

const lazyComponent = <TModule,>(
  importer: () => Promise<TModule>,
  select: (module: TModule) => ComponentType
) => async () => {
  const module = await importer();
  return { Component: select(module) };
};

export const router = createBrowserRouter([
  {
    path: "/login",
    HydrateFallback: RoutePending,
    errorElement: <RouteErrorPage />,
    lazy: lazyComponent(
      () => import("@/pages/login/ui/login-page"),
      (module) => module.LoginPage
    ),
  },
  {
    path: "/login/mfa",
    HydrateFallback: RoutePending,
    errorElement: <RouteErrorPage />,
    lazy: lazyComponent(
      () => import("@/pages/otp/ui/otp-page"),
      (module) => module.OTPPage
    ),
  },
  {
    path: "/",
    HydrateFallback: RoutePending,
    errorElement: <RouteErrorPage />,
    lazy: lazyComponent(
      () => import("@/widgets/layout/ui/admin-layout"),
      (module) => module.AdminLayout
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        lazy: lazyComponent(
          () => import("@/pages/dashboard/ui/dashboard-page"),
          (module) => module.DashboardPage
        ),
      },
      {
        path: "users",
        lazy: lazyComponent(
          () => import("@/pages/users/ui/users-page"),
          (module) => module.UsersPage
        ),
      },
      {
        path: "notices",
        lazy: lazyComponent(
          () => import("@/pages/notices/ui/notices-page"),
          (module) => module.NoticesPage
        ),
      },
      {
        path: "community",
        lazy: lazyComponent(
          () => import("@/pages/community/ui/community-page"),
          (module) => module.CommunityPage
        ),
      },
      {
        path: "reports",
        lazy: lazyComponent(
          () => import("@/pages/reports/ui/reports-page"),
          (module) => module.ReportsPage
        ),
      },
      {
        path: "notifications",
        lazy: lazyComponent(
          () => import("@/pages/notifications/ui/notifications-page"),
          (module) => module.NotificationsPage
        ),
      },
      {
        path: "services",
        lazy: lazyComponent(
          () => import("@/pages/services/ui/services-page"),
          (module) => module.ServicesPage
        ),
      },
      {
        path: "audit",
        lazy: lazyComponent(
          () => import("@/pages/audit/ui/audit-page"),
          (module) => module.AuditPage
        ),
      },
      {
        path: "settings",
        lazy: lazyComponent(
          () => import("@/pages/settings/ui/settings-page"),
          (module) => module.SettingsPage
        ),
      },
      {
        path: "*",
        lazy: lazyComponent(
          () => import("@/pages/error/ui/not-found-page"),
          (module) => module.NotFoundPage
        ),
      },
    ],
  },
]);
