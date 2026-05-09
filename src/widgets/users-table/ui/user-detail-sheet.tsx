import { Calendar, Mail, MapPin, Phone, ShieldAlert, User as UserIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type AdminUserDetail } from "@/features/users/api/users-api";
import { Badge } from "@/shared/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { getStatusVariant } from "./user-table-utils";

interface UserDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userDetail?: AdminUserDetail;
  isLoading: boolean;
}

export function UserDetailSheet({
  open,
  onOpenChange,
  userDetail,
  isLoading,
}: UserDetailSheetProps) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("users.profile.title")}</SheetTitle>
          <SheetDescription>{t("users.profile.description")}</SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <span className="animate-pulse text-muted-foreground">
              {t("common.loading", "로딩 중...")}
            </span>
          </div>
        )}

        {!isLoading && userDetail && (
          <div className="space-y-6 py-6">
            <div className="flex items-center gap-4">
              {userDetail.profile?.profileImageUrl ? (
                <img
                  src={userDetail.profile.profileImageUrl}
                  alt={userDetail.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <UserIcon className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">{userDetail.name}</h3>
                <Badge
                  variant={getStatusVariant(userDetail.status)}
                  className="mt-1"
                >
                  {t(
                    `common.status.${userDetail.status.toLowerCase()}`,
                    userDetail.status,
                  )}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{userDetail.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ShieldAlert className="h-4 w-4 shrink-0 text-muted-foreground" />
                {userDetail.role}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                {t("users.profile.joinedAt", {
                  date: new Date(userDetail.createdAt).toLocaleDateString(
                    "ko-KR",
                  ),
                })}
              </div>
              {userDetail.profile?.region && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {userDetail.profile.region}
                </div>
              )}
              {userDetail.profile?.phoneNumber && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {userDetail.profile.phoneNumber}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  {
                    label: t("users.profile.notices", "공고"),
                    count: userDetail.notices.length,
                  },
                  {
                    label: t("users.profile.posts", "게시글"),
                    count: userDetail.communityPosts.length,
                  },
                  {
                    label: t("users.profile.reports", "신고"),
                    count: userDetail.reports.length,
                  },
                ] as const
              ).map(({ label, count }) => (
                <div
                  key={label}
                  className="rounded-lg border bg-muted/20 p-3 text-center"
                >
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
