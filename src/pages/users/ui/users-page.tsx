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

export function UsersPage() {
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "role",
        header: "Role",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          const variant = 
            status === "Active" ? "default" : 
            status === "Suspended" ? "destructive" : "secondary";
          
          return <Badge variant={variant}>{status}</Badge>;
        },
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original;

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
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                  Copy User ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Change Role</DropdownMenuItem>
                {user.status === "Suspended" ? (
                  <DropdownMenuItem>Unsuspend Account</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="text-destructive">Suspend Account</DropdownMenuItem>
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
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage user accounts, roles, and restrictions.
          </p>
        </div>
        <Button>Invite Admin</Button>
      </div>

      <div className="bg-card rounded-xl">
        <DataTable columns={columns} data={mockUsers} />
      </div>
    </div>
  );
}
