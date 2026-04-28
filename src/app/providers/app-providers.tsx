import type { ReactNode } from "react";
import { I18nProvider } from "@/app/providers/i18n-provider";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { AppQueryClientProvider } from "@/app/providers/query-client";
import { AuthSessionProvider } from "@/app/providers/auth-session-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AppQueryClientProvider>
          <AuthSessionProvider>{children}</AuthSessionProvider>
        </AppQueryClientProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
