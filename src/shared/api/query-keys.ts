export const queryKeys = {
  auth: ["auth"] as const,
  users: (params?: unknown) => ["users", params] as const,
  reports: (params?: unknown) => ["reports", params] as const,
  stats: () => ["stats"] as const,
};
