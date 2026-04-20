import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Calendar,
  Filter,
  LayoutGrid,
  List,
  Mail,
  MoreHorizontal,
  Search,
  ShieldAlert,
  User as UserIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { DataTable } from "@/widgets/data-table/ui/data-table";

type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  createdAt: string;
}

const USER_STATUS_LABEL_KEY: Record<UserStatus, string> = {
  ACTIVE: "common.status.active",
  INACTIVE: "common.status.inactive",
  SUSPENDED: "common.status.suspended",
};

const mockUsers: User[] = [
  { id: "U001", name: "Alice Smith", email: "alice@example.com", role: "User", status: "ACTIVE", createdAt: "2026-01-10" },
  { id: "U002", name: "Bob Jones", email: "bob@example.com", role: "User", status: "SUSPENDED", createdAt: "2026-02-15" },
  { id: "U003", name: "Charlie Brown", email: "charlie@example.com", role: "Community Manager", status: "ACTIVE", createdAt: "2026-03-01" },
  { id: "U004", name: "Diana Prince", email: "diana@example.com", role: "User", status: "INACTIVE", createdAt: "2026-03-20" },
  { id: "U005", name: "Evan Wright", email: "evan@example.com", role: "User", status: "ACTIVE", createdAt: "2026-03-25" },
  { id: "U006", name: "Fiona Gallagher", email: "fiona@example.com", role: "Moderator", status: "ACTIVE", createdAt: "2026-04-02" },
];

export function UsersTableSection() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const openUserProfile = (user: User) => {
    setSelectedUser(user);
    setIsProfileOpen(true);
  };

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      { accessorKey: "name", header: t("users.table.name"), cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div> },
      { accessorKey: "email", header: t("users.table.email") },
      { accessorKey: "role", header: t("users.table.role"), cell: ({ row }) => <Badge variant="outline">{String(row.getValue("role"))}</Badge> },
      {
        accessorKey: "status",
        header: t("users.table.status"),
        cell: ({ row }) => {
          const status = row.getValue("status") as UserStatus;
          const variant = status === "ACTIVE" ? "default" : status === "SUSPENDED" ? "destructive" : "secondary";
          return <Badge variant={variant}>{t(USER_STATUS_LABEL_KEY[status])}</Badge>;
        },
      },
      { accessorKey: "createdAt", header: t("users.table.joined") },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={(event) => event.stopPropagation()}>
                  <span className="sr-only">{t("users.table.openMenu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                <DropdownMenuLabel>{t("users.menu.actions")}</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    void navigator.clipboard.writeText(user.id);
                    toast.success(t("users.feedback.copiedUserId"));
                  }}
                >
                  {t("users.menu.copyUserId")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openUserProfile(user)}>{t("users.menu.viewProfile")}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(t("users.feedback.changeRoleQueued", { name: user.name }))}>
                  {t("users.menu.changeRole")}
                </DropdownMenuItem>
                {user.status === "SUSPENDED" ? (
                  <DropdownMenuItem onClick={() => toast.success(t("users.feedback.unsuspended", { name: user.name }))}>
                    {t("users.menu.unsuspend")}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                    onClick={() => toast.warning(t("users.feedback.suspended", { name: user.name }))}
                  >
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
            placeholder={t("users.searchPlaceholder")}
            className="bg-card pl-9"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-card">
              <SelectValue placeholder={t("users.filters.allStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("users.filters.allStatus")}</SelectItem>
              <SelectItem value="ACTIVE">{t("common.status.active")}</SelectItem>
              <SelectItem value="INACTIVE">{t("common.status.inactive")}</SelectItem>
              <SelectItem value="SUSPENDED">{t("common.status.suspended")}</SelectItem>
            </SelectContent>
          </Select>
          <ToggleGroup type="single" value={viewMode} onValueChange={(value: string) => value && setViewMode(value as "list" | "grid")} className="ml-2 rounded-md border bg-card">
            <ToggleGroupItem value="list" aria-label={t("common.view.list")}>
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label={t("common.view.grid")}>
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {viewMode === "list" ? (
        <DataTable columns={columns} data={filteredUsers} onRowClick={openUserProfile} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Card key={user.id} className="cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md" onClick={() => openUserProfile(user)}>
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-2">
                      <UserIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="w-32 truncate font-semibold">{user.name}</div>
                  </div>
                  <Badge variant={user.status === "ACTIVE" ? "default" : user.status === "SUSPENDED" ? "destructive" : "secondary"}>
                    {t(USER_STATUS_LABEL_KEY[user.status])}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-2 pt-4 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{t("users.table.email")}</span>
                    <span className="w-32 truncate text-right">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1"><ShieldAlert className="h-3 w-3" />{t("users.table.role")}</span>
                    <Badge variant="outline" className="font-normal">{user.role}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full rounded-xl border bg-card py-12 text-center text-muted-foreground">{t("table.noResults")}</div>
          )}
        </div>
      )}

      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t("users.profile.title")}</SheetTitle>
            <SheetDescription>{t("users.profile.description")}</SheetDescription>
          </SheetHeader>
          {selectedUser && (
            <div className="space-y-6 py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <UserIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <Badge variant={selectedUser.status === "ACTIVE" ? "default" : "destructive"} className="mt-1">{t(USER_STATUS_LABEL_KEY[selectedUser.status])}</Badge>
                </div>
              </div>
              <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-3 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{selectedUser.email}</div>
                <div className="flex items-center gap-3 text-sm"><ShieldAlert className="h-4 w-4 text-muted-foreground" />{selectedUser.role}</div>
                <div className="flex items-center gap-3 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" />{t("users.profile.joinedAt", { date: selectedUser.createdAt })}</div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
