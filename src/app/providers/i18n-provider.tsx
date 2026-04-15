import type { ReactNode } from "react";
import "@/shared/i18n/config";

export function I18nProvider({ children }: { children: ReactNode }) {
  return children;
}
