import { apiClient } from "@/shared/api/client";
import { type ApiResponse, unwrapApiResponse } from "@/shared/api/api-response";

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminUserListParams {
  page?: number;
  pageSize?: number;
  query?: string;
  status?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminUserListResponse {
  items: AdminUserListItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface PromoteAdminResponse {
  userId: string;
  email: string;
  role: string;
  status: string;
}

export interface AdminStatusSummary {
  totalAdmins: number;
  activeAdmins: number;
  suspendedAdmins: number;
  withdrawnAdmins: number;
}

export interface AdminStatusItem {
  userId: string;
  email: string;
  nickname: string;
  role: string;
  status: string;
  permissions: string[];
  adminEmailVerificationRequired: boolean;
  adminEmailVerifiedAt: string | null;
  adminEmailVerificationStatus: "VERIFIED" | "PENDING";
}

export interface AdminStatusResponse {
  summary: AdminStatusSummary;
  admins: AdminStatusItem[];
}

export interface AdminUserProfile {
  region?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}

export interface AdminUserDetail extends AdminUserListItem {
  profile: AdminUserProfile | null;
  notices: unknown[];
  communityPosts: unknown[];
  reports: unknown[];
}

export async function fetchUsers(params: AdminUserListParams) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminUserListResponse>>("/admin/users", { params }),
  );
}

export async function fetchUserDetail(userId: string) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminUserDetail>>(`/admin/users/${userId}`),
  );
}

export async function fetchAdminStatus() {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminStatusResponse>>(
      "/admin/users/admins/status",
    ),
  );
}

export async function promoteUserToAdmin(userId: string) {
  return unwrapApiResponse(
    await apiClient.patch<ApiResponse<PromoteAdminResponse>>(
      "/admin/users/promote",
      { userId },
    ),
  );
}

export async function suspendUser(userId: string) {
  return unwrapApiResponse(
    await apiClient.post<ApiResponse<{ id: string; status: string }>>(
      `/admin/users/${userId}/suspend`,
    ),
  );
}

export async function unsuspendUser(userId: string) {
  return unwrapApiResponse(
    await apiClient.post<ApiResponse<{ id: string; status: string }>>(
      `/admin/users/${userId}/unsuspend`,
    ),
  );
}

export async function updateUserRole(userId: string, role: string) {
  return unwrapApiResponse(
    await apiClient.patch<ApiResponse<{ id: string; role: string }>>(
      `/admin/users/${userId}/role`,
      { role },
    ),
  );
}

export async function exportUsersCSV(
  params: Omit<AdminUserListParams, "page" | "pageSize">,
) {
  const response = await apiClient.get("/admin/users/export.csv", {
    params,
    responseType: "blob",
  });
  return response.data as Blob;
}
