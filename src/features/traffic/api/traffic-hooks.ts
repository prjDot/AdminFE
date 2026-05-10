import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import { fetchTrafficConfig, fetchTrafficLogs } from "./traffic-api";

export function useTrafficConfig() {
  return useQuery({
    queryKey: queryKeys.traffic.config(),
    queryFn: fetchTrafficConfig,
    staleTime: 300_000,
  });
}

export function useTrafficLogs(limit = 100) {
  return useQuery({
    queryKey: queryKeys.traffic.logs({ limit }),
    queryFn: () => fetchTrafficLogs(limit),
    refetchInterval: 2_000,
    staleTime: 1_000,
  });
}
