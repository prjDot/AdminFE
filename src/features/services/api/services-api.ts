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

type RawRecord = Record<string, unknown>;
type ServiceStatusValue = ServiceStatus["status"];
type IntegrationStatusValue = IntegrationStatus["status"];

function asRecord(value: unknown): RawRecord {
  return value && typeof value === "object" ? (value as RawRecord) : {};
}

function toServiceStatus(status: unknown): ServiceStatusValue {
  const normalized = String(status ?? "").toUpperCase();
  if (["DEGRADED", "WARN", "WARNING"].includes(normalized)) return "degraded";
  if (["DOWN", "OUTAGE", "UNHEALTHY", "ERROR"].includes(normalized)) return "outage";
  if (["MAINTENANCE", "DISABLED"].includes(normalized)) return "maintenance";
  return "operational";
}

function toIntegrationStatus(status: unknown): IntegrationStatusValue {
  const normalized = String(status ?? "").toUpperCase();
  if (["DEGRADED", "WARN", "WARNING"].includes(normalized)) return "degraded";
  if (["DOWN", "UNHEALTHY", "ERROR"].includes(normalized)) return "unhealthy";
  return "healthy";
}

function normalizeService(id: string, rawValue: unknown): ServiceStatus {
  const raw = asRecord(rawValue);
  return {
    id: String(raw.id ?? raw.serviceId ?? id),
    name: String(raw.name ?? raw.serviceName ?? raw.id ?? id),
    status: toServiceStatus(raw.status),
    checkedAt: String(raw.checkedAt ?? raw.lastCheckedAt ?? new Date().toISOString()),
    message: typeof raw.message === "string" ? raw.message : undefined,
    uptime: typeof raw.uptime === "string" ? raw.uptime : undefined,
    latency: typeof raw.latency === "string" ? raw.latency : undefined,
  };
}

function normalizeServiceList(data: unknown): ServiceStatus[] {
  if (Array.isArray(data)) {
    return data.map((item, index) => normalizeService(String(index), item));
  }
  return Object.entries(asRecord(data)).map(([id, value]) => normalizeService(id, value));
}

function normalizeIntegration(item: unknown): IntegrationStatus {
  const raw = asRecord(item);
  const key = String(raw.key ?? raw.id ?? "");
  return {
    key,
    name: String(raw.name ?? key),
    status: toIntegrationStatus(raw.status),
    checkedAt: String(raw.checkedAt ?? new Date().toISOString()),
    message: typeof raw.message === "string" ? raw.message : undefined,
  };
}

export async function fetchIntegrationsOverview() {
  const data = unwrapApiResponse(
    await apiClient.get<ApiResponse<IntegrationStatus[]>>("/admin/integrations/overview"),
  );
  return data.map(normalizeIntegration);
}

export async function fetchServicesOverview() {
  return normalizeServiceList(
    unwrapApiResponse(
      await apiClient.get<ApiResponse<unknown>>("/admin/services/overview"),
    ),
  );
}

export async function fetchServiceLogs(serviceId: string, limit = 100) {
  const data = unwrapApiResponse(
    await apiClient.get<ApiResponse<ServiceLog[]>>(`/admin/services/${serviceId}/logs`, {
      params: { limit },
    }),
  );
  return data.map((log) => ({
    ...log,
    level: String(log.level).toLowerCase() as ServiceLog["level"],
  }));
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
      `/admin/integrations/${integrationKey}/recheck`,
    ),
  );
}
