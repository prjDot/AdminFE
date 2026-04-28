import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { Button } from "@/shared/ui/button";
import { FormStatus } from "@/shared/ui/form-status";
import { Input } from "@/shared/ui/input";

export function OTPPage() {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const { step, tempEmail, verifyOtp, bootstrapSession } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  if (step === "NONE") {
    return <Navigate to="/login" replace />;
  }

  if (step === "AUTHENTICATED") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleVerify = (event: React.FormEvent) => {
    event.preventDefault();

    const result = verifyOtp(code);
    if (!result.ok) {
      setErrorKey(result.messageKey ?? "auth.errors.unexpected");
      return;
    }

    setErrorKey(null);
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="mb-2 text-center text-2xl font-bold">{t("otp.title")}</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          {t("otp.description")} <strong>{tempEmail}</strong>
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            type="text"
            inputMode="numeric"
            placeholder={t("otp.codePlaceholder")}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            maxLength={6}
            required
            className="h-14 text-center font-mono text-2xl tracking-[0.5em]"
          />
          {errorKey && <FormStatus tone="error" message={t(errorKey)} />}
          <Button type="submit" className="h-11 w-full" disabled={code.length < 6}>
            {t("otp.verify")}
          </Button>
        </form>
      </div>
    </div>
  );
}
