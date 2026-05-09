export const queryKeys = {
  auth: ["auth"] as const,
  dashboard: {
    overview: () => ["dashboard", "overview"] as const,
    summary: (params?: unknown) => ["dashboard", "summary", params] as const,
    timeline: (params?: unknown) => ["dashboard", "timeline", params] as const,
    priorities: () => ["dashboard", "priorities"] as const,
  },
  users: {
    list: (params?: unknown) => ["users", "list", params] as const,
    detail: (userId: string) => ["users", "detail", userId] as const,
  },
  notices: {
    list: (params?: unknown) => ["notices", "list", params] as const,
    detail: (noticeId: string) => ["notices", "detail", noticeId] as const,
  },
  community: {
    list: (params?: unknown) => ["community", "list", params] as const,
    detail: (postId: string) => ["community", "detail", postId] as const,
  },
  reports: {
    list: (params?: unknown) => ["reports", "list", params] as const,
    detail: (reportId: string) => ["reports", "detail", reportId] as const,
    reporters: (reportId: string) =>
      ["reports", "reporters", reportId] as const,
  },
  stats: () => ["stats"] as const,
};
