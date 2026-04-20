import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, LayoutGrid, List, MoreHorizontal, ShieldAlert, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { REPORT_STATUS, type ReportStatus } from "@/shared/config/constants";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
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

interface Report {
  id: string;
  targetType: "Notice" | "Post" | "Comment";
  reason: string;
  reporterCount: number;
  status: ReportStatus;
  lastReportedAt: string;
}

interface Reporter {
  name: string;
  comment: string;
  autoFlagged: boolean;
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

const mockReporters: Record<string, Reporter[]> = {
  R001: [
    { name: "User132", comment: "Duplicated listing", autoFlagged: false },
    { name: "User154", comment: "Looks like promotion", autoFlagged: true },
    { name: "User177", comment: "Contains misleading details", autoFlagged: false },
  ],
  R002: [
    { name: "User241", comment: "Harassing language", autoFlagged: false },
    { name: "User255", comment: "Repeated personal attacks", autoFlagged: true },
    { name: "User266", comment: "Need moderator review", autoFlagged: false },
    { name: "User289", comment: "Offensive terms", autoFlagged: false },
    { name: "User301", comment: "Escalate urgently", autoFlagged: true },
  ],
  R003: [
    { name: "User409", comment: "Graphic media", autoFlagged: true },
    { name: "User415", comment: "Policy violation", autoFlagged: false },
  ],
};

export function ReportsTableSection() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReportersOpen, setIsReportersOpen] = useState(false);

  const openReporters = (report: Report) => {
    setSelectedReport(report);
    setIsReportersOpen(true);
  };

  const columns = useMemo<ColumnDef<Report>[]>(
    () => [
      { accessorKey: "targetType", header: t("reports.table.targetType"), cell: ({ row }) => <span className="font-medium">{String(row.getValue("targetType"))}</span> },
      { accessorKey: "reason", header: t("reports.table.primaryReason") },
      {
        accessorKey: "reporterCount",
        header: t("reports.table.reports"),
        cell: ({ row }) => {
          const count = row.getValue("reporterCount") as number;
          const countVariant = count >= 10 ? "destructive" : count >= 5 ? "warning" : "secondary";
          return (
            <div className="flex items-center gap-2">
              <Badge variant={countVariant}>{count}</Badge>
              {count >= 10 && <Badge variant="destructive" className="px-1 text-[10px]">{t("reports.badges.priority")}</Badge>}
              {count >= 5 && count < 10 && <Badge variant="outline" className="px-1 text-[10px]">{t("reports.badges.autoHidden")}</Badge>}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("reports.table.status"),
        cell: ({ row }) => {
          const status = row.getValue("status") as ReportStatus;
          const variant = status === REPORT_STATUS.PENDING ? "destructive" : status === REPORT_STATUS.REVIEWING ? "warning" : status === REPORT_STATUS.RESOLVED ? "default" : "secondary";
          return <Badge variant={variant}>{t(REPORT_STATUS_LABEL_KEY[status])}</Badge>;
        },
      },
      { accessorKey: "lastReportedAt", header: t("reports.table.lastReported") },
      {
        id: "actions",
        cell: ({ row }) => {
          const report = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={(event) => event.stopPropagation()}>
                  <span className="sr-only">{t("reports.table.openMenu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                <DropdownMenuLabel>{t("reports.menu.actions")}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.info(t("reports.feedback.openTarget"))}>{t("reports.menu.viewTarget")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => openReporters(report)}>{t("reports.menu.reviewReporters")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                {report.status === REPORT_STATUS.PENDING && (
                  <>
                    <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onClick={() => toast.warning(t("reports.feedback.deleteWarn"))}>
                      {t("reports.menu.deleteWarn")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success(t("reports.feedback.dismissed"))}>{t("reports.menu.dismiss")}</DropdownMenuItem>
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

  const selectedReporters = selectedReport ? (mockReporters[selectedReport.id] ?? []) : [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ToggleGroup type="single" value={viewMode} onValueChange={(value: string) => value && setViewMode(value as "list" | "grid")} className="rounded-md border bg-card">
          <ToggleGroupItem value="list" aria-label={t("common.view.list")}><List className="h-4 w-4" /></ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label={t("common.view.grid")}><LayoutGrid className="h-4 w-4" /></ToggleGroupItem>
        </ToggleGroup>
      </div>

      {viewMode === "list" ? (
        <DataTable columns={columns} data={mockReports} onRowClick={openReporters} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockReports.map((report) => (
            <Card key={report.id} className="cursor-pointer transition-all hover:-translate-y-1 hover:border-destructive/50 hover:shadow-md" onClick={() => openReporters(report)}>
              <CardHeader className="border-b bg-muted/10 py-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Badge variant="outline">{report.targetType}</Badge>
                  <Badge variant="warning">{t("reports.flagsCount", { count: report.reporterCount })}</Badge>
                </div>
                <div className="line-clamp-2 text-sm font-semibold">{report.reason}</div>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-medium"><AlertTriangle className="h-3 w-3" />{t(REPORT_STATUS_LABEL_KEY[report.status])}</span>
                <span>{report.lastReportedAt}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isReportersOpen} onOpenChange={setIsReportersOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("reports.reporters.title")}</DialogTitle>
            <DialogDescription>{t("reports.reporters.description", { targetType: selectedReport?.targetType ?? "-" })}</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between rounded-lg border bg-muted p-3">
                <div className="flex items-center gap-2 text-sm font-medium"><AlertTriangle className="h-4 w-4 text-warning" />{t("reports.reporters.primaryReason")}</div>
                <Badge variant="outline">{selectedReport.reason}</Badge>
              </div>
              <div className="space-y-3">
                <h4 className="flex items-center gap-1 text-sm font-semibold"><Users className="h-4 w-4" />{t("reports.reporters.listTitle", { count: selectedReport.reporterCount })}</h4>
                <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-2">
                  {selectedReporters.map((reporter) => (
                    <div key={reporter.name} className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{reporter.name}</span>
                        <span className="mr-2 text-xs text-muted-foreground">{reporter.comment}</span>
                      </div>
                      {reporter.autoFlagged && <Badge variant="destructive" className="h-5 px-1"><ShieldAlert className="mr-1 h-3 w-3" />{t("reports.badges.autoFlagged")}</Badge>}
                    </div>
                  ))}
                  {selectedReport.reporterCount > selectedReporters.length && (
                    <p className="py-2 text-center text-xs text-muted-foreground">{t("reports.reporters.more", { count: selectedReport.reporterCount - selectedReporters.length })}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
