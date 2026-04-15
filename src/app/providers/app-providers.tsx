import type { ReactNode } from "react";
import { AppQueryClientProvider } from "@/app/providers/query-client";
import { I18nProvider } from "@/app/providers/i18n-provider";
import { ThemeProvider } from "@/app/providers/theme-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AppQueryClientProvider>{children}</AppQueryClientProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
