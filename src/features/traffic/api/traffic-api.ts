import { type ApiResponse, unwrapApiResponse } from "@/shared/api/api-response";
import { apiClient } from "@/shared/api/client";

export interface TrafficConfig {
  trackedApiPrefixes: string[];
  errorStatusFilter?: string;
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

export interface TrafficLogParams {
  errorsOnly?: boolean;
  limit?: number;
}

export async function fetchTrafficLogs({ errorsOnly = false, limit = 100 }: TrafficLogParams = {}) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<TrafficLog[]>>("/admin/traffic/logs", {
      params: { errorsOnly, limit },
    }),
  );
}
