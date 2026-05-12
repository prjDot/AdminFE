import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import {
  LayoutGrid,
  List,
  MessageSquare,
  MoreHorizontal,
  ThumbsUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  type AdminCommunityPostListItem,
  type AdminCommunityPostListParams,
  deleteCommunityPost,
  fetchCommunityPostDetail,
  fetchCommunityPosts,
  updateCommunityPostVisibility,
} from "@/features/community/api/community-api";
import { queryKeys } from "@/shared/api/query-keys";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ConfirmAction } from "@/shared/ui/confirm-action";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { CommunityDetailSheet } from "./community-detail-sheet";
import {
  formatDate,
  getCategoryVariant,
  getCommentsCount,
} from "./community-table-utils";

const PAGE_SIZE = 20;

// ─── Component ────────────────────────────────────────────────────────────────

export function CommunityTableSection() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // ── UI state ────────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, sortOrder]);

  // ── Query params ─────────────────────────────────────────────────────────────
  const queryParams = useMemo<AdminCommunityPostListParams>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sortBy: "createdAt",
      sortOrder,
      ...(debouncedQuery.trim() ? { query: debouncedQuery.trim() } : {}),
    }),
    [page, debouncedQuery, sortOrder],
  );

  // ── Queries ───────────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.community.list(queryParams),
    queryFn: () => fetchCommunityPosts(queryParams),
    staleTime: 30_000,
  });

  const { data: postDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: queryKeys.community.detail(selectedPostId ?? ""),
    queryFn: () => fetchCommunityPostDetail(selectedPostId!),
    enabled: !!selectedPostId,
    staleTime: 2 * 60_000,
  });

  // ── Derived values ────────────────────────────────────────────────────────────
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const { mutate: mutateHide } = useMutation({
    mutationFn: (postId: string) =>
      updateCommunityPostVisibility(postId, "HIDDEN"),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community"] });
      toast.warning(t("community.feedback.hidden", "게시글을 숨겼습니다."));
    },
    onError: () => {
      toast.error(t("common.feedback.failed", "처리에 실패했습니다."));
    },
  });

  const { mutate: mutateDelete } = useMutation({
    mutationFn: (postId: string) => deleteCommunityPost(postId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community"] });
      setIsSheetOpen(false);
      setSelectedPostId(null);
      toast.success(
        t("community.feedback.deleted", "게시글이 삭제되었습니다."),
      );
    },
    onError: () => {
      toast.error(t("common.feedback.failed", "처리에 실패했습니다."));
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const openPost = (post: AdminCommunityPostListItem) => {
    setSelectedPostId(post.id);
    setIsSheetOpen(true);
  };

  // ── Columns ───────────────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<AdminCommunityPostListItem>[]>(
    () => [
      {
        accessorKey: "title",
        header: t("community.table.title"),
        cell: ({ row }) => (
          <span className="font-medium">{String(row.getValue("title"))}</span>
        ),
      },
      {
        accessorKey: "category",
        header: t("community.table.category"),
        cell: ({ row }) => {
          const category = String(row.getValue("category"));
          return (
            <Badge variant={getCategoryVariant(category)}>{category}</Badge>
          );
        },
      },
      {
        accessorKey: "author",
        header: t("community.table.author"),
      },
      {
        accessorKey: "likes",
        header: t("community.table.likes"),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3 text-muted-foreground" />
            {String(row.getValue("likes"))}
          </div>
        ),
      },
      {
        accessorKey: "comments",
        header: t("community.table.comments"),
        cell: ({ row }) => {
          const commentsCount = getCommentsCount(row.getValue("comments"));
          return (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-muted-foreground" />
              {commentsCount}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: t("community.table.createdAt"),
        cell: ({ row }) => formatDate(row.getValue("createdAt")),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const post = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sr-only">
                    {t("community.table.openMenu")}
                  </span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuLabel>
                  {t("community.menu.actions")}
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openPost(post)}>
                  {t("community.menu.viewPost")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <ConfirmAction
                  title={t("community.confirm.hideTitle", "게시글 숨김 처리")}
                  description={t(
                    "community.confirm.hideDescription",
                    "이 커뮤니티 게시글을 숨김 처리하시겠습니까?",
                  )}
                  confirmLabel={t("community.menu.hidePost", "숨김 처리")}
                  cancelLabel={t("common.actions.cancel", "취소")}
                  onConfirm={() => mutateHide(post.id)}
                >
                  <DropdownMenuItem
                    onSelect={(event) => event.preventDefault()}
                  >
                    {t("community.menu.hidePost", "숨김 처리")}
                  </DropdownMenuItem>
                </ConfirmAction>
                <ConfirmAction
                  title={t("community.confirm.deleteTitle", "게시글 삭제")}
                  description={t(
                    "community.confirm.deleteDescription",
                    "이 커뮤니티 게시글을 삭제하시겠습니까? 이 작업은 되돌리기 어렵습니다.",
                  )}
                  confirmLabel={t("community.menu.deletePost")}
                  cancelLabel={t("common.actions.cancel", "취소")}
                  destructive
                  onConfirm={() => mutateDelete(post.id)}
                >
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                    onSelect={(event) => event.preventDefault()}
                  >
                    {t("community.menu.deletePost")}
                  </DropdownMenuItem>
                </ConfirmAction>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, mutateHide, mutateDelete],
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder={t(
            "community.search.placeholder",
            "제목/내용/작성자 검색",
          )}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
          >
            <SelectTrigger className="h-9 w-28">
              <SelectValue placeholder={t("common.sort.label")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">{t("common.sort.desc")}</SelectItem>
              <SelectItem value="asc">{t("common.sort.asc")}</SelectItem>
            </SelectContent>
          </Select>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value: string) =>
              value && setViewMode(value as "list" | "grid")
            }
            className="rounded-md border bg-card"
          >
            <ToggleGroupItem value="list" aria-label={t("common.view.list")}>
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label={t("common.view.grid")}>
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          {t("common.loading", "불러오는 중...")}
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-sm text-destructive">
          {t("common.error.fetch", "데이터를 불러오지 못했습니다.")}
        </div>
      ) : viewMode === "list" ? (
        <DataTable
          columns={columns}
          data={items}
          onRowClick={openPost}
          showExport={false}
          showPagination={false}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((post) => (
            <Card
              key={post.id}
              className="cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
              onClick={() => openPost(post)}
            >
              <CardHeader className="py-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Badge
                    variant={getCategoryVariant(post.category)}
                    className="text-[10px]"
                  >
                    {post.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                <div className="line-clamp-2 min-h-[40px] text-sm font-semibold">
                  {post.title}
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">
                <div className="mb-3">
                  {t("community.postedBy", { author: post.author })}
                </div>
                <div className="flex items-center gap-4 border-t pt-3">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {getCommentsCount(post.comments)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !isError && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            {t("common.pagination.total", { total })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              {t("common.pagination.prev", "이전")}
            </Button>
            <span className="text-sm">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              {t("common.pagination.next", "다음")}
            </Button>
          </div>
        </div>
      )}

      <CommunityDetailSheet
        isLoading={isDetailLoading}
        open={isSheetOpen}
        postDetail={postDetail}
        selectedPostId={selectedPostId}
        onDelete={mutateDelete}
        onHide={mutateHide}
        onOpenChange={setIsSheetOpen}
      />
    </div>
  );
}
