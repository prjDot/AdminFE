import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import { toApiResponseError } from "@/shared/api/api-response";
import {
  fetchIntegrationsOverview,
  fetchServiceLogs,
  fetchServicesOverview,
  rebootService,
  refreshIntegration,
} from "./services-api";

export function useIntegrationsOverview() {
  return useQuery({
    queryKey: queryKeys.integrations.overview(),
    queryFn: fetchIntegrationsOverview,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useServicesOverview() {
  return useQuery({
    queryKey: queryKeys.services.overview(),
    queryFn: fetchServicesOverview,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useServiceLogs(serviceId: string) {
  return useQuery({
    queryKey: queryKeys.services.logs(serviceId),
    queryFn: () => fetchServiceLogs(serviceId),
    enabled: Boolean(serviceId),
    staleTime: 30_000,
  });
}

export function useRebootService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rebootService,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.services.overview() });
    },
    throwOnError: (error) => {
      throw toApiResponseError(error);
    },
  });
}

export function useRefreshIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshIntegration,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.integrations.overview() });
    },
    throwOnError: (error) => {
      throw toApiResponseError(error);
    },
  });
}
