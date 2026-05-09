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
import {
  getCurrentGoogleFirebaseIdToken,
  getGoogleFirebaseIdToken,
  signOutFirebase,
} from "@/features/auth/api/firebase-auth";
import {
  createPasskeyCredential,
  getPasskeyCredential,
} from "@/features/auth/lib/webauthn";
import {
  clearStoredAdminSession,
  readStoredAdminAccessToken,
  readStoredAdminSession,
  saveStoredAdminSession,
} from "@/shared/api/admin-session-storage";
import {
  getErrorKey,
  getErrorMessage,
  logAuthError,
} from "@/features/auth/model/auth-error-utils";
import {
  acquirePasskeyActionLock,
  assertPasskeyAttempt,
  clearPasskeyActionState,
  discardPasskeyAttempt,
  getCredentialClientDataDebug,
  recordPasskeyDebug,
  releasePasskeyActionLock,
  replacePasskeyAttempt,
  resetPasskeyAttempt,
} from "@/features/auth/model/passkey-auth-flow";
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
  const token = session.accessToken ?? readStoredAdminAccessToken();

  saveStoredAdminSession({
    token,
    expiresAt: session.expiresAt,
    stage: session.stage,
    admin: session.admin,
    permissions: session.permissions,
  });
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

      if (!session.admin || !session.stage) {
        clearStoredAdminSession();
        set({ bootstrapped: true, step: "NONE", admin: null });
        return;
      }

      const storedSession = readStoredAdminSession();
      const restoredSession = {
        accessToken: storedSession?.token ?? null,
        expiresAt: session.expiresAt,
        stage: session.stage,
        admin: session.admin,
        permissions: session.permissions,
      };

      if (
        storedSession?.stage === "AUTHENTICATED" &&
        session.stage === "AUTHENTICATED"
      ) {
        const firebaseIdToken = await getCurrentGoogleFirebaseIdToken();
        if (!firebaseIdToken) {
          clearStoredAdminSession();
          set({ bootstrapped: true, step: "NONE", admin: null });
          return;
        }

        const loginResult = await adminLogin(firebaseIdToken);
        if (!loginResult.session) {
          throw new Error("ADMIN_SESSION_MISSING");
        }

        persistSession(loginResult.session);
        set({
          bootstrapped: true,
          step: loginResult.session.stage,
          admin: toAdminUser(loginResult.session.admin),
          permissions: loginResult.session.permissions,
          expiresAt: loginResult.session.expiresAt,
          pendingPasskey: loginResult.passkey,
        });
        return;
      }

      set({
        bootstrapped: true,
        step: restoredSession.stage,
        admin: toAdminUser({ ...restoredSession.admin, role: restoredSession.admin.role }),
        permissions: restoredSession.permissions,
        expiresAt: restoredSession.expiresAt,
        pendingPasskey: null,
      });
    } catch {
      clearStoredAdminSession();
      set({ bootstrapped: true, step: "NONE", admin: null });
    }
  },

  requestGoogleLogin: async () => {
    clearPasskeyActionState();
    clearStoredAdminSession();
    set({ isAuthenticating: true, step: "NONE", pendingPasskey: null });

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

    if (get().isAuthenticating) {
      return { ok: false, messageKey: "auth.errors.passkeyActionInProgress" };
    }

    const lockOwnerId = acquirePasskeyActionLock();
    if (!lockOwnerId) {
      return { ok: false, messageKey: "auth.errors.passkeyActionInProgress" };
    }

    resetPasskeyAttempt();
    set({ isAuthenticating: true });

    try {
      const storedSession = readStoredAdminSession();
      if (!storedSession?.token) {
        throw new Error("ADMIN_ACCESS_TOKEN_MISSING");
      }

      recordPasskeyDebug({
        event: "start",
        stage: step,
        origin: window.location.origin,
      });

      const options =
        step === "PASSKEY_ENROLL"
          ? await getPasskeyRegisterOptions()
          : (get().pendingPasskey ?? (await getPasskeyMfaOptions()));
      if (!options.challengeId) {
        throw new Error("PASSKEY_CHALLENGE_ID_MISSING");
      }

      const attempt = replacePasskeyAttempt(step, options);
      const credential =
        step === "PASSKEY_ENROLL"
          ? await createPasskeyCredential(attempt.publicKey)
          : await getPasskeyCredential(attempt.publicKey);
      assertPasskeyAttempt(attempt);
      recordPasskeyDebug({
        event: "verify",
        stage: step,
        challengeId: attempt.challengeId,
        optionsRequestedAt: attempt.optionsRequestedAt,
        verifyRequestedAt: new Date().toISOString(),
        origin: window.location.origin,
        ...getCredentialClientDataDebug(credential),
      });
      const session =
        step === "PASSKEY_ENROLL"
          ? await verifyPasskeyRegistration(attempt.challengeId, credential)
          : await verifyPasskeyMfa(attempt.challengeId, credential);

      resetPasskeyAttempt();
      releasePasskeyActionLock(lockOwnerId);
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
      discardPasskeyAttempt("discard", error);
      releasePasskeyActionLock(lockOwnerId);
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
    clearPasskeyActionState();
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
