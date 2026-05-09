import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import { unwrapApiResponse, type ApiResponse } from "@/shared/api/api-response";
import { queryKeys } from "@/shared/api/query-keys";

export interface NotificationSendRequest {
  target: "all" | "active" | "specific" | "ALL" | "ACTIVE" | "SPECIFIC";
  title: string;
  body: string;
  userIds?: string[];
}

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  target: string;
  status: string;
  targetCount?: number | null;
  deliveredCount: number;
  deliveredUserCount?: number | null;
  failedCount: number;
  skippedCount?: number | null;
  sentAt: string;
}

export interface NotificationHistoryResponse {
  items: NotificationRecord[];
  page: number;
  pageSize: number;
  total: number;
}

export interface NotificationHistoryParams {
  page?: number;
  pageSize?: number;
}

export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NotificationSendRequest) => {
      const res = await apiClient.post("/admin/notifications/send", {
        ...data,
        target: data.target.toUpperCase(),
      });
      return unwrapApiResponse(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.history(),
      });
    },
  });
}

export function useNotificationHistory(params?: NotificationHistoryParams) {
  return useQuery({
    queryKey: queryKeys.notifications.history(params),
    staleTime: 30_000,
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<NotificationHistoryResponse>>(
        "/admin/notifications/history",
        {
          params: {
            page: params?.page ?? 1,
            pageSize: params?.pageSize ?? 20,
          },
        },
      );
      return unwrapApiResponse(res);
    },
  });
}

export function useNotificationHistoryExport() {
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.get(
        "/admin/notifications/history/export.csv",
        {
          responseType: "blob",
        },
      );
      return res.data as Blob;
    },
  });
}
