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
    permissionsStatus: () => ["users", "permissions-status"] as const,
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
  notifications: {
    history: (params?: unknown) =>
      ["notifications", "history", params] as const,
  },
  audit: {
    list: (params?: unknown) => ["audit", "list", params] as const,
    detail: (logId: string) => ["audit", "detail", logId] as const,
  },
  settings: {
    root: () => ["settings"] as const,
  },
  services: {
    overview: () => ["services", "overview"] as const,
    detail: (serviceId: string) => ["services", "detail", serviceId] as const,
    logs: (serviceId: string, params?: unknown) =>
      ["services", "logs", serviceId, params] as const,
  },
  traffic: {
    config: () => ["traffic", "config"] as const,
    logs: (params?: unknown) => ["traffic", "logs", params] as const,
  },
  integrations: {
    overview: () => ["integrations", "overview"] as const,
    detail: (key: string) => ["integrations", "detail", key] as const,
  },
  stats: () => ["stats"] as const,
};
