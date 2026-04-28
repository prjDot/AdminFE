export interface AuditLogEntry {
  id: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
  ipAddress: string;
}

const AUDIT_STORAGE_KEY = "paw-admin-audit-logs";

const MOCK_IP_ADDRESS = "127.0.0.1 (mock)";

function canUseStorage() {
  return typeof window !== "undefined";
}

function createAuditId() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 8)
    .toUpperCase();
  return `A${suffix}`;
}

function safeParseLogs(raw: string | null) {
  if (!raw) {
    return [] as AuditLogEntry[];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is AuditLogEntry =>
        Boolean(item) &&
        typeof item.id === "string" &&
        typeof item.adminName === "string" &&
        typeof item.action === "string" &&
        typeof item.target === "string" &&
        typeof item.timestamp === "string" &&
        typeof item.ipAddress === "string"
    );
  } catch {
    return [];
  }
}

export function readAuditLogs() {
  if (!canUseStorage()) {
    return [] as AuditLogEntry[];
  }

  return safeParseLogs(window.localStorage.getItem(AUDIT_STORAGE_KEY));
}

export function appendAuditLog(input: {
  adminName: string;
  action: string;
  target: string;
  ipAddress?: string;
  timestamp?: string;
}) {
  if (!canUseStorage()) {
    return null;
  }

  const entry: AuditLogEntry = {
    id: createAuditId(),
    adminName: input.adminName,
    action: input.action,
    target: input.target,
    timestamp: input.timestamp ?? new Date().toISOString(),
    ipAddress: input.ipAddress ?? MOCK_IP_ADDRESS,
  };

  const logs = readAuditLogs();
  const nextLogs = [entry, ...logs].slice(0, 200);
  window.localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(nextLogs));
  return entry;
}
