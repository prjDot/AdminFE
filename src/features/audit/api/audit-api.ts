import { apiClient } from "@/shared/api/client";
import { type ApiResponse, unwrapApiResponse } from "@/shared/api/api-response";

export interface AdminAuditLog {
  id: string;
  action: string;
  targetType?: string;
  targetId?: string;
  adminEmail?: string;
  adminName?: string;
  createdAt: string;
  timestamp?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export interface AdminAuditLogListResponse {
  items: AdminAuditLog[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AuditLogListParams {
  query?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchAuditLogs(params: AuditLogListParams) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminAuditLogListResponse>>(
      "/admin/audit-logs",
      {
        params: {
          query: params.query || undefined,
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 20,
        },
      },
    ),
  );
}

export async function fetchAuditLogDetail(logId: string) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<Record<string, unknown>>>(
      `/admin/audit-logs/${logId}`,
    ),
  );
}
