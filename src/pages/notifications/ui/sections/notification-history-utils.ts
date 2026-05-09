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
  if (["failed", "failure", "error"].includes(normalized)) return "destructive";
  if (["sending", "pending"].includes(normalized)) return "secondary";
  return "default";
}
