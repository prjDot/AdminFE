import React from "react";
import { createRoot } from "react-dom/client";
import "@/app/styles/globals.css";
import { RouterProvider } from "react-router-dom";
import { AppQueryClientProvider } from "@/app/providers/query-client";
import { router } from "@/app/router";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppQueryClientProvider>
      <RouterProvider router={router} />
    </AppQueryClientProvider>
  </React.StrictMode>
);
