import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { MoreHorizontal } from "lucide-react";
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
  const columns = useMemo<ColumnDef<Report>[]>(
    () => [
      {
        accessorKey: "targetType",
        header: "Target Type",
        cell: ({ row }) => <span className="font-medium">{row.getValue("targetType")}</span>,
      },
      {
        accessorKey: "reason",
        header: "Primary Reason",
      },
      {
        accessorKey: "reporterCount",
        header: "Reports",
        cell: ({ row }) => {
          const count = row.getValue("reporterCount") as number;
          return <Badge variant={count > 3 ? "destructive" : "secondary"}>{count}</Badge>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const variant = 
            status === "Pending" ? "destructive" : 
            status === "Action Taken" ? "default" : "secondary";
          
          return <Badge variant={variant}>{status}</Badge>;
        },
      },
      {
        accessorKey: "lastReportedAt",
        header: "Last Reported",
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const report = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>View Target Item</DropdownMenuItem>
                <DropdownMenuItem>Review Reporters</DropdownMenuItem>
                <DropdownMenuSeparator />
                {report.status === "Pending" && (
                  <>
                    <DropdownMenuItem className="text-destructive">Delete Target & Warn</DropdownMenuItem>
                    <DropdownMenuItem>Dismiss Report</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports Management</h1>
          <p className="text-muted-foreground mt-2">
            Review user-reported content and take necessary actions.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl">
        <DataTable columns={columns} data={mockReports} />
      </div>
    </div>
  );
}
