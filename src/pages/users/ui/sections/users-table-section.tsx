import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Search, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { toast } from "sonner";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("users.table.name"),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "email",
        header: t("users.table.email"),
      },
      {
        accessorKey: "role",
        header: t("users.table.role"),
        cell: ({ row }) => {
          const role = row.getValue("role") as string;
          return <Badge variant="outline">{role}</Badge>;
        }
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
                <DropdownMenuItem onClick={() => {
                  navigator.clipboard.writeText(user.id);
                  toast.success("User ID copied to clipboard");
                }}>
                  {t("users.menu.copyUserId")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info(`Viewing profile for ${user.name}`)}>
                  {t("users.menu.viewProfile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Change role action for ${user.name}`)}>
                  {t("users.menu.changeRole")}
                </DropdownMenuItem>
                {user.status === "Suspended" ? (
                  <DropdownMenuItem onClick={() => toast.success(`${user.name} unsuspended`)}>
                    {t("users.menu.unsuspend")}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onClick={() => toast.error(`${user.name} suspended`)}>
                    {t("users.menu.suspend")}
                  </DropdownMenuItem>
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            className="pl-9 bg-card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-card">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
        <DataTable columns={columns} data={filteredUsers} />
      </div>
    </div>
  );
}
