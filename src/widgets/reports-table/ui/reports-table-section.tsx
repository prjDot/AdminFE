import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, LayoutGrid, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  type AdminReportListItem,
  type AdminReportListParams,
  deleteReportTarget,
  dismissReport,
  exportReportsCSV,
  fetchReportDetail,
  fetchReportReporters,
  fetchReports,
  resolveReport,
  warnReport,
} from "@/features/reports/api/reports-api";
import { queryKeys } from "@/shared/api/query-keys";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { ReportDetailContent } from "./report-detail-content";
import { ReportsGrid, useReportColumns } from "./report-list-content";
import {
  PAGE_SIZE,
  STATUS_OPTIONS,
  TARGET_TYPE_OPTIONS,
} from "./report-table-utils";

export function ReportsTableSection() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("ALL");

  useEffect(() => {
    setPage(1);
  }, [statusFilter, targetTypeFilter]);

  const queryParams = useMemo<AdminReportListParams>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
      ...(targetTypeFilter !== "ALL" ? { targetType: targetTypeFilter } : {}),
    }),
    [page, statusFilter, targetTypeFilter],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.reports.list(queryParams),
    queryFn: () => fetchReports(queryParams),
    staleTime: 30_000,
  });

  const { data: reportDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: queryKeys.reports.detail(selectedReportId ?? ""),
    queryFn: () => fetchReportDetail(selectedReportId!),
    enabled: !!selectedReportId,
    staleTime: 2 * 60_000,
  });

  const { data: reporters, isLoading: isReportersLoading } = useQuery({
    queryKey: queryKeys.reports.reporters(selectedReportId ?? ""),
    queryFn: () => fetchReportReporters(selectedReportId!),
    enabled: !!selectedReportId,
    staleTime: 2 * 60_000,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const invalidateAndClose = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["reports"] });
    setIsDetailOpen(false);
  }, [queryClient]);

  const { mutate: mutateDismiss, isPending: isDismissing } = useMutation({
    mutationFn: (reportId: string) => dismissReport(reportId),
    onSuccess: () => {
      invalidateAndClose();
      toast.success(t("reports.feedback.dismissed", "신고가 기각되었습니다."));
    },
    onError: () =>
      toast.error(t("common.feedback.failed", "처리에 실패했습니다.")),
  });

  const { mutate: mutateResolve, isPending: isResolving } = useMutation({
    mutationFn: (reportId: string) => resolveReport(reportId),
    onSuccess: () => {
      invalidateAndClose();
      toast.success(t("reports.feedback.resolved", "신고가 해결되었습니다."));
    },
    onError: () =>
      toast.error(t("common.feedback.failed", "처리에 실패했습니다.")),
  });

  const { mutate: mutateWarn, isPending: isWarning } = useMutation({
    mutationFn: (reportId: string) => warnReport(reportId),
    onSuccess: () => {
      invalidateAndClose();
      toast.success(t("reports.feedback.warned", "경고가 발송되었습니다."));
    },
    onError: () =>
      toast.error(t("common.feedback.failed", "처리에 실패했습니다.")),
  });

  const { mutate: mutateDeleteTarget, isPending: isDeletingTarget } =
    useMutation({
      mutationFn: (reportId: string) => deleteReportTarget(reportId),
      onSuccess: () => {
        invalidateAndClose();
        toast.success(
          t("reports.feedback.targetDeleted", "대상이 삭제되었습니다."),
        );
      },
      onError: () =>
        toast.error(t("common.feedback.failed", "처리에 실패했습니다.")),
    });

  const openReportDetail = useCallback((report: AdminReportListItem) => {
    setSelectedReportId(report.id);
    setIsDetailOpen(true);
  }, []);

  const columns = useReportColumns({
    onViewDetail: openReportDetail,
    onDismiss: mutateDismiss,
    onResolve: mutateResolve,
    onWarn: mutateWarn,
  });

  return (
    <div className="space-y-4">
      <ReportsToolbar
        statusFilter={statusFilter}
        targetTypeFilter={targetTypeFilter}
        viewMode={viewMode}
        onStatusFilterChange={setStatusFilter}
        onTargetTypeFilterChange={setTargetTypeFilter}
        onViewModeChange={setViewMode}
        onExportCSV={() => {
          void handleExportCSV(statusFilter, targetTypeFilter);
        }}
      />

      {isLoading && <LoadingState />}
      {isError && <ErrorState error={error} />}

      {!isLoading && !isError && (
        <>
          {viewMode === "list" ? (
            <DataTable
              columns={columns}
              data={items}
              onRowClick={openReportDetail}
            />
          ) : (
            <ReportsGrid items={items} onViewDetail={openReportDetail} />
          )}

          <PaginationControls
            page={page}
            total={total}
            totalPages={totalPages}
            onPrevious={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        </>
      )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-150">
          <DialogHeader>
            <DialogTitle>{t("reports.detail.title", "신고 상세")}</DialogTitle>
            <DialogDescription>
              {t(
                "reports.detail.description",
                "신고 세부 정보 및 처리 옵션을 확인하세요.",
              )}
            </DialogDescription>
          </DialogHeader>

          {(isDetailLoading || isReportersLoading) && <DialogLoadingState />}
          {!isDetailLoading && reportDetail && (
            <ReportDetailContent
              detail={reportDetail}
              reporters={reporters ?? []}
              isActionPending={
                isDismissing || isResolving || isWarning || isDeletingTarget
              }
              onDismiss={() => mutateDismiss(reportDetail.id)}
              onResolve={() => mutateResolve(reportDetail.id)}
              onWarn={() => mutateWarn(reportDetail.id)}
              onDeleteTarget={() => mutateDeleteTarget(reportDetail.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  async function handleExportCSV(status: string, targetType: string) {
    try {
      const blob = await exportReportsCSV({
        ...(status !== "ALL" ? { status } : {}),
        ...(targetType !== "ALL" ? { targetType } : {}),
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reports.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast.error(
        t("reports.feedback.exportError", "CSV 다운로드에 실패했습니다."),
      );
    }
  }
}

function ReportsToolbar({
  statusFilter,
  targetTypeFilter,
  viewMode,
  onStatusFilterChange,
  onTargetTypeFilterChange,
  onViewModeChange,
  onExportCSV,
}: {
  statusFilter: string;
  targetTypeFilter: string;
  viewMode: "list" | "grid";
  onStatusFilterChange: (value: string) => void;
  onTargetTypeFilterChange: (value: string) => void;
  onViewModeChange: (value: "list" | "grid") => void;
  onExportCSV: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-9 w-35">
            <SelectValue placeholder={t("reports.filter.status", "상태")} />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={targetTypeFilter}
          onValueChange={onTargetTypeFilterChange}
        >
          <SelectTrigger className="h-9 w-45">
            <SelectValue
              placeholder={t("reports.filter.targetType", "대상 유형")}
            />
          </SelectTrigger>
          <SelectContent>
            {TARGET_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={onExportCSV}
        >
          <Download className="h-4 w-4" />
          {t("reports.exportCsv", {
            defaultValue: t("common.actions.exportCsv", "CSV"),
          })}
        </Button>

        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value: string) =>
            value && onViewModeChange(value as "list" | "grid")
          }
          className="rounded-md border bg-card"
        >
          <ToggleGroupItem
            value="list"
            aria-label={t("common.view.list", "리스트")}
          >
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="grid"
            aria-label={t("common.view.grid", "그리드")}
          >
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}

function PaginationControls({
  page,
  total,
  totalPages,
  onPrevious,
  onNext,
}: {
  page: number;
  total: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-2 py-2">
      <span className="text-sm text-muted-foreground">
        총 {total}건 &middot; {page} / {totalPages} 페이지
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
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
          onClick={onNext}
          disabled={page >= totalPages}
        >
          {t("common.actions.next", "다음")}
        </Button>
      </div>
    </div>
  );
}

function LoadingState() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center rounded-xl border bg-card py-16">
      <span className="animate-pulse text-muted-foreground">
        {t("common.loading", "로딩 중...")}
      </span>
    </div>
  );
}

function DialogLoadingState() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center py-16">
      <span className="animate-pulse text-muted-foreground">
        {t("common.loading", "로딩 중...")}
      </span>
    </div>
  );
}

function ErrorState({ error }: { error: unknown }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
      {error instanceof Error
        ? error.message
        : t("common.error.generic", "데이터를 불러오는 데 실패했습니다.")}
    </div>
  );
}
