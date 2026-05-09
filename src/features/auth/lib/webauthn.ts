import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@/features/auth/api/admin-auth-api";
import { readStoredAdminSession } from "@/shared/api/admin-session-storage";

function base64UrlToBuffer(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = window.atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function bufferToBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window
    .btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function textToBuffer(value: string) {
  return new TextEncoder().encode(value).buffer;
}

function getRp(publicKey: PublicKeyCredentialCreationOptionsJSON) {
  const rp = publicKey.rp;

  if (rp && typeof rp === "object") {
    return {
      id: typeof rp.id === "string" ? rp.id : publicKey.rpId,
      name: typeof rp.name === "string" && rp.name ? rp.name : "PawGen Admin",
    };
  }

  return {
    id: typeof publicKey.rpId === "string" ? publicKey.rpId : window.location.hostname,
    name: "PawGen Admin",
  };
}

function getUser(publicKey: PublicKeyCredentialCreationOptionsJSON) {
  const storedAdmin = readStoredAdminSession()?.admin;
  const id = publicKey.user?.id;
  const name = publicKey.user?.name || storedAdmin?.email || "admin";
  const displayName = publicKey.user?.displayName || storedAdmin?.name || name;

  return {
    ...publicKey.user,
    id: id ? base64UrlToBuffer(id) : textToBuffer(storedAdmin?.id || name),
    name,
    displayName,
  };
}

function toCredentialCreationOptions(
  publicKey: PublicKeyCredentialCreationOptionsJSON
): PublicKeyCredentialCreationOptions {
  const pubKeyCredParams = Array.isArray(publicKey.pubKeyCredParams)
    ? publicKey.pubKeyCredParams
    : [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ];

  return {
    ...publicKey,
    rp: getRp(publicKey),
    challenge: base64UrlToBuffer(publicKey.challenge ?? ""),
    pubKeyCredParams,
    user: getUser(publicKey),
    excludeCredentials: publicKey.excludeCredentials?.map((credential) => ({
      ...credential,
      id: base64UrlToBuffer(credential.id ?? ""),
      type: "public-key",
    })),
  } as PublicKeyCredentialCreationOptions;
}

function toCredentialRequestOptions(
  publicKey: PublicKeyCredentialRequestOptionsJSON
): PublicKeyCredentialRequestOptions {
  return {
    ...publicKey,
    challenge: base64UrlToBuffer(publicKey.challenge ?? ""),
    allowCredentials: publicKey.allowCredentials?.map((credential) => ({
      ...credential,
      id: base64UrlToBuffer(credential.id ?? ""),
      type: "public-key",
    })),
  } as PublicKeyCredentialRequestOptions;
}

export async function createPasskeyCredential(
  publicKey: PublicKeyCredentialCreationOptionsJSON
) {
  const credential = await navigator.credentials.create({
    publicKey: toCredentialCreationOptions(publicKey),
  });

  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error("PASSKEY_CREDENTIAL_MISSING");
  }

  const response = credential.response as AuthenticatorAttestationResponse;

  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      attestationObject: bufferToBase64Url(response.attestationObject),
    },
  };
}

export async function getPasskeyCredential(
  publicKey: PublicKeyCredentialRequestOptionsJSON
) {
  const credential = await navigator.credentials.get({
    publicKey: toCredentialRequestOptions(publicKey),
  });

  if (!(credential instanceof PublicKeyCredential)) {
    throw new Error("PASSKEY_CREDENTIAL_MISSING");
  }

  const response = credential.response as AuthenticatorAssertionResponse;

  return {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    clientExtensionResults: credential.getClientExtensionResults(),
    response: {
      clientDataJSON: bufferToBase64Url(response.clientDataJSON),
      authenticatorData: bufferToBase64Url(response.authenticatorData),
      signature: bufferToBase64Url(response.signature),
      userHandle: response.userHandle
        ? bufferToBase64Url(response.userHandle)
        : null,
    },
  };
}
