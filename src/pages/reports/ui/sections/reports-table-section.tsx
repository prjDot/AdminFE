import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { REPORT_STATUS, type ReportStatus } from "@/shared/config/constants";

interface Report {
  id: string;
  targetType: "Notice" | "Post" | "Comment";
  reason: string;
  reporterCount: number;
  status: ReportStatus;
  lastReportedAt: string;
}

const REPORT_STATUS_LABEL_KEY: Record<ReportStatus, string> = {
  [REPORT_STATUS.PENDING]: "reports.status.pending",
  [REPORT_STATUS.REVIEWING]: "reports.status.reviewing",
  [REPORT_STATUS.RESOLVED]: "reports.status.resolved",
  [REPORT_STATUS.REJECTED]: "reports.status.rejected",
};

const mockReports: Report[] = [
  { id: "R001", targetType: "Notice", reason: "Spam or misleading", reporterCount: 3, status: REPORT_STATUS.PENDING, lastReportedAt: "2026-04-15" },
  { id: "R002", targetType: "Comment", reason: "Harassment", reporterCount: 12, status: REPORT_STATUS.REVIEWING, lastReportedAt: "2026-04-14" },
  { id: "R003", targetType: "Post", reason: "Inappropriate content", reporterCount: 6, status: REPORT_STATUS.RESOLVED, lastReportedAt: "2026-04-12" },
];

export function ReportsTableSection() {
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<Report>[]>(
    () => [
      {
        accessorKey: "targetType",
        header: t("reports.table.targetType"),
        cell: ({ row }) => <span className="font-medium">{row.getValue("targetType")}</span>,
      },
      {
        accessorKey: "reason",
        header: t("reports.table.primaryReason"),
      },
      {
        accessorKey: "reporterCount",
        header: t("reports.table.reports"),
        cell: ({ row }) => {
          const count = row.getValue("reporterCount") as number;
          return (
            <div className="flex items-center gap-2">
              <Badge
                variant={count >= 10 ? "destructive" : "secondary"}
                className={count >= 5 && count < 10 ? "bg-amber-500 text-white hover:bg-amber-600" : ""}
              >
                {count}
              </Badge>
              {count >= 10 && (
                <Badge variant="destructive" className="px-1 text-[10px]">
                  {t("reports.badges.priority")}
                </Badge>
              )}
              {count >= 5 && count < 10 && (
                <Badge variant="outline" className="px-1 text-[10px]">
                  {t("reports.badges.autoHidden")}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("reports.table.status"),
        cell: ({ row }) => {
          const status = row.getValue("status") as ReportStatus;
          const variant =
            status === REPORT_STATUS.PENDING ? "destructive" :
            status === REPORT_STATUS.REVIEWING ? "warning" :
            status === REPORT_STATUS.RESOLVED ? "default" : "secondary";

          return <Badge variant={variant}>{t(REPORT_STATUS_LABEL_KEY[status])}</Badge>;
        },
      },
      {
        accessorKey: "lastReportedAt",
        header: t("reports.table.lastReported"),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const report = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t("reports.table.openMenu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("reports.menu.actions")}</DropdownMenuLabel>
                <DropdownMenuItem>{t("reports.menu.viewTarget")}</DropdownMenuItem>
                <DropdownMenuItem>{t("reports.menu.reviewReporters")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                {report.status === REPORT_STATUS.PENDING && (
                  <>
                    <DropdownMenuItem className="text-destructive">{t("reports.menu.deleteWarn")}</DropdownMenuItem>
                    <DropdownMenuItem>{t("reports.menu.dismiss")}</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t]
  );

  return (
    <div className="bg-card rounded-xl">
      <DataTable columns={columns} data={mockReports} />
    </div>
  );
}
