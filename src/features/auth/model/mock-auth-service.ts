import { ROLES } from "@/shared/config/constants";
import type { AdminUser } from "@/features/auth/model/auth-store";

export type LoginFailureReason = "INVALID_CREDENTIALS" | "LOCKED";

export interface LoginCheckResult {
  ok: boolean;
  reason?: LoginFailureReason;
  remainingLockMs?: number;
}

export interface OtpCheckResult {
  ok: boolean;
}

interface PersistedAuthSession {
  token: string;
  admin: AdminUser;
  expiresAt: number;
}

const AUTH_SESSION_STORAGE_KEY = "paw-admin-auth-session";
const SESSION_TTL_MS = 30 * 60 * 1000;

const MOCK_ADMIN_OTP_CODE = (import.meta.env.VITE_MOCK_ADMIN_OTP_CODE as string | undefined) ?? "246810";
const MOCK_REQUIRE_OTP = ((import.meta.env.VITE_MOCK_REQUIRE_OTP as string | undefined) ?? "false").toLowerCase() === "true";

function canUseStorage() {
  return typeof window !== "undefined";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export function checkLoginCredentials(_email: string, _password: string): LoginCheckResult {
  return { ok: true };
}

export function checkOtpCode(code: string): OtpCheckResult {
  if (!isOtpRequired()) {
    return { ok: true };
  }
  return { ok: code === MOCK_ADMIN_OTP_CODE };
}

export function isOtpRequired() {
  return MOCK_REQUIRE_OTP;
}

export function createAuthenticatedAdmin(email: string): AdminUser {
  return {
    id: "admin-1",
    email: normalizeEmail(email || "mock-admin@local"),
    name: "Super Admin",
    role: ROLES.ADMIN,
  };
}

export function startAuthSession(admin: AdminUser) {
  if (!canUseStorage()) {
    return null;
  }

  const session: PersistedAuthSession = {
    token: createToken(),
    admin,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function readAuthSession() {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const session = JSON.parse(raw) as PersistedAuthSession;
    if (
      !session ||
      typeof session.token !== "string" ||
      typeof session.expiresAt !== "number" ||
      !session.admin
    ) {
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export function getLoginLockRemainingMs() {
  return 0;
}
