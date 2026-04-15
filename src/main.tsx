import React from "react";
import { createRoot } from "react-dom/client";
import "../styles/globals.css";
import { RouterProvider } from "react-router-dom";
import { AppProviders } from "@/app/providers/app-providers";
import { router } from "@/app/router";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </React.StrictMode>
);
