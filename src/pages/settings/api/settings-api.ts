import { apiClient } from "@/shared/api/client";
import { type ApiResponse, unwrapApiResponse } from "@/shared/api/api-response";
import type { SettingsFormValues } from "@/pages/settings/ui/sections/types";

export type AdminSettings = Partial<SettingsFormValues> & Record<string, unknown>;

export async function fetchAdminSettings() {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminSettings>>("/admin/settings"),
  );
}

export async function updateAdminSettings(settings: SettingsFormValues) {
  return unwrapApiResponse(
    await apiClient.patch<ApiResponse<AdminSettings>>(
      "/admin/settings",
      settings,
    ),
  );
}
