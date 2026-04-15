import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function LoginPage() {
  const { t } = useTranslation();
  const verifyEmailPass = useAuthStore((state) => state.verifyEmailPass);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    verifyEmailPass("admin@pawgen.com"); // Mocking successful validation
    navigate("/login/mfa");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted">
      <div className="p-8 bg-card rounded-lg shadow-sm border w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">{t("login.title")}</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input placeholder={t("login.username")} required />
          <Input type="password" placeholder={t("login.password")} required />
          <Button type="submit" className="w-full">
            {t("login.signIn")}
          </Button>
        </form>
      </div>
    </div>
  );
}
