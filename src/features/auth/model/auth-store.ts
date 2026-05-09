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
  ApiResponseError,
  toApiResponseError,
} from "@/shared/api/api-response";
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

interface PasskeyAttemptContext {
  id: string;
  step: Extract<AuthStep, "PASSKEY_ENROLL" | "MFA_PENDING">;
  challengeId: string;
  publicKey: AdminPasskeyOptionsResponse["publicKey"];
  optionsRequestedAt: string;
  origin: string;
}

type PasskeyDebugEvent = {
  event: string;
  stage?: Extract<AuthStep, "PASSKEY_ENROLL" | "MFA_PENDING">;
  challengeId?: string;
  optionsRequestedAt?: string;
  verifyRequestedAt?: string;
  origin?: string;
  clientDataOrigin?: string;
  clientDataType?: string;
  apiStatus?: number;
  apiCode?: string;
  apiMessage?: string;
  errorType?: string;
  timestamp: string;
};

const PASSKEY_ACTION_LOCK_STORAGE_KEY = "paw-admin-passkey-action-lock";
const PASSKEY_ACTION_LOCK_TTL_MS = 2 * 60 * 1000;

let activePasskeyAttempt: PasskeyAttemptContext | null = null;
let passkeyActionInFlight = false;

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

function recordPasskeyDebug(event: Omit<PasskeyDebugEvent, "timestamp">) {
  if (typeof window === "undefined") {
    return;
  }

  const target = window as Window & {
    __ADMIN_PASSKEY_DEBUG__?: PasskeyDebugEvent[];
  };
  target.__ADMIN_PASSKEY_DEBUG__ = target.__ADMIN_PASSKEY_DEBUG__ ?? [];
  target.__ADMIN_PASSKEY_DEBUG__.push({
    ...event,
    timestamp: new Date().toISOString(),
  });
}

function getApiErrorDebug(error: unknown) {
  const normalizedError = toApiResponseError(error);

  if (!(normalizedError instanceof ApiResponseError)) {
    return {};
  }

  return {
    apiStatus: normalizedError.status,
    apiCode: normalizedError.code,
    apiMessage: normalizedError.message,
  };
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return window.atob(padded);
}

function getCredentialClientDataDebug(credential: unknown) {
  if (
    typeof window === "undefined" ||
    typeof credential !== "object" ||
    credential === null ||
    !("response" in credential) ||
    typeof credential.response !== "object" ||
    credential.response === null ||
    !("clientDataJSON" in credential.response) ||
    typeof credential.response.clientDataJSON !== "string"
  ) {
    return {};
  }

  try {
    const clientData = JSON.parse(
      decodeBase64Url(credential.response.clientDataJSON),
    ) as { origin?: unknown; type?: unknown };

    return {
      clientDataOrigin:
        typeof clientData.origin === "string" ? clientData.origin : undefined,
      clientDataType:
        typeof clientData.type === "string" ? clientData.type : undefined,
    };
  } catch {
    return {};
  }
}

function readPasskeyActionLock() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(PASSKEY_ACTION_LOCK_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const lock = JSON.parse(raw) as { ownerId?: unknown; expiresAt?: unknown };
    if (
      typeof lock.ownerId !== "string" ||
      typeof lock.expiresAt !== "number"
    ) {
      return null;
    }

    if (lock.expiresAt <= Date.now()) {
      window.localStorage.removeItem(PASSKEY_ACTION_LOCK_STORAGE_KEY);
      return null;
    }

    return lock as { ownerId: string; expiresAt: number };
  } catch {
    window.localStorage.removeItem(PASSKEY_ACTION_LOCK_STORAGE_KEY);
    return null;
  }
}

function acquirePasskeyActionLock() {
  if (passkeyActionInFlight || readPasskeyActionLock()) {
    return null;
  }

  const ownerId = crypto.randomUUID();
  passkeyActionInFlight = true;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      PASSKEY_ACTION_LOCK_STORAGE_KEY,
      JSON.stringify({
        ownerId,
        expiresAt: Date.now() + PASSKEY_ACTION_LOCK_TTL_MS,
      }),
    );
  }

  return ownerId;
}

function releasePasskeyActionLock(ownerId: string | null) {
  passkeyActionInFlight = false;

  if (typeof window === "undefined" || !ownerId) {
    return;
  }

  const lock = readPasskeyActionLock();
  if (!lock || lock.ownerId === ownerId) {
    window.localStorage.removeItem(PASSKEY_ACTION_LOCK_STORAGE_KEY);
  }
}

function replacePasskeyAttempt(
  step: Extract<AuthStep, "PASSKEY_ENROLL" | "MFA_PENDING">,
  options: AdminPasskeyOptionsResponse,
) {
  const optionsRequestedAt = new Date().toISOString();
  activePasskeyAttempt = {
    id: crypto.randomUUID(),
    step,
    challengeId: options.challengeId,
    publicKey: options.publicKey,
    optionsRequestedAt,
    origin: window.location.origin,
  };

  recordPasskeyDebug({
    event: "options",
    stage: step,
    challengeId: activePasskeyAttempt.challengeId,
    optionsRequestedAt,
    origin: activePasskeyAttempt.origin,
  });

  return activePasskeyAttempt;
}

function discardPasskeyAttempt(event: string, error?: unknown) {
  recordPasskeyDebug({
    event,
    stage: activePasskeyAttempt?.step,
    challengeId: activePasskeyAttempt?.challengeId,
    optionsRequestedAt: activePasskeyAttempt?.optionsRequestedAt,
    origin: window.location.origin,
    errorType: error instanceof Error ? error.name : undefined,
    ...getApiErrorDebug(error),
  });
  activePasskeyAttempt = null;
}

function assertPasskeyAttempt(attempt: PasskeyAttemptContext) {
  if (
    !activePasskeyAttempt ||
    activePasskeyAttempt.id !== attempt.id ||
    activePasskeyAttempt.challengeId !== attempt.challengeId
  ) {
    throw new Error("PASSKEY_CHALLENGE_CONTEXT_STALE");
  }

  if (attempt.origin !== window.location.origin) {
    throw new Error("PASSKEY_ORIGIN_CHANGED");
  }
}

function getErrorKey(error: unknown) {
  const normalizedError = toApiResponseError(error);

  if (
    normalizedError instanceof Error &&
    normalizedError.message === "FIREBASE_CONFIG_MISSING"
  ) {
    return "auth.errors.firebaseConfigMissing";
  }

  if (normalizedError instanceof ApiResponseError) {
    if (
      normalizedError.code === "ADMIN_SESSION_REQUIRED" ||
      normalizedError.code === "UNAUTHORIZED"
    ) {
      return "auth.errors.adminAccessTokenMissing";
    }

    if (
      normalizedError.code === "ADMIN_ONLY" ||
      normalizedError.code === "GOOGLE_SIGN_IN_REQUIRED"
    ) {
      return "auth.errors.adminForbidden";
    }

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

  if (
    normalizedError instanceof Error &&
    normalizedError.message === "PASSKEY_CREDENTIAL_MISSING"
  ) {
    return "auth.errors.passkeyCredentialMissing";
  }

  if (
    normalizedError instanceof Error &&
    normalizedError.message === "ADMIN_ACCESS_TOKEN_MISSING"
  ) {
    return "auth.errors.adminAccessTokenMissing";
  }

  if (
    normalizedError instanceof Error &&
    normalizedError.message === "PASSKEY_ACTION_IN_PROGRESS"
  ) {
    return "auth.errors.passkeyActionInProgress";
  }

  if (
    normalizedError instanceof Error &&
    normalizedError.message === "PASSKEY_CHALLENGE_CONTEXT_STALE"
  ) {
    return "auth.errors.passkeyChallengeStale";
  }

  if (
    normalizedError instanceof Error &&
    normalizedError.message === "PASSKEY_ORIGIN_CHANGED"
  ) {
    return "auth.errors.passkeyOriginChanged";
  }

  if (
    normalizedError instanceof Error &&
    normalizedError.message === "PASSKEY_CHALLENGE_ID_MISSING"
  ) {
    return "auth.errors.passkeyOptionsInvalid";
  }

  if (
    normalizedError instanceof Error &&
    normalizedError.message === "PASSKEY_OPTIONS_INVALID"
  ) {
    return "auth.errors.passkeyOptionsInvalid";
  }

  if (
    normalizedError instanceof Error &&
    normalizedError.message === "PASSKEY_NOT_SUPPORTED"
  ) {
    return "auth.errors.passkeyNotSupported";
  }

  if (
    normalizedError instanceof Error &&
    normalizedError.message === "PASSKEY_SECURE_CONTEXT_REQUIRED"
  ) {
    return "auth.errors.passkeySecureContextRequired";
  }

  if (
    normalizedError instanceof TypeError &&
    normalizedError.message.includes(
      "PublicKeyCredentialCreationOptions.pubKeyCredParams",
    )
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
      normalizedError.requestId
        ? `requestId=${normalizedError.requestId}`
        : null,
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
    reportError(
      error instanceof Error ? error : new Error(`[admin-auth] ${context}`),
    );
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

      if (!session.admin || !session.stage) {
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

    if (get().isAuthenticating) {
      return { ok: false, messageKey: "auth.errors.passkeyActionInProgress" };
    }

    const lockOwnerId = acquirePasskeyActionLock();
    if (!lockOwnerId) {
      return { ok: false, messageKey: "auth.errors.passkeyActionInProgress" };
    }

    activePasskeyAttempt = null;
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

      activePasskeyAttempt = null;
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
