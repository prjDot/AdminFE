import type { TrafficLog } from "@/features/traffic/api/traffic-api";

export const ALL_TRAFFIC_GROUP = "ALL";

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
