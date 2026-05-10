import { type ApiResponse, unwrapApiResponse } from "@/shared/api/api-response";
import { apiClient } from "@/shared/api/client";

export interface TrafficConfig {
  trackedApiPrefixes: string[];
}

export interface TrafficLog {
  timestamp: string;
  direction: string;
  method: string;
  path: string;
  status: number;
  durationMs: number;
  remoteAddr?: string;
  requestBody?: string;
  responseBody?: string;
}

export async function fetchTrafficConfig() {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<TrafficConfig>>("/admin/traffic/config"),
  );
}

export async function fetchTrafficLogs(limit = 100) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<TrafficLog[]>>("/admin/traffic/logs", {
      params: { limit },
    }),
  );
}
