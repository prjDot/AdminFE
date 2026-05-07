import { create } from "zustand";
import { appendAuditLog } from "@/features/audit/model/audit-log-store";
import {
  adminLogin,
  getAdminSessionState,
  getPasskeyMfaOptions,
  getPasskeyRegisterOptions,
  logoutAdminSession,
  type AdminAuthSessionResponse,
  type AdminLoginResponse,
  type AdminPasskeyOptionsResponse,
  verifyPasskeyMfa,
  verifyPasskeyRegistration,
} from "@/features/auth/api/admin-auth-api";
import { getGoogleFirebaseIdToken, signOutFirebase } from "@/features/auth/api/firebase-auth";
import {
  createPasskeyCredential,
  getPasskeyCredential,
} from "@/features/auth/lib/webauthn";
import {
  clearStoredAdminSession,
  readStoredAdminAccessToken,
  saveStoredAdminSession,
} from "@/shared/api/admin-session-storage";
import { ApiResponseError, toApiResponseError } from "@/shared/api/api-response";
import { type Role } from "@/shared/config/constants";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

type AuthStep =
  | "NONE"
  | "EMAIL_VERIFICATION_REQUIRED"
  | "PASSKEY_ENROLL"
  | "MFA_PENDING"
  | "AUTHENTICATED";

interface AuthActionResult {
  ok: boolean;
  nextStep?: AuthStep;
  messageKey?: string;
  message?: string;
}

interface AuthState {
  bootstrapped: boolean;
  step: AuthStep;
  tempEmail: string | null;
  admin: AdminUser | null;
  permissions: string[];
  expiresAt: string | null;
  pendingPasskey: AdminPasskeyOptionsResponse | null;
  isAuthenticating: boolean;
  lockRemainingMs: number;

  bootstrapSession: () => Promise<void>;
  requestGoogleLogin: () => Promise<AuthActionResult>;
  completePasskeyStep: () => Promise<AuthActionResult>;
  logout: (reason?: "USER" | "SESSION_EXPIRED") => Promise<void>;
  forceLogout: () => void;
}

function toAdminUser(admin: AdminAuthSessionResponse["admin"]): AdminUser {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  };
}

function persistSession(session: AdminAuthSessionResponse) {
  saveStoredAdminSession({
    token: session.accessToken,
    expiresAt: session.expiresAt,
    stage: session.stage,
    admin: session.admin,
    permissions: session.permissions,
  });
}

function getErrorKey(error: unknown) {
  const normalizedError = toApiResponseError(error);

  if (normalizedError instanceof Error && normalizedError.message === "FIREBASE_CONFIG_MISSING") {
    return "auth.errors.firebaseConfigMissing";
  }

  if (normalizedError instanceof ApiResponseError) {
    if (normalizedError.code === "PASSKEY_CHALLENGE_INVALID") {
      return "auth.errors.passkeyChallengeInvalid";
    }

    if (normalizedError.code === "PASSKEY_INVALID") {
      return "auth.errors.passkeyInvalid";
    }

    if (normalizedError.code === "ADMIN_AUTH_STEP_INVALID") {
      return "auth.errors.passkeyFlowInvalid";
    }
  }

  if (normalizedError instanceof DOMException) {
    if (normalizedError.name === "SecurityError") {
      return "auth.errors.passkeyRpIdMismatch";
    }

    if (normalizedError.name === "NotAllowedError") {
      return "auth.errors.passkeyCancelled";
    }

    if (normalizedError.name === "InvalidStateError") {
      return "auth.errors.passkeyAlreadyRegistered";
    }
  }

  if (normalizedError instanceof Error && normalizedError.message === "PASSKEY_CREDENTIAL_MISSING") {
    return "auth.errors.passkeyCredentialMissing";
  }

  if (
    normalizedError instanceof TypeError &&
    normalizedError.message.includes("PublicKeyCredentialCreationOptions.pubKeyCredParams")
  ) {
    return "auth.errors.passkeyOptionsInvalid";
  }

  return "auth.errors.unexpected";
}

function getErrorMessage(error: unknown) {
  const normalizedError = toApiResponseError(error);

  if (normalizedError instanceof ApiResponseError) {
    return [
      normalizedError.code ? `code=${normalizedError.code}` : null,
      `status=${normalizedError.status}`,
      normalizedError.requestId ? `requestId=${normalizedError.requestId}` : null,
      normalizedError.message,
    ]
      .filter(Boolean)
      .join(" / ");
  }

  if (normalizedError instanceof DOMException) {
    return `${normalizedError.name}: ${normalizedError.message}`;
  }

  return normalizedError instanceof Error ? normalizedError.message : undefined;
}

function logAuthError(context: string, error: unknown) {
  if (import.meta.env.DEV && typeof reportError === "function") {
    reportError(error instanceof Error ? error : new Error(`[admin-auth] ${context}`));
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  bootstrapped: false,
  step: "NONE",
  tempEmail: null,
  admin: null,
  permissions: [],
  expiresAt: null,
  pendingPasskey: null,
  isAuthenticating: false,
  lockRemainingMs: 0,

  bootstrapSession: async () => {
    if (get().bootstrapped) {
      return;
    }

    const token = readStoredAdminAccessToken();
    if (!token) {
      set({ bootstrapped: true, step: "NONE", admin: null });
      return;
    }

    try {
      const session = await getAdminSessionState();

      if (!session.authenticated || !session.admin || !session.stage) {
        clearStoredAdminSession();
        set({ bootstrapped: true, step: "NONE", admin: null });
        return;
      }

      set({
        bootstrapped: true,
        step: session.stage,
        admin: toAdminUser({ ...session.admin, role: session.admin.role }),
        permissions: session.permissions,
        expiresAt: session.expiresAt,
        pendingPasskey: null,
      });
    } catch {
      clearStoredAdminSession();
      set({ bootstrapped: true, step: "NONE", admin: null });
    }
  },

  requestGoogleLogin: async () => {
    set({ isAuthenticating: true });

    try {
      const firebaseIdToken = await getGoogleFirebaseIdToken();
      const result = await adminLogin(firebaseIdToken);

      if (result.nextStep === "EMAIL_VERIFICATION_REQUIRED") {
        clearStoredAdminSession();
        set({
          step: "EMAIL_VERIFICATION_REQUIRED",
          tempEmail: null,
          admin: null,
          pendingPasskey: null,
          isAuthenticating: false,
        });
        return { ok: true, nextStep: "EMAIL_VERIFICATION_REQUIRED" };
      }

      if (!result.session) {
        throw new Error("ADMIN_SESSION_MISSING");
      }

      persistSession(result.session);
      set({
        step: result.session.stage,
        tempEmail: result.session.admin.email,
        admin: toAdminUser(result.session.admin),
        permissions: result.session.permissions,
        expiresAt: result.session.expiresAt,
        pendingPasskey: result.passkey,
        isAuthenticating: false,
      });

      appendAuditLog({
        adminName: result.session.admin.name,
        action: "Admin Login Step Verified",
        target: result.session.admin.email,
      });

      return { ok: true, nextStep: result.session.stage };
    } catch (error) {
      logAuthError("google-login", error);
      clearStoredAdminSession();
      set({ isAuthenticating: false, step: "NONE", pendingPasskey: null });
      return {
        ok: false,
        messageKey: getErrorKey(error),
        message: getErrorMessage(error),
      };
    }
  },

  completePasskeyStep: async () => {
    const { step } = get();

    if (step !== "PASSKEY_ENROLL" && step !== "MFA_PENDING") {
      return { ok: false, messageKey: "auth.errors.passkeyFlowInvalid" };
    }

    set({ isAuthenticating: true });

    try {
      const options =
        step === "PASSKEY_ENROLL"
          ? await getPasskeyRegisterOptions()
          : await getPasskeyMfaOptions();
      const credential =
        step === "PASSKEY_ENROLL"
          ? await createPasskeyCredential(options.publicKey)
          : await getPasskeyCredential(options.publicKey);
      const session =
        step === "PASSKEY_ENROLL"
          ? await verifyPasskeyRegistration(options.challengeId, credential)
          : await verifyPasskeyMfa(options.challengeId, credential);

      persistSession(session);
      set({
        step: "AUTHENTICATED",
        admin: toAdminUser(session.admin),
        permissions: session.permissions,
        expiresAt: session.expiresAt,
        pendingPasskey: null,
        isAuthenticating: false,
      });

      appendAuditLog({
        adminName: session.admin.name,
        action: "Admin Passkey Verified",
        target: session.admin.email,
      });

      return { ok: true, nextStep: "AUTHENTICATED" };
    } catch (error) {
      logAuthError("passkey-step", error);
      set({ isAuthenticating: false, pendingPasskey: null });
      return {
        ok: false,
        messageKey: getErrorKey(error),
        message: getErrorMessage(error),
      };
    }
  },

  logout: async (reason = "USER") => {
    const { admin } = get();

    try {
      if (readStoredAdminAccessToken()) {
        await logoutAdminSession();
      }
    } catch {
      // Local cleanup is still required if the remote session is already invalid.
    }

    await signOutFirebase();
    clearStoredAdminSession();
    set({
      step: "NONE",
      admin: null,
      tempEmail: null,
      permissions: [],
      expiresAt: null,
      pendingPasskey: null,
    });

    appendAuditLog({
      adminName: admin?.name ?? "Unknown",
      action: reason === "SESSION_EXPIRED" ? "Session Expired" : "Logout",
      target: admin?.email ?? "-",
    });
  },

  forceLogout: () => {
    void get().logout("SESSION_EXPIRED");
  },
}));

export type { AuthActionResult, AuthStep, AdminLoginResponse };
