import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/query-keys";
import { fetchTrafficLogs } from "./traffic-api";

export function useTrafficLogs(
  limit = 50,
  errorsOnly = false,
  sortOrder: "asc" | "desc" = "desc",
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.traffic.logs({ errorsOnly, limit, sortOrder }),
    queryFn: () => fetchTrafficLogs({ errorsOnly, limit, sortOrder }),
    staleTime: 0,
    refetchInterval: enabled ? 3_000 : false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled,
  });
}
