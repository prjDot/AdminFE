import {
  AlertTriangle,
  Calendar,
  Image as ImageIcon,
  MapPin,
  Phone,
  User as UserIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { type AdminNoticeDetail } from "@/features/notices/api/notices-api";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ConfirmAction } from "@/shared/ui/confirm-action";
import {
  formatDate,
  getNoticeStatusLabelKey,
  getStatusVariant,
} from "@/widgets/notices-table/ui/notice-table-utils";

interface NoticeDetailContentProps {
  detail: AdminNoticeDetail;
  onHide: () => void;
  onRestore: () => void;
}

export function NoticeDetailContent({
  detail,
  onHide,
  onRestore,
}: NoticeDetailContentProps) {
  const { t } = useTranslation();
  const statusLabelKey = getNoticeStatusLabelKey(detail.status);

  return (
    <div className="space-y-6 py-2">
      {detail.images.length > 0 ? (
        <div className="overflow-hidden rounded-lg border">
          <img
            src={detail.images[0]}
            alt={detail.title}
            className="h-56 w-full object-cover"
          />
        </div>
      ) : detail.thumbnailUrl ? (
        <div className="overflow-hidden rounded-lg border">
          <img
            src={detail.thumbnailUrl}
            alt={detail.title}
            className="h-56 w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/40">
          <ImageIcon className="mb-2 h-12 w-12 text-muted-foreground/40" />
          <span className="text-sm text-muted-foreground">
            {t("notices.detail.imagePlaceholder")}
          </span>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold">{detail.title}</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="outline">{detail.animalType}</Badge>
          <Badge variant={getStatusVariant(detail.status)}>
            {t(statusLabelKey, detail.status)}
          </Badge>
          {detail.hidden && (
            <Badge variant="secondary">{t("notices.status.hidden")}</Badge>
          )}
          {detail.reportCount > 0 && (
            <Badge variant="warning" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              신고 {detail.reportCount}건
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/20 p-4">
        <div className="space-y-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <UserIcon className="h-3 w-3" />
            {t("notices.table.reporter")}
          </span>
          <p className="text-sm font-medium">{detail.reporter}</p>
        </div>

        <div className="space-y-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {t("notices.table.reportedDate")}
          </span>
          <p className="text-sm font-medium">{formatDate(detail.reportedAt)}</p>
        </div>

        {detail.breed && (
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">품종</span>
            <p className="text-sm font-medium">{detail.breed}</p>
          </div>
        )}

        {detail.gender && (
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">성별</span>
            <p className="text-sm font-medium">
              {detail.gender === "MALE"
                ? "수컷"
                : detail.gender === "FEMALE"
                  ? "암컷"
                  : detail.gender}
            </p>
          </div>
        )}

        {detail.age != null && (
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">나이</span>
            <p className="text-sm font-medium">{detail.age}살</p>
          </div>
        )}

        {detail.color && (
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">색상</span>
            <p className="text-sm font-medium">{detail.color}</p>
          </div>
        )}

        {detail.missingDate && (
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">실종일</span>
            <p className="text-sm font-medium">
              {formatDate(detail.missingDate)}
            </p>
          </div>
        )}

        {detail.rewardAmount != null && (
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">사례금</span>
            <p className="text-sm font-medium">
              {detail.rewardAmount.toLocaleString("ko-KR")}원
            </p>
          </div>
        )}

        {detail.region && (
          <div className="col-span-2 space-y-1 border-t pt-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {t("notices.detail.locationLabel")}
            </span>
            <p className="text-sm font-medium">
              {detail.location ?? detail.region}
            </p>
          </div>
        )}

        {detail.contactPhone && (
          <div className="col-span-2 space-y-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              연락처
            </span>
            <p className="text-sm font-medium">{detail.contactPhone}</p>
          </div>
        )}
      </div>

      {detail.content && (
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            상세 설명
          </span>
          <p className="whitespace-pre-wrap rounded-lg border bg-muted/20 p-3 text-sm leading-relaxed">
            {detail.content}
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 border-t pt-4">
        {detail.hidden ? (
          <ConfirmAction
            title={t("notices.confirm.restoreTitle", "공고 숨김 해제")}
            description={t(
              "notices.confirm.restoreDescription",
              "이 실종 공고를 다시 노출하시겠습니까?",
            )}
            confirmLabel={t("notices.menu.restoreNotice", "게시글 숨김 해제")}
            cancelLabel={t("common.actions.cancel", "취소")}
            onConfirm={onRestore}
          >
            <Button variant="outline" size="sm">
              {t("notices.menu.restoreNotice", "게시글 숨김 해제")}
            </Button>
          </ConfirmAction>
        ) : (
          <ConfirmAction
            title={t("notices.confirm.hideTitle", "공고 숨김 처리")}
            description={t(
              "notices.confirm.hideDescription",
              "이 실종 공고를 관리자 화면 기준으로 숨김 처리하시겠습니까?",
            )}
            confirmLabel={t("notices.menu.hideNotice", "게시글 숨김 처리")}
            cancelLabel={t("common.actions.cancel", "취소")}
            destructive
            onConfirm={onHide}
          >
            <Button variant="destructive" size="sm">
              {t("notices.menu.hideNotice", "게시글 숨김 처리")}
            </Button>
          </ConfirmAction>
        )}
      </div>
    </div>
  );
}
