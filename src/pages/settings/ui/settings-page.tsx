import { Save, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { FormStatus } from "@/shared/ui/form-status";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { SettingsPreferencesSection } from "@/pages/settings/ui/sections/settings-preferences-section";
import { SettingsGeneralSection } from "@/pages/settings/ui/sections/settings-general-section";
import { SettingsIntegrationSection } from "@/pages/settings/ui/sections/settings-integration-section";
import { SettingsBaseDataSection } from "@/pages/settings/ui/sections/settings-base-data-section";
import type { SettingsFormValues } from "@/pages/settings/ui/sections/types";
import {
  fetchAdminSettings,
  updateAdminSettings,
} from "@/pages/settings/api/settings-api";
import { queryKeys } from "@/shared/api/query-keys";

const defaultSettings: SettingsFormValues = {
  siteName: "PawGen",
  supportEmail: "support@pawgen.com",
  fcmServerKey: "",
  apiEndpoint: "https://openapi.animal.go.kr/openapi/service/rest",
};

export function SettingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const { register, handleSubmit, reset } = useForm<SettingsFormValues>({
    defaultValues: defaultSettings,
  });
  const settingsQuery = useQuery({
    queryKey: queryKeys.settings.root(),
    queryFn: fetchAdminSettings,
  });
  const updateMutation = useMutation({
    mutationFn: updateAdminSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.settings.root(), settings);
      setFeedback({ tone: "success", message: t("common.feedback.saved") });
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      reset({ ...defaultSettings, ...settingsQuery.data });
    }
  }, [reset, settingsQuery.data]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync(values);
    } catch {
      setFeedback({ tone: "error", message: t("common.feedback.failed") });
    }
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Settings2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("settings.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("settings.description")}</p>
        </div>
      </div>

      {settingsQuery.isError && <FormStatus tone="error" message={t("common.errors.failedToLoad")} />}
      {feedback && <FormStatus tone={feedback.tone} message={feedback.message} />}

      <form onSubmit={onSubmit} className="bg-card border rounded-xl shadow-sm p-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="general">{t("settings.generalTitle")}</TabsTrigger>
            <TabsTrigger value="preferences">UI Preferences</TabsTrigger>
            <TabsTrigger value="integration">{t("settings.integrationTitle")}</TabsTrigger>
            <TabsTrigger value="basedata">{t("settings.baseDataTitle")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <SettingsGeneralSection register={register} />
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <SettingsPreferencesSection />
          </TabsContent>
          
          <TabsContent value="integration" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <SettingsIntegrationSection register={register} />
          </TabsContent>
          
          <TabsContent value="basedata" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            <SettingsBaseDataSection />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <Button type="button" variant="outline">
            {t("common.actions.cancel")}
          </Button>
          <Button type="submit" className="gap-2" disabled={updateMutation.isPending || settingsQuery.isLoading}>
            <Save className="h-4 w-4" />
            {t("common.actions.saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  );
}
