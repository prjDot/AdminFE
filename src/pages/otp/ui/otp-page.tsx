import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { KeyRound } from "lucide-react";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { Button } from "@/shared/ui/button";
import { FormStatus } from "@/shared/ui/form-status";

export function OTPPage() {
  const { t } = useTranslation();
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    step,
    tempEmail,
    bootstrapSession,
    completePasskeyStep,
    isAuthenticating,
  } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  if (step === "NONE" || step === "EMAIL_VERIFICATION_REQUIRED") {
    return <Navigate to="/login" replace />;
  }

  if (step === "AUTHENTICATED") {
    return <Navigate to="/dashboard" replace />;
  }

  const isEnroll = step === "PASSKEY_ENROLL";
  const handleVerify = async () => {
    setErrorKey(null);
    setErrorMessage(null);
    const result = await completePasskeyStep();

    if (!result.ok) {
      setErrorKey(result.messageKey ?? "auth.errors.unexpected");
      setErrorMessage(result.message ?? null);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isEnroll ? t("passkey.enrollTitle") : t("passkey.verifyTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isEnroll ? t("passkey.enrollDescription") : t("passkey.verifyDescription")}
              {tempEmail ? <strong className="block pt-1">{tempEmail}</strong> : null}
            </p>
          </div>
        </div>
        <div className="space-y-4">
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
            onClick={handleVerify}
            disabled={isAuthenticating}
          >
            {isAuthenticating
              ? t("common.loading")
              : isEnroll
                ? t("passkey.startEnroll")
                : t("passkey.startVerify")}
          </Button>
        </div>
      </div>
    </div>
  );
}
