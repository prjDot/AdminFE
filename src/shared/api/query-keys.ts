export const queryKeys = {
  auth: ["auth"] as const,
  dashboard: {
    overview: () => ["dashboard", "overview"] as const,
    summary: (params?: unknown) => ["dashboard", "summary", params] as const,
    timeline: (params?: unknown) => ["dashboard", "timeline", params] as const,
    priorities: () => ["dashboard", "priorities"] as const,
  },
  users: (params?: unknown) => ["users", params] as const,
  reports: (params?: unknown) => ["reports", params] as const,
  stats: () => ["stats"] as const,
};
