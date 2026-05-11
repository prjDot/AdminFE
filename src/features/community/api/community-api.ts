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

export interface AdminCommunityPollOption {
  option: string;
  voteCount: number;
}

export interface AdminCommunityVoteItem {
  voteId: string;
  userId: string;
  userName: string;
  selectedOption: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCommunityReactionItem {
  reactionId: string;
  userId: string;
  userName: string;
  reactionType: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  parentCommentId: string | null;
  replies: AdminCommunityComment[];
}

export interface AdminCommunityPostDetail {
  id: string;
  title: string;
  content: string | null;
  author: string;
  status: string;
  category: string;
  createdAt: string;
  comments: AdminCommunityComment[] | number;
  reportCount: number;
  likes?: number;
  tags?: string[];
  images?: string[];
  poll?: {
    question: string;
    options: AdminCommunityPollOption[];
    totalVotes: number;
  } | null;
  votes?: {
    total: number;
    countByOption: Record<string, number>;
    voters: AdminCommunityVoteItem[];
  } | null;
  reactions?: {
    total: number;
    countByType: Record<string, number>;
    reactors: AdminCommunityReactionItem[];
  } | null;
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
