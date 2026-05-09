import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 10 * 60 * 1000,
      placeholderData: (previousData: unknown) => previousData,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
      staleTime: 60 * 1000,
    },
  },
});

export function AppQueryClientProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
