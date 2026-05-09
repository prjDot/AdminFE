import { apiClient } from "@/shared/api/client";
import { type ApiResponse, unwrapApiResponse } from "@/shared/api/api-response";

export interface AdminCommunityPostListItem {
  id: string;
  title: string;
  author: string;
  likes: number;
  comments: number;
  createdAt: string;
  status: string;
  category: string;
}

export interface AdminCommunityPostListParams {
  page?: number;
  pageSize?: number;
  query?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminCommunityPostListResponse {
  items: AdminCommunityPostListItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminCommunityPostDetail {
  id: string;
  title: string;
  content: string | null;
  author: string;
  status: string;
  category: string;
  createdAt: string;
  comments: number;
  reportCount: number;
  likes?: number;
  [key: string]: unknown;
}

export interface AdminVisibilityResponse {
  postId: string;
  visibility: string;
  status: string;
  hidden: boolean;
}

export async function fetchCommunityPosts(params: AdminCommunityPostListParams) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminCommunityPostListResponse>>(
      "/admin/community/posts",
      { params },
    ),
  );
}

export async function fetchCommunityPostDetail(postId: string) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminCommunityPostDetail>>(
      `/admin/community/posts/${postId}`,
    ),
  );
}

export async function updateCommunityPostVisibility(
  postId: string,
  visibility: "HIDDEN" | "VISIBLE",
) {
  return unwrapApiResponse(
    await apiClient.patch<ApiResponse<AdminVisibilityResponse>>(
      `/admin/community/posts/${postId}/visibility`,
      { visibility },
    ),
  );
}

export async function deleteCommunityPost(postId: string) {
  return unwrapApiResponse(
    await apiClient.delete<ApiResponse<unknown>>(
      `/admin/community/posts/${postId}`,
    ),
  );
}
