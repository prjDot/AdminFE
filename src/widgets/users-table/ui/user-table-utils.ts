const SUSPENDED_STATUSES = new Set(["SUSPENDED", "BANNED", "STOPPED"]);

export function isUserSuspended(status: string): boolean {
  return SUSPENDED_STATUSES.has(status);
}

export function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" {
  if (status === "ACTIVE" || status === "NORMAL") return "default";
  if (isUserSuspended(status)) return "destructive";
  return "secondary";
}
