import { apiClient } from "@/shared/api/client";
import { type ApiResponse, unwrapApiResponse } from "@/shared/api/api-response";

export interface AdminNoticeListItem {
  id: string;
  title: string;
  animalType: string;
  status: string;
  reporter: string;
  reportedAt: string;
  thumbnailUrl: string | null;
  hidden: boolean;
  region: string | null;
}

export interface AdminNoticeListParams {
  page?: number;
  pageSize?: number;
  query?: string;
  status?: string;
  region?: string;
  breed?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  from?: string;
  to?: string;
}

export interface AdminNoticeListResponse {
  items: AdminNoticeListItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminNoticeDetail extends AdminNoticeListItem {
  content: string | null;
  breed: string | null;
  gender: string | null;
  age: number | null;
  color: string | null;
  location: string | null;
  missingDate: string | null;
  rewardAmount: number | null;
  contactPhone: string | null;
  images: string[];
  reportCount: number;
}

export async function fetchNotices(params: AdminNoticeListParams) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminNoticeListResponse>>("/admin/notices", { params }),
  );
}

export async function fetchNoticeDetail(noticeId: string) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminNoticeDetail>>(`/admin/notices/${noticeId}`),
  );
}

export async function hideNotice(noticeId: string) {
  return unwrapApiResponse(
    await apiClient.post<ApiResponse<unknown>>(`/admin/notices/${noticeId}/hide`),
  );
}

export async function restoreNotice(noticeId: string) {
  return unwrapApiResponse(
    await apiClient.post<ApiResponse<unknown>>(`/admin/notices/${noticeId}/restore`),
  );
}

export async function exportNoticesCSV(
  params: Omit<AdminNoticeListParams, "page" | "pageSize">,
) {
  const response = await apiClient.get("/admin/notices/export.csv", {
    params,
    responseType: "blob",
  });
  return response.data as Blob;
}
