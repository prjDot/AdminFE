import axios from "axios";
import { readStoredAdminAccessToken } from "@/shared/api/admin-session-storage";

let onUnauthorized: null | (() => void) = null;

function resolveApiBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_URL as string | undefined;

  if (!baseUrl) {
    return "/api";
  }

  const normalized = baseUrl.replace(/\/$/, "");
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = readStoredAdminAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);
