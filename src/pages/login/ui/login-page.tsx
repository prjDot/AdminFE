import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { isFirebaseConfigured } from "@/features/auth/api/firebase-auth";
import { Button } from "@/shared/ui/button";
import { FormStatus } from "@/shared/ui/form-status";

export function LoginPage() {
  const { t } = useTranslation();
  const step = useAuthStore((state) => state.step);
  const requestGoogleLogin = useAuthStore((state) => state.requestGoogleLogin);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const navigate = useNavigate();

  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (step === "AUTHENTICATED") {
    return <Navigate to="/dashboard" replace />;
  }

  if (step === "PASSKEY_ENROLL" || step === "MFA_PENDING") {
    return <Navigate to="/login/mfa" replace />;
  }

  const handleGoogleLogin = async () => {
    setErrorKey(null);
    setErrorMessage(null);
    const result = await requestGoogleLogin();

    if (!result.ok) {
      setErrorKey(result.messageKey ?? "auth.errors.unexpected");
      setErrorMessage(result.message ?? null);
      return;
    }

    if (result.nextStep === "EMAIL_VERIFICATION_REQUIRED") {
      setErrorKey("auth.errors.emailVerificationRequired");
      return;
    }

    navigate("/login/mfa");
  };

  const firebaseConfigMissing = !isFirebaseConfigured();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("login.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("login.googleDescription")}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {firebaseConfigMissing ? (
            <FormStatus
              tone="error"
              message={t("auth.errors.firebaseConfigMissing")}
            />
          ) : null}
          {errorKey ? (
            <FormStatus
              tone="error"
              message={
                import.meta.env.DEV && errorMessage
                  ? `${t(errorKey)} (${errorMessage})`
                  : t(errorKey)
              }
            />
          ) : null}
          <Button
            type="button"
            className="h-11 w-full"
            onClick={handleGoogleLogin}
            disabled={isAuthenticating || firebaseConfigMissing}
          >
            {isAuthenticating ? t("common.loading") : t("login.googleSignIn")}
          </Button>
        </div>
      </div>
    </div>
  );
}
