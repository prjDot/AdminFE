import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom";
import { Button } from "@/shared/ui/button";

export function RouteErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();
  const navigate = useNavigate();

  const isResponseError = isRouteErrorResponse(error);
  const status = isResponseError ? error.status : undefined;

  const message = isResponseError
    ? error.statusText || t("errors.genericDescription")
    : t("errors.genericDescription");

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm text-muted-foreground">
        {status ? `HTTP ${status}` : t("errors.unexpected")}
      </p>
      <h1 className="text-2xl font-semibold">{t("errors.genericTitle")}</h1>
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          {t("errors.goBack")}
        </Button>
        <Button onClick={() => navigate("/dashboard")}>{t("errors.goDashboard")}</Button>
      </div>
    </div>
  );
}
