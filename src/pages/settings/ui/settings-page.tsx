import { Save, Settings2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { FormStatus } from "@/shared/ui/form-status";
import { SettingsPreferencesSection } from "@/pages/settings/ui/sections/settings-preferences-section";
import { SettingsGeneralSection } from "@/pages/settings/ui/sections/settings-general-section";
import { SettingsIntegrationSection } from "@/pages/settings/ui/sections/settings-integration-section";
import { SettingsBaseDataSection } from "@/pages/settings/ui/sections/settings-base-data-section";
import type { SettingsFormValues } from "@/pages/settings/ui/sections/types";

export function SettingsPage() {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const { register, handleSubmit } = useForm<SettingsFormValues>({
    defaultValues: {
      siteName: "PawGen",
      supportEmail: "support@pawgen.com",
      fcmServerKey: "",
      apiEndpoint: "https://openapi.animal.go.kr/openapi/service/rest",
    },
  });

  const onSubmit = handleSubmit(async () => {
    try {
      setFeedback({ tone: "success", message: t("common.feedback.saved") });
    } catch {
      setFeedback({ tone: "error", message: t("common.feedback.failed") });
    }
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <div className="flex items-center gap-3">
        <Settings2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("settings.description")}</p>
        </div>
      </div>

      {feedback && <FormStatus tone={feedback.tone} message={feedback.message} />}

      <form onSubmit={onSubmit} className="space-y-8">
        <SettingsPreferencesSection />
        <SettingsGeneralSection register={register} />
        <SettingsIntegrationSection register={register} />
        <SettingsBaseDataSection />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            {t("common.actions.cancel")}
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            {t("common.actions.saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  );
}
