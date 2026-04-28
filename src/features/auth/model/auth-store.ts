import { create } from "zustand";
import { appendAuditLog } from "@/features/audit/model/audit-log-store";
import {
  checkLoginCredentials,
  checkOtpCode,
  clearAuthSession,
  createAuthenticatedAdmin,
  getLoginLockRemainingMs,
  isOtpRequired,
  readAuthSession,
  startAuthSession,
} from "@/features/auth/model/mock-auth-service";
import { type Role } from "@/shared/config/constants";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthActionResult {
  ok: boolean;
  nextStep?: "OTP_REQUIRED" | "AUTHENTICATED";
  messageKey?: string;
  remainingSeconds?: number;
}

interface AuthState {
  bootstrapped: boolean;
  step: "NONE" | "OTP_REQUIRED" | "AUTHENTICATED";
  tempEmail: string | null;
  admin: AdminUser | null;
  lockRemainingMs: number;

  bootstrapSession: () => void;
  requestLogin: (email: string, password: string) => AuthActionResult;
  verifyOtp: (code: string) => AuthActionResult;
  logout: (reason?: "USER" | "SESSION_EXPIRED") => void;
  forceLogout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  bootstrapped: false,
  step: "NONE",
  tempEmail: null,
  admin: null,
  lockRemainingMs: 0,

  bootstrapSession: () => {
    if (get().bootstrapped) {
      return;
    }

    const session = readAuthSession();

    if (!session) {
      set({
        bootstrapped: true,
        step: "NONE",
        admin: null,
      });
      return;
    }

    set({
      bootstrapped: true,
      step: "AUTHENTICATED",
      admin: session.admin,
      tempEmail: null,
    });

    appendAuditLog({
      adminName: session.admin.name,
      action: "Session Restored",
      target: session.admin.email,
    });
  },

  requestLogin: (email, password) => {
    const result = checkLoginCredentials(email, password);

    if (!result.ok) {
      const remainingMs = result.remainingLockMs ?? getLoginLockRemainingMs();
      const remainingSeconds = Math.max(1, Math.ceil(remainingMs / 1000));
      const isLocked = result.reason === "LOCKED";

      set({ lockRemainingMs: remainingMs });
      appendAuditLog({
        adminName: "Unknown",
        action: isLocked ? "Login Blocked" : "Login Failed",
        target: email.trim().toLowerCase() || "unknown-email",
      });

      return {
        ok: false,
        messageKey: isLocked ? "auth.errors.locked" : "auth.errors.invalidCredentials",
        remainingSeconds,
      };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const requireOtp = isOtpRequired();

    if (requireOtp) {
      set({
        step: "OTP_REQUIRED",
        tempEmail: normalizedEmail,
        lockRemainingMs: 0,
      });

      appendAuditLog({
        adminName: "Unknown",
        action: "Password Verified",
        target: normalizedEmail || "unknown-email",
      });

      return { ok: true, nextStep: "OTP_REQUIRED" };
    }

    const admin = createAuthenticatedAdmin(normalizedEmail);
    startAuthSession(admin);

    set({
      step: "AUTHENTICATED",
      admin,
      tempEmail: null,
      lockRemainingMs: 0,
    });

    appendAuditLog({
      adminName: admin.name,
      action: "Login Success (OTP Bypassed)",
      target: admin.email,
    });

    return { ok: true, nextStep: "AUTHENTICATED" };
  },

  verifyOtp: (code) => {
    const { tempEmail } = get();
    if (!tempEmail) {
      return {
        ok: false,
        messageKey: "auth.errors.otpFlowInvalid",
      };
    }

    const result = checkOtpCode(code);
    if (!result.ok) {
      appendAuditLog({
        adminName: "Unknown",
        action: "OTP Failed",
        target: tempEmail,
      });

      return {
        ok: false,
        messageKey: "auth.errors.invalidOtp",
      };
    }

    const admin = createAuthenticatedAdmin(tempEmail);
    startAuthSession(admin);

    set({
      step: "AUTHENTICATED",
      admin,
      tempEmail: null,
    });

    appendAuditLog({
      adminName: admin.name,
      action: "Login Success",
      target: admin.email,
    });

    return { ok: true };
  },

  logout: (reason = "USER") => {
    const { admin } = get();
    clearAuthSession();
    set({
      step: "NONE",
      admin: null,
      tempEmail: null,
      lockRemainingMs: getLoginLockRemainingMs(),
    });

    appendAuditLog({
      adminName: admin?.name ?? "Unknown",
      action: reason === "SESSION_EXPIRED" ? "Session Expired" : "Logout",
      target: admin?.email ?? "-",
    });
  },

  forceLogout: () => {
    get().logout("SESSION_EXPIRED");
  },
}));
