import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminLayout } from "@/widgets/layout/ui/admin-layout";
import { LoginPage } from "@/pages/login/ui/login-page";
import { DashboardPage } from "@/pages/dashboard/ui/dashboard-page";

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
        element: <div className="p-8">Users Page (WIP)</div>,
      },
      {
        path: "reports",
        element: <div className="p-8">Reports Page (WIP)</div>,
      },
      {
        path: "settings",
        element: <div className="p-8">Settings Page (WIP)</div>,
      },
    ],
  },
]);
