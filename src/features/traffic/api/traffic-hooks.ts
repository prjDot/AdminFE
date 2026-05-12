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

export function useTrafficLogs(
  limit = 100,
  errorsOnly = false,
  sortOrder: "asc" | "desc" = "desc",
) {
  return useQuery({
    queryKey: queryKeys.traffic.logs({ errorsOnly, limit, sortOrder }),
    queryFn: () => fetchTrafficLogs({ errorsOnly, limit, sortOrder }),
    refetchInterval: 2_000,
    staleTime: 1_000,
  });
}
