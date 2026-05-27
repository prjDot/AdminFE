import { type ApiResponse, unwrapApiResponse } from "@/shared/api/api-response";
import { apiClient } from "@/shared/api/client";

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

export interface TrafficLogsResponse {
  items: TrafficLog[];
  errorCount: number;
}

export interface TrafficLogParams {
  errorsOnly?: boolean;
  limit?: number;
  sortOrder?: "asc" | "desc";
}

export async function fetchTrafficLogs({
  errorsOnly = false,
  limit = 50,
  sortOrder = "desc",
}: TrafficLogParams = {}) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<TrafficLogsResponse>>("/admin/traffic/logs", {
      params: { errorsOnly, limit, sortOrder },
    }),
  );
}
