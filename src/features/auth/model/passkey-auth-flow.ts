import {
  type AdminPasskeyOptionsResponse,
} from "@/features/auth/api/admin-auth-api";
import {
  ApiResponseError,
  toApiResponseError,
} from "@/shared/api/api-response";

type PasskeyStep = "PASSKEY_ENROLL" | "MFA_PENDING";

interface PasskeyAttemptContext {
  id: string;
  step: PasskeyStep;
  challengeId: string;
  publicKey: AdminPasskeyOptionsResponse["publicKey"];
  optionsRequestedAt: string;
  origin: string;
}

type PasskeyDebugEvent = {
  event: string;
  stage?: PasskeyStep;
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

export function recordPasskeyDebug(
  event: Omit<PasskeyDebugEvent, "timestamp">,
) {
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

export function getCredentialClientDataDebug(credential: unknown) {
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

export function acquirePasskeyActionLock() {
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

export function releasePasskeyActionLock(ownerId: string | null) {
  passkeyActionInFlight = false;

  if (typeof window === "undefined" || !ownerId) {
    return;
  }

  const lock = readPasskeyActionLock();
  if (!lock || lock.ownerId === ownerId) {
    window.localStorage.removeItem(PASSKEY_ACTION_LOCK_STORAGE_KEY);
  }
}

export function clearPasskeyActionState() {
  activePasskeyAttempt = null;
  passkeyActionInFlight = false;

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(PASSKEY_ACTION_LOCK_STORAGE_KEY);
  }
}

export function resetPasskeyAttempt() {
  activePasskeyAttempt = null;
}

export function replacePasskeyAttempt(
  step: PasskeyStep,
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

export function discardPasskeyAttempt(event: string, error?: unknown) {
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

export function assertPasskeyAttempt(attempt: PasskeyAttemptContext) {
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
