import { type ReactNode, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryKeys } from "@/shared/api/query-keys";
import { Badge } from "@/shared/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { DropdownMenuItem } from "@/shared/ui/dropdown-menu";
import {
  fetchUserPermissionsStatus,
  type AdminUserListItem,
} from "@/features/users/api/users-api";

interface UserPermissionsActionProps {
  user: AdminUserListItem;
}

export function UserPermissionsAction({ user }: UserPermissionsActionProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.users.permissionsStatus(),
    queryFn: fetchUserPermissionsStatus,
    enabled: open,
    staleTime: 30_000,
  });

  const admin = data?.admins.find((item) => item.userId === user.id);
  const permissions = admin?.permissions ?? [user.role || "USER"];
  const verificationStatus =
    admin?.adminEmailVerificationStatus ??
    (user.role === "ADMIN" ? "PENDING" : "USER");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
          {t("users.menu.viewPermissions")}
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("users.permissions.title")}</DialogTitle>
          <DialogDescription>
            {t("users.permissions.description", { email: user.email })}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <PermissionState>{t("common.loading")}</PermissionState>
        ) : isError ? (
          <PermissionState>{t("users.permissions.failed")}</PermissionState>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <Badge variant={admin ? "success" : "outline"}>
                  {verificationStatus}
                </Badge>
              </div>
              {admin?.adminEmailVerifiedAt && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {t("users.permissions.verifiedAt", {
                    date: new Date(admin.adminEmailVerifiedAt).toLocaleString(
                      "ko-KR",
                    ),
                  })}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                {admin
                  ? t("users.permissions.adminPermissions")
                  : t("users.permissions.userPermission")}
              </p>
              <div className="flex flex-wrap gap-2">
                {permissions.map((permission) => (
                  <Badge
                    key={permission}
                    variant={admin ? "secondary" : "outline"}
                    className="max-w-full break-all"
                  >
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PermissionState({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-28 items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
