export const ROLES = {
  ADMIN: "ADMIN",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const NOTICE_STATUS = {
  LOST: "LOST",
  FOUND: "FOUND",
  RESOLVED: "RESOLVED",
  HIDDEN: "HIDDEN",
  REPORTED: "REPORTED",
} as const;

export type NoticeStatus = typeof NOTICE_STATUS[keyof typeof NOTICE_STATUS];

export const REPORT_STATUS = {
  PENDING: "PENDING",
  REVIEWING: "REVIEWING",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
} as const;

export type ReportStatus = typeof REPORT_STATUS[keyof typeof REPORT_STATUS];

export const USER_STATUS = {
  ACTIVE: "ACTIVE", // 정상
  SUSPENDED: "SUSPENDED", // 정지
  DELETED: "DELETED", // 탈퇴
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
