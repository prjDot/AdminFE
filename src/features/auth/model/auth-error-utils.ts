import {
  ApiResponseError,
  toApiResponseError,
} from "@/shared/api/api-response";

export function getErrorKey(error: unknown) {
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

export function getErrorMessage(error: unknown) {
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

export function logAuthError(context: string, error: unknown) {
  if (import.meta.env.DEV && typeof reportError === "function") {
    reportError(
      error instanceof Error ? error : new Error(`[admin-auth] ${context}`),
    );
  }
}
