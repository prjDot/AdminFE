import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Download,
  Filter,
  LayoutGrid,
  List,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { queryKeys } from "@/shared/api/query-keys";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ConfirmAction } from "@/shared/ui/confirm-action";

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
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import {
  type AdminUserListItem,
  type AdminUserListParams,
  exportUsersCSV,
  fetchUserDetail,
  fetchUsers,
  suspendUser,
  unsuspendUser,
} from "@/features/users/api/users-api";
import { DataTable } from "@/widgets/data-table/ui/data-table";
import { UserDetailSheet } from "./user-detail-sheet";
import { UserPermissionsAction } from "./user-permissions-action";
import { UsersGrid } from "./users-grid";
import { getStatusVariant, isUserSuspended } from "./user-table-utils";

const PAGE_SIZE = 20;

export function UsersTableSection() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  const queryParams = useMemo<AdminUserListParams>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(debouncedSearchTerm.trim() ? { query: debouncedSearchTerm.trim() } : {}),
      ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
    }),
    [page, debouncedSearchTerm, statusFilter],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.users.list(queryParams),
    queryFn: () => fetchUsers(queryParams),
    staleTime: 30_000,
  });

  const { data: userDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: queryKeys.users.detail(selectedUserId ?? ""),
    queryFn: () => fetchUserDetail(selectedUserId!),
    enabled: !!selectedUserId,
    staleTime: 2 * 60_000,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const { mutate: mutateSuspend } = useMutation({
    mutationFn: (userId: string) => suspendUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const { mutate: mutateUnsuspend } = useMutation({
    mutationFn: (userId: string) => unsuspendUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const openUserProfile = useCallback((user: AdminUserListItem) => {
    setSelectedUserId(user.id);
    setIsProfileOpen(true);
  }, []);

  const handleExportCSV = async () => {
    try {
      const blob = await exportUsersCSV({
        ...(debouncedSearchTerm.trim() ? { query: debouncedSearchTerm.trim() } : {}),
        ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast.error(
        t("users.feedback.exportError", "CSV 다운로드에 실패했습니다."),
      );
    }
  };

  const handleSuspend = useCallback(
    (user: AdminUserListItem) => {
      mutateSuspend(user.id, {
        onSuccess: () =>
          toast.warning(t("users.feedback.suspended", { name: user.name })),
        onError: () =>
          toast.error(
            t("users.feedback.suspendError", "정지 처리에 실패했습니다."),
          ),
      });
    },
    [mutateSuspend, t],
  );

  const handleUnsuspend = useCallback(
    (user: AdminUserListItem) => {
      mutateUnsuspend(user.id, {
        onSuccess: () =>
          toast.success(t("users.feedback.unsuspended", { name: user.name })),
        onError: () =>
          toast.error(
            t("users.feedback.unsuspendError", "정지 해제에 실패했습니다."),
          ),
      });
    },
    [mutateUnsuspend, t],
  );

  const columns = useMemo<ColumnDef<AdminUserListItem>[]>(
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
        cell: ({ row }) => (
          <Badge variant="outline">{String(row.getValue("role"))}</Badge>
        ),
      },
      {
        accessorKey: "status",
        header: t("users.table.status"),
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge variant={getStatusVariant(status)}>
              {t(`common.status.${status.toLowerCase()}`, status)}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: t("users.table.joined"),
        cell: ({ row }) => formatDate(row.getValue("createdAt")),
      },
      {
        accessorKey: "lastLoginAt",
        header: t("users.table.lastLogin", "마지막 로그인"),
        cell: ({ row }) => formatDate(row.getValue("lastLoginAt")),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const user = row.original;
          const suspended = isUserSuspended(user.status);

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sr-only">{t("users.table.openMenu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuLabel>{t("users.menu.actions")}</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    copyUserId(user.id, t("users.feedback.copiedUserId"))
                  }
                >
                  {t("users.menu.copyUserId")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openUserProfile(user)}>
                  {t("users.menu.viewProfile")}
                </DropdownMenuItem>
                <UserPermissionsAction user={user} />
                {suspended ? (
                  <ConfirmAction
                    title={t(
                      "users.confirm.unsuspendTitle",
                      "사용자 정지 해제",
                    )}
                    description={t(
                      "users.confirm.unsuspendDescription",
                      "이 사용자의 정지 상태를 해제하시겠습니까?",
                    )}
                    confirmLabel={t("users.menu.unsuspend", "사용자 정지 해제")}
                    cancelLabel={t("common.actions.cancel", "취소")}
                    onConfirm={() => handleUnsuspend(user)}
                  >
                    <DropdownMenuItem
                      onSelect={(event) => event.preventDefault()}
                    >
                      {t("users.menu.unsuspend", "사용자 정지 해제")}
                    </DropdownMenuItem>
                  </ConfirmAction>
                ) : (
                  <ConfirmAction
                    title={t("users.confirm.suspendTitle", "사용자 정지")}
                    description={t(
                      "users.confirm.suspendDescription",
                      "이 사용자를 정지 처리하시겠습니까? 관리자 권한이 필요한 작업입니다.",
                    )}
                    confirmLabel={t("users.menu.suspend", "사용자 정지")}
                    cancelLabel={t("common.actions.cancel", "취소")}
                    destructive
                    onConfirm={() => handleSuspend(user)}
                  >
                    <DropdownMenuItem
                      className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                      onSelect={(event) => event.preventDefault()}
                    >
                      {t("users.menu.suspend", "사용자 정지")}
                    </DropdownMenuItem>
                  </ConfirmAction>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleSuspend, handleUnsuspend, openUserProfile, t],
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-card sm:w-[150px]">
              <SelectValue placeholder={t("users.filters.allStatus")} />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map(({ value, labelKey, fallback }) => (
                <SelectItem key={value} value={value}>
                  {t(labelKey, fallback)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value: string) =>
              value && setViewMode(value as "list" | "grid")
            }
            className="rounded-md border bg-card sm:ml-2"
          >
            <ToggleGroupItem value="list" aria-label={t("common.view.list")}>
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label={t("common.view.grid")}>
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => {
              void handleExportCSV();
            }}
          >
            <Download className="h-4 w-4" />
            {t("users.exportCsv", "CSV")}
          </Button>
        </div>
      </div>

      {isLoading && <UsersLoadingState />}
      {isError && <UsersErrorState error={error} />}

      {!isLoading && !isError && (
        <>
          {viewMode === "list" ? (
            <DataTable
              columns={columns}
              data={items}
              onRowClick={openUserProfile}
              showExport={false}
              showPagination={false}
            />
          ) : (
            <UsersGrid
              items={items}
              onUserClick={openUserProfile}
              statusLabel={(status) =>
                t(`common.status.${status.toLowerCase()}`, status)
              }
              emptyLabel={t("table.noResults")}
              emailLabel={t("users.table.email")}
              roleLabel={t("users.table.role")}
            />
          )}

          <UsersPagination
            page={page}
            total={total}
            totalPages={totalPages}
            onPrevious={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        </>
      )}

      <UserDetailSheet
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        userDetail={userDetail}
        isLoading={isDetailLoading}
      />
    </div>
  );
}

function formatDate(value: unknown) {
  return typeof value === "string" && value
    ? new Date(value).toLocaleDateString("ko-KR")
    : "-";
}

function copyUserId(userId: string, successMessage: string) {
  void navigator.clipboard.writeText(userId);
  toast.success(successMessage);
}

function UsersLoadingState() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center rounded-xl border bg-card py-16">
      <span className="animate-pulse text-muted-foreground">
        {t("common.loading", "로딩 중...")}
      </span>
    </div>
  );
}

function UsersErrorState({ error }: { error: unknown }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
      {error instanceof Error
        ? error.message
        : t("common.error.generic", "데이터를 불러오는 데 실패했습니다.")}
    </div>
  );
}

interface UsersPaginationProps {
  page: number;
  total: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

function UsersPagination({
  page,
  total,
  totalPages,
  onPrevious,
  onNext,
}: UsersPaginationProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-2 py-2">
      <span className="text-sm text-muted-foreground">
        총 {total}명 &middot; {page} / {totalPages} 페이지
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={page <= 1}
        >
          {t("common.actions.previous", "이전")}
        </Button>
        <span className="min-w-12 text-center text-sm tabular-nums">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={page >= totalPages}
        >
          {t("common.actions.next", "다음")}
        </Button>
      </div>
    </div>
  );
}

const STATUS_FILTERS = [
  { value: "ALL", labelKey: "users.filters.allStatus", fallback: "전체" },
  { value: "ACTIVE", labelKey: "common.status.active", fallback: "활성" },
  { value: "NORMAL", labelKey: "common.status.normal", fallback: "정상" },
  {
    value: "SUSPENDED",
    labelKey: "common.status.suspended",
    fallback: "정지",
  },
  { value: "BANNED", labelKey: "common.status.banned", fallback: "차단" },
  { value: "STOPPED", labelKey: "common.status.stopped", fallback: "중지" },
  {
    value: "WITHDRAWN",
    labelKey: "common.status.withdrawn",
    fallback: "탈퇴",
  },
  { value: "DELETED", labelKey: "common.status.deleted", fallback: "삭제" },
];
