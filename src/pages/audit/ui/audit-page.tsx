import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { History } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
  ipAddress: string;
}

const mockLogs: AuditLog[] = [
  { id: "A1029", adminName: "Super Admin", action: "Deleted Post", target: "Post #P001", timestamp: "2026-04-15 14:22:30", ipAddress: "192.168.1.5" },
  { id: "A1028", adminName: "Super Admin", action: "Updated Settings", target: "System Config", timestamp: "2026-04-15 10:15:00", ipAddress: "192.168.1.5" },
  { id: "A1027", adminName: "Jane Doe (Report Mgr)", action: "Suspended User", target: "User #U884", timestamp: "2026-04-14 16:45:12", ipAddress: "10.0.0.42" },
  { id: "A1026", adminName: "Jane Doe (Report Mgr)", action: "Hidden Notice", target: "Notice #N004", timestamp: "2026-04-14 16:40:05", ipAddress: "10.0.0.42" },
];

export function AuditPage() {
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<AuditLog>[]>(
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("audit.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("audit.description")}
          </p>
        </div>
        <div className="p-3 bg-muted rounded-full">
          <History className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>

      <div className="bg-card rounded-xl">
        <DataTable columns={columns} data={mockLogs} />
      </div>
    </div>
  );
}
