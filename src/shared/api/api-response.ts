import type { AxiosResponse } from "axios";

export interface ApiErrorBody {
  code: string;
  message: string;
  detail: unknown;
}

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  message: string;
  data: T;
  error: ApiErrorBody | null;
  meta: {
    requestId?: string;
    timestamp?: string;
  };
}

export class ApiResponseError extends Error {
  status: number;
  code?: string;
  detail: unknown;
  requestId?: string;

  constructor(response: ApiResponse<unknown>) {
    super(response.error?.message || response.message || "API request failed");
    this.name = "ApiResponseError";
    this.status = response.status;
    this.code = response.error?.code;
    this.detail = response.error?.detail;
    this.requestId = response.meta?.requestId;
  }
}

export function unwrapApiResponse<T>(response: AxiosResponse<ApiResponse<T>>) {
  const payload = response.data;

  if (!payload.ok) {
    throw new ApiResponseError(payload as ApiResponse<unknown>);
  }

  return payload.data;
}

export function toApiResponseError(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response
  ) {
    const data = error.response.data as Partial<ApiResponse<unknown>>;

    if (typeof data.ok === "boolean" && typeof data.status === "number") {
      return new ApiResponseError(data as ApiResponse<unknown>);
    }
  }

  return error;
}
