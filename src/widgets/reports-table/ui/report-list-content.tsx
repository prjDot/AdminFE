import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type AdminReportListItem } from "@/features/reports/api/reports-api";
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
import {
  formatDate,
  getReportStatusLabelKey,
  getStatusVariant,
  isReportActionable,
} from "./report-table-utils";

export function useReportColumns({
  onViewDetail,
  onDismiss,
  onResolve,
  onWarn,
}: {
  onViewDetail: (report: AdminReportListItem) => void;
  onDismiss: (reportId: string) => void;
  onResolve: (reportId: string) => void;
  onWarn: (reportId: string) => void;
}) {
  const { t } = useTranslation();

  return useMemo<ColumnDef<AdminReportListItem>[]>(
    () => [
      {
        accessorKey: "targetType",
        header: t("reports.table.targetType", "대상 유형"),
        cell: ({ row }) => (
          <span className="font-medium">
            {String(row.getValue("targetType"))}
          </span>
        ),
      },
      {
        accessorKey: "reason",
        header: t("reports.table.primaryReason", "신고 사유"),
      },
      {
        accessorKey: "reporterCount",
        header: t("reports.table.reports", "신고 수"),
        cell: ({ row }) => (
          <ReportCountBadges count={row.getValue("reporterCount") as number} />
        ),
      },
      {
        accessorKey: "status",
        header: t("reports.table.status", "상태"),
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge variant={getStatusVariant(status)}>
              {t(getReportStatusLabelKey(status), status)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "lastReportedAt",
        header: t("reports.table.lastReported", "마지막 신고"),
        cell: ({ row }) => formatDate(row.getValue("lastReportedAt") as string),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const report = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sr-only">
                    {t("reports.table.openMenu", "메뉴 열기")}
                  </span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuLabel>
                  {t("reports.menu.actions", "작업")}
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onViewDetail(report)}>
                  {t("reports.menu.viewDetails", "상세 보기")}
                </DropdownMenuItem>
                {isReportActionable(report.status) && (
                  <>
                    <DropdownMenuSeparator />
                    <ConfirmAction
                      title={t("reports.confirm.dismissTitle", "신고 기각")}
                      description={t(
                        "reports.confirm.dismissDescription",
                        "이 신고를 기각 처리하시겠습니까?",
                      )}
                      confirmLabel={t("reports.menu.dismiss", "기각")}
                      cancelLabel={t("common.actions.cancel", "취소")}
                      onConfirm={() => onDismiss(report.id)}
                    >
                      <DropdownMenuItem
                        onSelect={(event) => event.preventDefault()}
                      >
                        {t("reports.menu.dismiss", "기각")}
                      </DropdownMenuItem>
                    </ConfirmAction>
                    <ConfirmAction
                      title={t("reports.confirm.resolveTitle", "신고 해결")}
                      description={t(
                        "reports.confirm.resolveDescription",
                        "이 신고를 해결 처리하시겠습니까?",
                      )}
                      confirmLabel={t("reports.menu.resolve", "해결")}
                      cancelLabel={t("common.actions.cancel", "취소")}
                      onConfirm={() => onResolve(report.id)}
                    >
                      <DropdownMenuItem
                        onSelect={(event) => event.preventDefault()}
                      >
                        {t("reports.menu.resolve", "해결")}
                      </DropdownMenuItem>
                    </ConfirmAction>
                    <ConfirmAction
                      title={t("reports.confirm.warnTitle", "사용자 경고")}
                      description={t(
                        "reports.confirm.warnDescription",
                        "신고 대상 사용자에게 경고 처리를 진행하시겠습니까?",
                      )}
                      confirmLabel={t("reports.menu.warn", "경고")}
                      cancelLabel={t("common.actions.cancel", "취소")}
                      onConfirm={() => onWarn(report.id)}
                    >
                      <DropdownMenuItem
                        onSelect={(event) => event.preventDefault()}
                      >
                        {t("reports.menu.warn", "경고")}
                      </DropdownMenuItem>
                    </ConfirmAction>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, onViewDetail, onDismiss, onResolve, onWarn],
  );
}

function ReportCountBadges({ count }: { count: number }) {
  const { t } = useTranslation();
  const countVariant =
    count >= 10 ? "destructive" : count >= 5 ? "warning" : "secondary";

  return (
    <div className="flex items-center gap-2">
      <Badge variant={countVariant}>{count}</Badge>
      {count >= 10 && (
        <Badge variant="destructive" className="px-1 text-[10px]">
          {t("reports.badges.priority", "우선")}
        </Badge>
      )}
      {count >= 5 && count < 10 && (
        <Badge variant="outline" className="px-1 text-[10px]">
          {t("reports.badges.autoHidden", "자동숨김")}
        </Badge>
      )}
    </div>
  );
}

export function ReportsGrid({
  items,
  onViewDetail,
}: {
  items: AdminReportListItem[];
  onViewDetail: (report: AdminReportListItem) => void;
}) {
  const { t } = useTranslation();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card py-12 text-center text-muted-foreground">
        {t("table.noResults", "결과가 없습니다.")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((report) => (
        <ReportGridCard
          key={report.id}
          report={report}
          onClick={onViewDetail}
        />
      ))}
    </div>
  );
}

function ReportGridCard({
  report,
  onClick,
}: {
  report: AdminReportListItem;
  onClick: (report: AdminReportListItem) => void;
}) {
  const { t } = useTranslation();

  return (
    <Card
      className="cursor-pointer transition-all hover:-translate-y-1 hover:border-destructive/50 hover:shadow-md"
      onClick={() => onClick(report)}
    >
      <CardHeader className="border-b bg-muted/10 py-3">
        <div className="mb-2 flex items-start justify-between gap-2">
          <Badge variant="outline">{report.targetType}</Badge>
          <Badge variant={getStatusVariant(report.status)}>
            {t(getReportStatusLabelKey(report.status), report.status)}
          </Badge>
        </div>
        <div className="line-clamp-2 text-sm font-semibold">
          {report.reason}
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 font-medium">
          <AlertTriangle className="h-3 w-3" />
          {t("reports.flagsCount", {
            count: report.reporterCount,
            defaultValue: `신고 ${report.reporterCount}건`,
          })}
        </span>
        <span>{formatDate(report.lastReportedAt)}</span>
      </CardContent>
    </Card>
  );
}
