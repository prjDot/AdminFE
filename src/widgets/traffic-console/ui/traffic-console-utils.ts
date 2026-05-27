import type { TrafficLog } from "@/features/traffic/api/traffic-api";

export const ALL_TRAFFIC_GROUP = "ALL";
export const TRAFFIC_TRACKED_PREFIXES = ["/api/"] as const;
export const TRAFFIC_ERROR_FILTER = "status == 0 || status >= 400";
export const EXCLUDED_TRAFFIC_PATHS = [
  "/api/admin/traffic/config",
  "/api/admin/traffic/logs",
] as const;

export function isExcludedTrafficPath(path: string) {
  return EXCLUDED_TRAFFIC_PATHS.some((excludedPath) => path.startsWith(excludedPath));
}

export function getTrafficGroupKey(path: string) {
  const cleanPath = path.split("?")[0] || "/";
  const parts = cleanPath.split("/").filter(Boolean);

  if (parts[0] !== "api") return cleanPath;
  if (parts[1] === "admin") {
    return parts[2] ? `/api/admin/${parts[2]}` : "/api/admin";
  }
  return parts[1] ? `/api/${parts[1]}` : "/api";
}

function formatBody(body?: string) {
  if (!body) return "";

  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

export function formatTrafficBody(body?: string) {
  return formatBody(body) || "-";
}

export function formatTrafficLog(log: TrafficLog) {
  return [
    `=== ${log.direction} ${log.method} ${log.path} ===`,
    `time: ${log.timestamp}`,
    `status: ${log.status}`,
    `durationMs: ${log.durationMs}`,
    `source: ${log.remoteAddr ?? "-"}`,
    "req{",
    formatBody(log.requestBody),
    "}",
    "res{",
    formatBody(log.responseBody),
    "}",
    "----------------------------------------",
  ].join("\n");
}
