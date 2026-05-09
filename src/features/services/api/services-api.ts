import { apiClient } from "@/shared/api/client";
import { type ApiResponse, unwrapApiResponse } from "@/shared/api/api-response";

export interface IntegrationStatus {
  key: string;
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  checkedAt: string;
  message?: string;
}

export interface ServiceStatus {
  id: string;
  name: string;
  status: "operational" | "degraded" | "outage" | "maintenance";
  checkedAt: string;
  message?: string;
  uptime?: string;
  latency?: string;
}

export interface ServiceLog {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
}

export async function fetchIntegrationsOverview() {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<IntegrationStatus[]>>("/admin/integrations/overview"),
  );
}

export async function fetchServicesOverview() {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<ServiceStatus[]>>("/admin/services/overview"),
  );
}

export async function fetchServiceLogs(serviceId: string, limit = 100) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<ServiceLog[]>>(`/admin/services/${serviceId}/logs`, {
      params: { limit },
    }),
  );
}

export async function rebootService(serviceId: string) {
  return unwrapApiResponse(
    await apiClient.post<ApiResponse<{ id: string; status: string }>>(
      `/admin/services/${serviceId}/reboot`,
    ),
  );
}

export async function refreshIntegration(integrationKey: string) {
  return unwrapApiResponse(
    await apiClient.post<ApiResponse<{ key: string; status: string }>>(
      `/admin/integrations/${integrationKey}/refresh`,
    ),
  );
}
