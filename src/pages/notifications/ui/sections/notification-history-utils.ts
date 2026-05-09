export function downloadCsv(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  link.remove();
}

export function formatNotificationDate(dateString: string) {
  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getNotificationStatusBadge(status: string) {
  const normalized = status.toLowerCase();
  if (["failed", "failure", "error"].includes(normalized)) {
    return "destructive";
  }
  if (normalized === "partial") return "warning";
  if (normalized === "skipped") return "secondary";
  if (["sent", "success", "completed"].includes(normalized)) {
    return "success";
  }
  if (["sending", "pending"].includes(normalized)) {
    return "secondary";
  }
  return "secondary";
}

export function getNotificationStatusLabelKey(status: string) {
  const normalized = status.toLowerCase();
  if (["sent", "success", "completed"].includes(normalized)) {
    return "notifications.status.sent";
  }
  if (normalized === "partial") return "notifications.status.partial";
  if (normalized === "skipped") return "notifications.status.skipped";
  if (["failed", "failure", "error"].includes(normalized)) {
    return "notifications.status.failed";
  }
  return "notifications.status.pending";
}
