import { type ReactNode, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, ShieldCheck, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { queryKeys } from "@/shared/api/query-keys";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import {
  fetchUserPermissionsStatus,
  fetchUsers,
  promoteUserToAdmin,
  type AdminUserListItem,
} from "@/features/users/api/users-api";

interface AdminPromotionDialogProps {
  triggerLabel: string;
}

export function AdminPromotionDialog({ triggerLabel }: AdminPromotionDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query);

  const userParams = useMemo(
    () => ({
      page: 1,
      pageSize: 10,
      role: "USER",
      sortBy: "createdAt",
      sortOrder: "desc" as const,
      ...(debouncedQuery.trim() ? { query: debouncedQuery.trim() } : {}),
    }),
    [debouncedQuery],
  );

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: queryKeys.users.list(userParams),
    queryFn: () => fetchUsers(userParams),
    enabled: open,
    staleTime: 30_000,
  });

  const { data: adminStatus, isLoading: adminsLoading } = useQuery({
    queryKey: queryKeys.users.permissionsStatus(),
    queryFn: fetchUserPermissionsStatus,
    enabled: open,
    staleTime: 30_000,
  });

  const promoteMutation = useMutation({
    mutationFn: promoteUserToAdmin,
    onSuccess: (result) => {
      toast.success(
        t("users.adminPromotion.success", { email: result.email }),
      );
      setSelectedUserId(null);
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : t("users.adminPromotion.failed"),
      );
    },
  });

  const users = usersData?.items ?? [];
  const selectedUser = users.find((user) => user.id === selectedUserId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 sm:w-auto">
          <UserPlus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[86vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("users.adminPromotion.title")}</DialogTitle>
          <DialogDescription>
            {t("users.adminPromotion.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <section className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={t("users.adminPromotion.searchPlaceholder")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="overflow-hidden rounded-lg border">
              {usersLoading ? (
                <EmptyState>{t("common.loading")}</EmptyState>
              ) : users.length === 0 ? (
                <EmptyState>{t("users.adminPromotion.noCandidates")}</EmptyState>
              ) : (
                <div className="max-h-80 divide-y overflow-y-auto">
                  {users.map((user) => (
                    <CandidateRow
                      key={user.id}
                      selected={user.id === selectedUserId}
                      user={user}
                      onSelect={() => setSelectedUserId(user.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <AdminMetric
                label={t("users.adminPromotion.totalAdmins")}
                value={adminStatus?.summary.totalAdmins ?? 0}
              />
              <AdminMetric
                label={t("users.adminPromotion.activeAdmins")}
                value={adminStatus?.summary.activeAdmins ?? 0}
              />
            </div>
            <div className="rounded-lg border">
              <div className="border-b p-3 text-sm font-medium">
                {t("users.adminPromotion.currentAdmins")}
              </div>
              {adminsLoading ? (
                <EmptyState>{t("common.loading")}</EmptyState>
              ) : (
                <div className="max-h-64 divide-y overflow-y-auto">
                  {(adminStatus?.admins ?? []).map((admin) => (
                    <div key={admin.userId} className="space-y-1 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">
                          {admin.nickname || admin.email}
                        </span>
                        <Badge
                          variant={
                            admin.adminEmailVerificationStatus === "VERIFIED"
                              ? "success"
                              : "warning"
                          }
                        >
                          {admin.adminEmailVerificationStatus}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {admin.email}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedUser
              ? t("users.adminPromotion.selected", {
                  email: selectedUser.email,
                })
              : t("users.adminPromotion.selectRequired")}
          </p>
          <Button
            disabled={!selectedUserId || promoteMutation.isPending}
            onClick={() => selectedUserId && promoteMutation.mutate(selectedUserId)}
          >
            <ShieldCheck className="h-4 w-4" />
            {promoteMutation.isPending
              ? t("common.loading")
              : t("users.adminPromotion.promote")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CandidateRow({
  selected,
  user,
  onSelect,
}: {
  selected: boolean;
  user: AdminUserListItem;
  onSelect: () => void;
}) {
  return (
    <button
      className={`flex w-full items-center justify-between gap-3 p-3 text-left transition-colors hover:bg-muted ${
        selected ? "bg-primary/10" : ""
      }`}
      type="button"
      onClick={onSelect}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      <Badge variant={selected ? "default" : "outline"}>{user.status}</Badge>
    </button>
  );
}

function AdminMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-28 items-center justify-center p-4 text-sm text-muted-foreground">
      {children}
    </div>
  );
}
