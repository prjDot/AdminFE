import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { setUnauthorizedHandler } from "@/shared/api/client";

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const forceLogout = useAuthStore((state) => state.forceLogout);

  useEffect(() => {
    setUnauthorizedHandler(forceLogout);
    return () => {
      setUnauthorizedHandler(() => {});
    };
  }, [forceLogout]);

  return <>{children}</>;
}
