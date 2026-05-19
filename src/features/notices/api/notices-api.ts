import { apiClient } from "@/shared/api/client";
import { type ApiResponse, unwrapApiResponse } from "@/shared/api/api-response";

const ADMIN_GLOBAL_REGION = "*";
const EXTERNAL_NOTICE_MEDIA_HOSTS = new Set(["apis.data.go.kr"]);

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

function getApiOrigin() {
  const configured = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      // fall through
    }
  }
  return "https://paw.gbsw.hs.kr";
}

function normalizeNoticeMediaUrl(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const apiOrigin = getApiOrigin();

  try {
    const resolvedUrl = new URL(trimmed, apiOrigin);
    if (EXTERNAL_NOTICE_MEDIA_HOSTS.has(resolvedUrl.hostname)) {
      return null;
    }
    return resolvedUrl.toString();
  } catch {
    return null;
  }
}

function normalizeNoticeListItem(item: AdminNoticeListItem): AdminNoticeListItem {
  return {
    ...item,
    thumbnailUrl: normalizeNoticeMediaUrl(item.thumbnailUrl),
  };
}

function normalizeNoticeDetail(item: AdminNoticeDetail): AdminNoticeDetail {
  return {
    ...item,
    thumbnailUrl: normalizeNoticeMediaUrl(item.thumbnailUrl),
    images: item.images
      .map((image) => normalizeNoticeMediaUrl(image))
      .filter((image): image is string => Boolean(image)),
  };
}

function withAdminGlobalRegion(params: AdminNoticeListParams) {
  const { mineOnly: _mineOnly, region: _region, ...rest } = params as AdminNoticeListParams & {
    mineOnly?: unknown;
  };
  return {
    ...rest,
    region: ADMIN_GLOBAL_REGION,
  };
}

export async function fetchNotices(params: AdminNoticeListParams) {
  const data = unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminNoticeListResponse>>("/admin/notices", {
      params: withAdminGlobalRegion(params),
    }),
  );
  return {
    ...data,
    items: data.items.map(normalizeNoticeListItem),
  };
}

export async function fetchNoticeDetail(noticeId: string) {
  const data = unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminNoticeDetail>>(`/admin/notices/${noticeId}`),
  );
  return normalizeNoticeDetail(data);
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
    params: withAdminGlobalRegion(params),
    responseType: "blob",
  });
  return response.data as Blob;
}
