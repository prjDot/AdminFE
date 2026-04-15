import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface Report {
  id: string;
  targetType: "Notice" | "Post" | "Comment";
  reason: string;
  reporterCount: number;
  status: "Pending" | "Reviewed" | "Action Taken";
  lastReportedAt: string;
}

const mockReports: Report[] = [
  { id: "R001", targetType: "Notice", reason: "Spam or misleading", reporterCount: 3, status: "Pending", lastReportedAt: "2026-04-15" },
  { id: "R002", targetType: "Comment", reason: "Harassment", reporterCount: 1, status: "Pending", lastReportedAt: "2026-04-14" },
  { id: "R003", targetType: "Post", reason: "Inappropriate content", reporterCount: 5, status: "Action Taken", lastReportedAt: "2026-04-12" },
];

export function ReportsPage() {
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
          return <Badge variant={count > 3 ? "destructive" : "secondary"}>{count}</Badge>;
        },
      },
      {
        accessorKey: "status",
        header: t("reports.table.status"),
        cell: ({ row }) => {
          const status = row.getValue("status") as Report["status"];
          const variant = 
            status === "Pending" ? "destructive" : 
            status === "Action Taken" ? "default" : "secondary";

          const label =
            status === "Pending"
              ? t("common.status.pending")
              : status === "Action Taken"
                ? t("common.status.actionTaken")
                : t("common.status.reviewed");

          return <Badge variant={variant}>{label}</Badge>;
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
                {report.status === "Pending" && (
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
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("reports.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("reports.description")}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl">
        <DataTable columns={columns} data={mockReports} />
      </div>
    </div>
  );
}
