import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { Button } from "@/shared/ui/button";
import { FormStatus } from "@/shared/ui/form-status";
import { Input } from "@/shared/ui/input";

export function LoginPage() {
  const { t } = useTranslation();
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const step = useAuthStore((state) => state.step);
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession);
  const requestLogin = useAuthStore((state) => state.requestLogin);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [errorSeconds, setErrorSeconds] = useState<number | undefined>(undefined);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  if (bootstrapped && step === "AUTHENTICATED") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();

    const result = requestLogin(email, password);
    if (!result.ok) {
      setErrorKey(result.messageKey ?? "auth.errors.unexpected");
      setErrorSeconds(result.remainingSeconds);
      return;
    }

    setErrorKey(null);
    setErrorSeconds(undefined);
    navigate(result.nextStep === "OTP_REQUIRED" ? "/login/mfa" : "/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="mb-6 text-center text-2xl font-bold">{t("login.title")}</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder={t("login.username")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
          <Input
            type="password"
            placeholder={t("login.password")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          {errorKey && (
            <FormStatus
              tone="error"
              message={
                errorKey === "auth.errors.locked"
                  ? t(errorKey, { seconds: errorSeconds ?? 0 })
                  : t(errorKey)
              }
            />
          )}
          <Button type="submit" className="w-full">
            {t("login.signIn")}
          </Button>
        </form>
      </div>
    </div>
  );
}
