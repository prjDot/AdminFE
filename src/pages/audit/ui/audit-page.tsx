import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { History, LayoutGrid, List, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { toast } from "sonner";
import { fetchAuditLogs, type AdminAuditLog } from "@/features/audit/api/audit-api";
import { queryKeys } from "@/shared/api/query-keys";

interface AuditLogRow {
  id: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
  ipAddress: string;
}

function toAuditRow(log: AdminAuditLog): AuditLogRow {
  return {
    id: log.id,
    adminName: log.adminName ?? log.adminEmail ?? "-",
    action: log.action,
    target: [log.targetType, log.targetId].filter(Boolean).join(" #") || "-",
    timestamp: log.createdAt ?? log.timestamp ?? "-",
    ipAddress: log.ipAddress ?? "-",
  };
}

export function AuditPage() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.audit.list({ page: 1, pageSize: 100 }),
    queryFn: () => fetchAuditLogs({ page: 1, pageSize: 100 }),
  });
  const logs = useMemo(() => data?.items.map(toAuditRow) ?? [], [data]);

  const handleRowClick = (log: AuditLogRow) => {
    toast.info(`${log.id} · ${log.adminName}`);
  };

  const columns = useMemo<ColumnDef<AuditLogRow>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: t("audit.table.timestamp"),
        cell: ({ row }) => <span className="text-muted-foreground whitespace-nowrap">{row.getValue("timestamp")}</span>,
      },
      {
        accessorKey: "adminName",
        header: t("audit.table.adminUser"),
        cell: ({ row }) => <span className="font-medium">{row.getValue("adminName")}</span>,
      },
      {
        accessorKey: "action",
        header: t("audit.table.action"),
        cell: ({ row }) => {
          const action = row.getValue("action") as string;
          const isDestructive = action.includes("Delete") || action.includes("Suspend") || action.includes("Hidden");
          return <Badge variant={isDestructive ? "destructive" : "secondary"}>{action}</Badge>;
        },
      },
      {
        accessorKey: "target",
        header: t("audit.table.targetEntity"),
      },
      {
        accessorKey: "ipAddress",
        header: t("audit.table.ipAddress"),
        cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("ipAddress")}</span>,
      },
    ],
    [t]
  );

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("audit.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("audit.description")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-muted rounded-full">
            <History className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="flex justify-end p-2 border-b">
        <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as "list" | "grid")} className="bg-card border rounded-md">
          <ToggleGroupItem value="list" aria-label="List View">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Grid View">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isLoading ? (
        <div className="rounded-md border bg-card p-8 text-center text-muted-foreground">{t("common.loading")}</div>
      ) : isError ? (
        <button type="button" className="rounded-md border bg-card p-8 text-center text-destructive" onClick={() => refetch()}>
          {t("common.errors.failed")}
        </button>
      ) : viewMode === "list" ? (
        <DataTable columns={columns} data={logs} onRowClick={handleRowClick} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {logs.map((log) => (
            <Card key={log.id} className="cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md hover:border-primary/50" onClick={() => handleRowClick(log)}>
              <CardHeader className="py-3 bg-muted/10 border-b flex-row justify-between items-center sm:space-y-0">
                <span className="text-[10px] font-mono text-muted-foreground">{log.id}</span>
                <Badge variant={log.action.includes("Delete") || log.action.includes("Suspend") || log.action.includes("Hidden") ? "destructive" : "secondary"}>
                  {log.action}
                </Badge>
              </CardHeader>
              <CardContent className="pt-3 text-xs space-y-2">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="font-medium text-foreground">{log.adminName}</span>
                  <span>{log.timestamp}</span>
                </div>
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded-md border text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono"><FileText className="h-3 w-3"/> {log.target}</span>
                  <span className="font-mono">{log.ipAddress}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
