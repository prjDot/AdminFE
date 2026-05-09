import { Mail, ShieldAlert, User as UserIcon } from "lucide-react";
import { type AdminUserListItem } from "@/features/users/api/users-api";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { getStatusVariant } from "./user-table-utils";

interface UsersGridProps {
  items: AdminUserListItem[];
  onUserClick: (user: AdminUserListItem) => void;
  statusLabel: (status: string) => string;
  emptyLabel: string;
  emailLabel: string;
  roleLabel: string;
}

export function UsersGrid({
  items,
  onUserClick,
  statusLabel,
  emptyLabel,
  emailLabel,
  roleLabel,
}: UsersGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card py-12 text-center text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((user) => (
        <Card
          key={user.id}
          className="cursor-pointer transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-md"
          onClick={() => onUserClick(user)}
        >
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-2">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-2">
                <UserIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="w-32 truncate font-semibold">{user.name}</div>
            </div>
            <Badge variant={getStatusVariant(user.status)}>
              {statusLabel(user.status)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 pt-4 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {emailLabel}
              </span>
              <span className="w-32 truncate text-right">{user.email}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                {roleLabel}
              </span>
              <Badge
                variant="outline"
                className="max-w-[150px] truncate font-normal"
              >
                {user.role}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
