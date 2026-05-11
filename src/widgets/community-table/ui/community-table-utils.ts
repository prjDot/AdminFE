export function getCategoryVariant(
  category: string,
): "destructive" | "default" | "secondary" {
  const lower = category.toLowerCase();
  if (lower === "qna") return "destructive";
  if (lower === "tip") return "default";
  return "secondary";
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ko-KR");
}

export function getCommentsCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (Array.isArray(value)) return value.length;

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const countKeys = ["count", "total", "totalCount", "commentCount", "size"];

    for (const key of countKeys) {
      const rawCount = record[key];
      if (typeof rawCount === "number" && Number.isFinite(rawCount)) {
        return rawCount;
      }
    }

    const items = record.items;
    if (Array.isArray(items)) return items.length;

    if (
      "id" in record &&
      "authorId" in record &&
      "authorName" in record &&
      "content" in record
    ) {
      return 1;
    }
  }

  return 0;
}
