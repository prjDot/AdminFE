import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Users, AlertTriangle, ShieldAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
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
  
  // Dialog State
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReportersOpen, setIsReportersOpen] = useState(false);

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
                <DropdownMenuItem onClick={() => toast.info("Opening reported target")}>{t("reports.menu.viewTarget")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSelectedReport(report);
                  setIsReportersOpen(true);
                }}>
                  {t("reports.menu.reviewReporters")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {report.status === REPORT_STATUS.PENDING && (
                  <>
                    <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onClick={() => toast.error("Target deleted and user warned")}>{t("reports.menu.deleteWarn")}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success("Report dismissed")}>{t("reports.menu.dismiss")}</DropdownMenuItem>
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

      {/* Review Reporters Dialog */}
      <Dialog open={isReportersOpen} onOpenChange={setIsReportersOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reporter Details</DialogTitle>
            <DialogDescription>
              Review the users who submitted reports against this {selectedReport?.targetType}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg border">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Primary Reason
                </div>
                <Badge variant="outline">{selectedReport.reason}</Badge>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-1">
                  <Users className="h-4 w-4" /> Reports ({selectedReport.reporterCount})
                </h4>
                
                <div className="max-h-64 overflow-y-auto space-y-2 border rounded-md p-2">
                  {/* Mock Reporter List based on count */}
                  {Array.from({ length: Math.min(selectedReport.reporterCount, 5) }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">User{Math.floor(Math.random() * 900) + 100}</span>
                        <span className="text-xs text-muted-foreground mr-2">"{selectedReport.reason} - Very offensive"</span>
                      </div>
                      {i === 1 && <Badge variant="destructive" className="h-5 px-1"><ShieldAlert className="h-3 w-3 mr-1"/> Auto-flagged</Badge>}
                    </div>
                  ))}
                  {selectedReport.reporterCount > 5 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      ...and {selectedReport.reporterCount - 5} more users
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsReportersOpen(false)}>Close</Button>
                <Button variant="default" onClick={() => {
                  toast.success("All reports marked as reviewed.");
                  setIsReportersOpen(false);
                }}>Mark as Reviewed</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
