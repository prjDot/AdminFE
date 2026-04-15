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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive" | "Suspended";
  createdAt: string;
}

const mockUsers: User[] = [
  { id: "1", name: "Alice Smith", email: "alice@example.com", role: "User", status: "Active", createdAt: "2026-01-10" },
  { id: "2", name: "Bob Jones", email: "bob@example.com", role: "User", status: "Suspended", createdAt: "2026-02-15" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", role: "Community Manager", status: "Active", createdAt: "2026-03-01" },
  { id: "4", name: "Diana Prince", email: "diana@example.com", role: "User", status: "Inactive", createdAt: "2026-03-20" },
];

export function UsersTableSection() {
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("users.table.name"),
      },
      {
        accessorKey: "email",
        header: t("users.table.email"),
      },
      {
        accessorKey: "role",
        header: t("users.table.role"),
      },
      {
        accessorKey: "status",
        header: t("users.table.status"),
        cell: ({ row }) => {
          const status = row.getValue("status") as User["status"];
          const variant =
            status === "Active" ? "default" :
            status === "Suspended" ? "destructive" : "secondary";

          const statusLabel =
            status === "Active"
              ? t("common.status.active")
              : status === "Suspended"
                ? t("common.status.suspended")
                : t("common.status.inactive");

          return <Badge variant={variant}>{statusLabel}</Badge>;
        },
      },
      {
        accessorKey: "createdAt",
        header: t("users.table.joined"),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t("users.table.openMenu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("users.menu.actions")}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                  {t("users.menu.copyUserId")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>{t("users.menu.viewProfile")}</DropdownMenuItem>
                <DropdownMenuItem>{t("users.menu.changeRole")}</DropdownMenuItem>
                {user.status === "Suspended" ? (
                  <DropdownMenuItem>{t("users.menu.unsuspend")}</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="text-destructive">{t("users.menu.suspend")}</DropdownMenuItem>
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
      <DataTable columns={columns} data={mockUsers} />
    </div>
  );
}
