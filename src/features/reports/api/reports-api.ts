import { apiClient } from "@/shared/api/client";
import { type ApiResponse, unwrapApiResponse } from "@/shared/api/api-response";

export interface AdminReportListItem {
  id: string;
  targetType: string;
  reason: string;
  reporterCount: number;
  status: string;
  lastReportedAt: string;
  targetId: string;
}

export interface AdminReportListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  targetType?: string;
}

export interface AdminReportListResponse {
  items: AdminReportListItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminReportReporter {
  id: string;
  email: string;
  nickname: string;
  reason: string;
  createdAt: string;
}

export interface AdminReportDetail {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string | null;
  status: string;
  reporter: { id: string; email: string; nickname: string } | null;
  target: {
    id: string;
    title: string | null;
    summary: string | null;
    author: string | null;
  } | null;
  sameTargetReportCount: number;
  reviewedById: string | null;
  reviewedByNickname: string | null;
  processReason: string | null;
  processedAction: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export async function fetchReports(params: AdminReportListParams) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminReportListResponse>>(
      "/admin/reports",
      { params },
    ),
  );
}

export async function fetchReportDetail(reportId: string) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminReportDetail>>(
      `/admin/reports/${reportId}`,
    ),
  );
}

export async function fetchReportReporters(reportId: string) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminReportReporter[]>>(
      `/admin/reports/${reportId}/reporters`,
    ),
  );
}

export async function dismissReport(reportId: string, memo?: string) {
  return unwrapApiResponse(
    await apiClient.post<ApiResponse<unknown>>(
      `/admin/reports/${reportId}/dismiss`,
      { memo },
    ),
  );
}

export async function resolveReport(reportId: string, memo?: string) {
  return unwrapApiResponse(
    await apiClient.post<ApiResponse<unknown>>(
      `/admin/reports/${reportId}/resolve`,
      { memo },
    ),
  );
}

export async function warnReport(reportId: string, memo?: string) {
  return unwrapApiResponse(
    await apiClient.post<ApiResponse<unknown>>(
      `/admin/reports/${reportId}/warn`,
      { memo },
    ),
  );
}

export async function deleteReportTarget(reportId: string, memo?: string) {
  return unwrapApiResponse(
    await apiClient.post<ApiResponse<unknown>>(
      `/admin/reports/${reportId}/delete-target`,
      { memo },
    ),
  );
}

export async function exportReportsCSV(
  params: Omit<AdminReportListParams, "page" | "pageSize">,
) {
  const response = await apiClient.get("/admin/reports/export.csv", {
    params,
    responseType: "blob",
  });
  return response.data as Blob;
}
