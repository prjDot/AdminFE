import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Calendar,
  Download,
  Image as ImageIcon,
  LayoutGrid,
  List,
  MapPin,
  MoreHorizontal,
  User as UserIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  type AdminNoticeListItem,
  type AdminNoticeListParams,
  exportNoticesCSV,
  fetchNoticeDetail,
  fetchNotices,
  hideNotice,
  restoreNotice,
} from "@/features/notices/api/notices-api";
import { queryKeys } from "@/shared/api/query-keys";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ConfirmAction } from "@/shared/ui/confirm-action";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { NoticeDetailContent } from "@/widgets/notices-table/ui/notice-detail-content";
import {
  formatDate,
  getNoticeStatusLabelKey,
  getStatusVariant,
  PAGE_SIZE,
} from "@/widgets/notices-table/ui/notice-table-utils";

interface NoticesTableSectionProps {
  status?: string;
  search?: string;
}

export function NoticesTableSection({
  status,
  search = "",
}: NoticesTableSectionProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [status, search]);

  const queryParams = useMemo<AdminNoticeListParams>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(search.trim() ? { query: search.trim() } : {}),
      ...(status ? { status } : {}),
    }),
    [page, search, status],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.notices.list(queryParams),
    queryFn: () => fetchNotices(queryParams),
  });

  const { data: noticeDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: queryKeys.notices.detail(selectedNoticeId ?? ""),
    queryFn: () => fetchNoticeDetail(selectedNoticeId!),
    enabled: !!selectedNoticeId,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const { mutate: mutateHide } = useMutation({
    mutationFn: (noticeId: string) => hideNotice(noticeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast.warning(
        t("notices.feedback.hiddenNotice", "공고 게시글을 숨김 처리했습니다."),
      );
    },
    onError: () => {
      toast.error(t("common.feedback.failed", "처리에 실패했습니다."));
    },
  });

  const { mutate: mutateRestore } = useMutation({
    mutationFn: (noticeId: string) => restoreNotice(noticeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notices"] });
      toast.success(
        t(
          "notices.feedback.restoredNotice",
          "공고 게시글 숨김을 해제했습니다.",
        ),
      );
    },
    onError: () => {
      toast.error(t("common.feedback.failed", "처리에 실패했습니다."));
    },
  });

  const openNoticeDetail = useCallback((notice: AdminNoticeListItem) => {
    setSelectedNoticeId(notice.id);
    setIsDetailOpen(true);
  }, []);

  const handleExportCSV = async () => {
    try {
      const blob = await exportNoticesCSV({
        ...(search.trim() ? { query: search.trim() } : {}),
        ...(status ? { status } : {}),
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "notices.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast.error(
        t("notices.feedback.exportError", "CSV 다운로드에 실패했습니다."),
      );
    }
  };

  const columns = useMemo<ColumnDef<AdminNoticeListItem>[]>(
    () => [
      {
        accessorKey: "title",
        header: t("notices.table.title"),
        cell: ({ row }) => {
          const notice = row.original;
          return (
            <div className="flex items-center gap-3">
              {notice.thumbnailUrl ? (
                <img
                  src={notice.thumbnailUrl}
                  alt={notice.title}
                  className="h-10 w-10 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <span className="font-medium">{notice.title}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "animalType",
        header: t("notices.table.type"),
      },
      {
        accessorKey: "status",
        header: t("notices.table.status"),
        cell: ({ row }) => {
          const statusValue = row.getValue("status") as string;
          return (
            <Badge variant={getStatusVariant(statusValue)}>
              {t(getNoticeStatusLabelKey(statusValue), statusValue)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "reporter",
        header: t("notices.table.reporter"),
      },
      {
        accessorKey: "reportedAt",
        header: t("notices.table.reportedDate"),
        cell: ({ row }) => formatDate(row.getValue("reportedAt")),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const notice = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(event) => event.stopPropagation()}
                >
                  <span className="sr-only">{t("notices.table.openMenu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(event) => event.stopPropagation()}
              >
                <DropdownMenuLabel>
                  {t("notices.menu.actions")}
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openNoticeDetail(notice)}>
                  {t("notices.menu.viewDetails")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {notice.hidden ? (
                  <ConfirmAction
                    title={t("notices.confirm.restoreTitle", "공고 숨김 해제")}
                    description={t(
                      "notices.confirm.restoreDescription",
                      "이 실종 공고를 다시 노출하시겠습니까?",
                    )}
                    confirmLabel={t(
                      "notices.menu.restoreNotice",
                      "게시글 숨김 해제",
                    )}
                    cancelLabel={t("common.actions.cancel", "취소")}
                    onConfirm={() => mutateRestore(notice.id)}
                  >
                    <DropdownMenuItem
                      onSelect={(event) => event.preventDefault()}
                    >
                      {t("notices.menu.restoreNotice", "게시글 숨김 해제")}
                    </DropdownMenuItem>
                  </ConfirmAction>
                ) : (
                  <ConfirmAction
                    title={t("notices.confirm.hideTitle", "공고 숨김 처리")}
                    description={t(
                      "notices.confirm.hideDescription",
                      "이 실종 공고를 관리자 화면 기준으로 숨김 처리하시겠습니까?",
                    )}
                    confirmLabel={t(
                      "notices.menu.hideNotice",
                      "게시글 숨김 처리",
                    )}
                    cancelLabel={t("common.actions.cancel", "취소")}
                    destructive
                    onConfirm={() => mutateHide(notice.id)}
                  >
                    <DropdownMenuItem
                      className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                      onSelect={(event) => event.preventDefault()}
                    >
                      {t("notices.menu.hideNotice", "게시글 숨김 처리")}
                    </DropdownMenuItem>
                  </ConfirmAction>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, openNoticeDetail, mutateHide, mutateRestore],
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => {
            void handleExportCSV();
          }}
        >
          <Download className="h-4 w-4" />
          {t("common.actions.exportCsv", "CSV 내보내기")}
        </Button>

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

      {isLoading && (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16">
          <span className="animate-pulse text-muted-foreground">
            {t("common.loading", "로딩 중...")}
          </span>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : t("common.error.generic", "데이터를 불러오는 데 실패했습니다.")}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {viewMode === "list" ? (
            <DataTable
              columns={columns}
              data={items}
              onRowClick={openNoticeDetail}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.length > 0 ? (
                items.map((notice) => (
                  <Card
                    key={notice.id}
                    className="cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
                    onClick={() => openNoticeDetail(notice)}
                  >
                    {notice.thumbnailUrl ? (
                      <img
                        src={notice.thumbnailUrl}
                        alt={notice.title}
                        className="h-32 w-full object-cover border-b"
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center border-b bg-muted">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                    <CardHeader className="py-3">
                      <div className="line-clamp-2 text-sm font-semibold">
                        {notice.title}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge variant="outline" className="h-5 text-[10px]">
                          {notice.animalType}
                        </Badge>
                        <Badge
                          variant={getStatusVariant(notice.status)}
                          className="h-5 text-[10px]"
                        >
                          {t(
                            getNoticeStatusLabelKey(notice.status),
                            notice.status,
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1 pt-0 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-3 w-3" />
                        {notice.reporter}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDate(notice.reportedAt)}
                      </div>
                      {notice.region && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {notice.region}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full rounded-xl border bg-card py-12 text-center text-muted-foreground">
                  {t("table.noResults")}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between px-2 py-2">
            <span className="text-sm text-muted-foreground">
              총 {total}건 &middot; {page} / {totalPages} 페이지
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((currentPage) => currentPage - 1)}
                disabled={page <= 1}
              >
                {t("common.actions.previous", "이전")}
              </Button>
              <span className="min-w-12 text-center text-sm tabular-nums">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((currentPage) => currentPage + 1)}
                disabled={page >= totalPages}
              >
                {t("common.actions.next", "다음")}
              </Button>
            </div>
          </div>
        </>
      )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-140">
          <DialogHeader>
            <DialogTitle>{t("notices.detail.title")}</DialogTitle>
            <DialogDescription>
              {t("notices.detail.description")}
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading && (
            <div className="flex items-center justify-center py-16">
              <span className="animate-pulse text-muted-foreground">
                {t("common.loading", "로딩 중...")}
              </span>
            </div>
          )}

          {!isDetailLoading && noticeDetail && (
            <NoticeDetailContent
              detail={noticeDetail}
              onHide={() => {
                mutateHide(noticeDetail.id);
                setIsDetailOpen(false);
              }}
              onRestore={() => {
                mutateRestore(noticeDetail.id);
                setIsDetailOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
