import { apiClient } from "@/shared/api/client";
import { type ApiResponse, unwrapApiResponse } from "@/shared/api/api-response";

export type AdminAuthStage = "PASSKEY_ENROLL" | "MFA_PENDING" | "AUTHENTICATED";

export type AdminLoginNextStep =
  | "EMAIL_VERIFICATION_REQUIRED"
  | "PASSKEY_REGISTRATION_REQUIRED"
  | "PASSKEY_REQUIRED";

export interface AdminAuthSessionAdmin {
  id: string;
  email: string;
  name: string;
  role: "ADMIN";
}

export interface AdminAuthSessionResponse {
  accessToken: string | null;
  expiresAt: string;
  stage: AdminAuthStage;
  admin: AdminAuthSessionAdmin;
  permissions: string[];
}

export interface AdminPasskeyOptionsResponse {
  challengeId: string;
  publicKey: PublicKeyCredentialCreationOptionsJSON | PublicKeyCredentialRequestOptionsJSON;
}

export interface AdminLoginResponse {
  nextStep: AdminLoginNextStep;
  requiresPassKey: boolean;
  session: AdminAuthSessionResponse | null;
  passkey: AdminPasskeyOptionsResponse | null;
}

export interface AdminSessionStateResponse {
  authenticated: boolean;
  stage: AdminAuthStage | null;
  admin: AdminAuthSessionAdmin | null;
  permissions: string[];
  expiresAt: string | null;
}

export interface PublicKeyCredentialCreationOptionsJSON {
  challenge?: string;
  rp?: { id?: string; name?: string };
  rpId?: string;
  user?: { id?: string; name?: string; displayName?: string };
  pubKeyCredParams?: Array<{ type?: string; alg?: number }>;
  excludeCredentials?: Array<{ id?: string; type?: string; transports?: string[] }>;
  [key: string]: unknown;
}

export interface PublicKeyCredentialRequestOptionsJSON {
  challenge?: string;
  allowCredentials?: Array<{ id?: string; type?: string; transports?: string[] }>;
  [key: string]: unknown;
}

export async function adminLogin(firebaseIdToken: string) {
  return unwrapApiResponse(
    await apiClient.post<ApiResponse<AdminLoginResponse>>("/admin/auth/login", {
      firebaseIdToken,
    })
  );
}

export async function getAdminSessionState() {
  return unwrapApiResponse(
    await apiClient.get<ApiResponse<AdminSessionStateResponse>>(
      "/admin/auth/session"
    )
  );
}

export async function getPasskeyRegisterOptions() {
  return unwrapApiResponse(
    await apiClient.post<ApiResponse<AdminPasskeyOptionsResponse>>(
      "/admin/auth/passkeys/register/options"
    )
  );
}

export async function verifyPasskeyRegistration(
  challengeId: string,
  credential: unknown
) {
  return unwrapApiResponse(
    await apiClient.post<ApiResponse<AdminAuthSessionResponse>>(
      "/admin/auth/passkeys/register/verify",
      { challengeId, credential }
    )
  );
}

export async function getPasskeyMfaOptions() {
  return unwrapApiResponse(
    await apiClient.post<ApiResponse<AdminPasskeyOptionsResponse>>(
      "/admin/auth/mfa/options"
    )
  );
}

export async function verifyPasskeyMfa(challengeId: string, credential: unknown) {
  return unwrapApiResponse(
    await apiClient.post<ApiResponse<AdminAuthSessionResponse>>(
      "/admin/auth/mfa/verify",
      { challengeId, credential }
    )
  );
}

export async function logoutAdminSession() {
  return unwrapApiResponse(
    await apiClient.post<ApiResponse<null>>("/admin/auth/logout")
  );
}
