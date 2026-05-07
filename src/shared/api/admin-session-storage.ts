const AUTH_SESSION_STORAGE_KEY = "paw-admin-auth-session";

export interface StoredAdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export type StoredAdminSessionStage =
  | "PASSKEY_ENROLL"
  | "MFA_PENDING"
  | "AUTHENTICATED";

export interface StoredAdminSession {
  token: string | null;
  accessToken?: string | null;
  expiresAt: string | number;
  stage: StoredAdminSessionStage;
  admin: StoredAdminUser;
  permissions: string[];
}

function getToken(session: Pick<StoredAdminSession, "token" | "accessToken">) {
  return session.accessToken ?? session.token ?? null;
}

function isExpired(expiresAt: string | number) {
  const timestamp =
    typeof expiresAt === "number" ? expiresAt : new Date(expiresAt).getTime();
  return Number.isFinite(timestamp) && timestamp <= Date.now();
}

export function readStoredAdminAccessToken() {
  return readStoredAdminSession()?.token ?? null;
}

export function readStoredAdminSession(): StoredAdminSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const session = JSON.parse(raw) as StoredAdminSession;
    const token = getToken(session);

    if (!token || !session.admin || isExpired(session.expiresAt)) {
      window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      return null;
    }
    return { ...session, token };
  } catch {
    return null;
  }
}

export function saveStoredAdminSession(session: StoredAdminSession) {
  if (typeof window === "undefined") {
    return;
  }

  const token = getToken(session);
  if (!token) {
    return;
  }

  window.localStorage.setItem(
    AUTH_SESSION_STORAGE_KEY,
    JSON.stringify({ ...session, token })
  );
}

export function clearStoredAdminSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export { AUTH_SESSION_STORAGE_KEY };
