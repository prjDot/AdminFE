import { format } from "date-fns";
import { apiClient } from "@/shared/api/client";
import { type ApiResponse, unwrapApiResponse } from "@/shared/api/api-response";

export interface AdminDashboardResponse {
  todayReports: number;
  pendingReports: number;
  hiddenCommunityPosts: number;
  hiddenMissingPosts: number;
  sanctionedUsers: number;
}

export interface AdminDashboardSummaryResponse {
  activeUsers: number;
  connectedUsers: number;
  serverStatus: string;
  newUsers: number;
  announcementsPosted: number;
  communityPosts: number;
  processedTasks: number;
  userReports: number;
  kpiToday?: unknown;
  kpiWeekly?: unknown;
  kpiMonthly?: unknown;
  recentReports?: unknown[];
  recentDispatchFailures?: unknown[];
}

export interface AdminDashboardTimelinePoint {
  label: string;
  notices: number;
  reports: number;
  users: number;
}

export interface AdminDashboardTimelineResponse {
  granularity: string;
  series: AdminDashboardTimelinePoint[];
}

export interface AdminDashboardPriorityItem {
  id: string;
  type: string;
  targetLabel: string;
  reason: string;
  priority: boolean;
}

export interface DashboardDateRangeParams {
  from?: Date;
  to?: Date;
}

function toDateParam(date?: Date) {
  return date ? format(date, "yyyy-MM-dd") : undefined;
}

export async function getDashboardOverview() {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminDashboardResponse>>("/admin/dashboard")
  );
}

export async function getDashboardSummary(params: DashboardDateRangeParams) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminDashboardSummaryResponse>>(
      "/admin/dashboard/summary",
      {
        params: {
          from: toDateParam(params.from),
          to: toDateParam(params.to),
        },
      }
    )
  );
}

export async function getDashboardTimeline(params: DashboardDateRangeParams) {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminDashboardTimelineResponse>>(
      "/admin/dashboard/timeline",
      {
        params: {
          from: toDateParam(params.from),
          to: toDateParam(params.to),
          granularity: "day",
        },
      }
    )
  );
}

export async function getDashboardPriorities() {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminDashboardPriorityItem[]>>(
      "/admin/dashboard/priorities"
    )
  );
}
