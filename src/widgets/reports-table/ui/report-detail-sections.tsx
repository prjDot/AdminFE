import { AlertTriangle, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  type AdminReportDetail,
  type AdminReportReporter,
} from "@/features/reports/api/reports-api";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { ConfirmAction } from "@/shared/ui/confirm-action";
import {
  formatDate,
  getReportStatusLabelKey,
  getStatusVariant,
} from "./report-table-utils";

export function BasicInfoSection({ detail }: { detail: AdminReportDetail }) {
  const { t } = useTranslation();

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        {t("reports.detail.basicInfo", "신고 기본 정보")}
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">
            {t("reports.table.targetType", "대상 유형")}
          </p>
          <p className="font-medium">{detail.targetType}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">
            {t("reports.table.status", "상태")}
          </p>
          <Badge variant={getStatusVariant(detail.status)}>
            {t(getReportStatusLabelKey(detail.status), detail.status)}
          </Badge>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">
            {t("reports.table.primaryReason", "신고 사유")}
          </p>
          <p className="font-medium">{detail.reason}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">
            {t("reports.detail.createdAt", "신고 일시")}
          </p>
          <p className="font-medium">{formatDate(detail.createdAt)}</p>
        </div>
        {detail.description && (
          <div className="col-span-2 space-y-0.5">
            <p className="text-xs text-muted-foreground">
              {t("reports.detail.description_field", "상세 내용")}
            </p>
            <p className="whitespace-pre-wrap text-sm">{detail.description}</p>
          </div>
        )}
        <div className="col-span-2 space-y-0.5">
          <p className="text-xs text-muted-foreground">
            {t("reports.detail.sameTargetCount", "동일 대상 신고 수")}
          </p>
          <div className="flex items-center gap-1">
            <Badge
              variant={getReportCountVariant(detail.sameTargetReportCount)}
            >
              {detail.sameTargetReportCount}
            </Badge>
            {detail.sameTargetReportCount >= 10 && (
              <Badge variant="destructive" className="px-1 text-[10px]">
                {t("reports.badges.priority", "우선")}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TargetInfoSection({ detail }: { detail: AdminReportDetail }) {
  const { t } = useTranslation();
  if (!detail.target) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        {t("reports.detail.targetInfo", "대상 정보")}
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
        {detail.target.title && (
          <div className="col-span-2 space-y-0.5">
            <p className="text-xs text-muted-foreground">
              {t("reports.detail.targetTitle", "제목")}
            </p>
            <p className="font-medium">{detail.target.title}</p>
          </div>
        )}
        {detail.target.author && (
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">
              {t("reports.detail.targetAuthor", "작성자")}
            </p>
            <p className="font-medium">{detail.target.author}</p>
          </div>
        )}
        {detail.target.summary && (
          <div className="col-span-2 space-y-0.5">
            <p className="text-xs text-muted-foreground">
              {t("reports.detail.targetSummary", "요약")}
            </p>
            <p className="whitespace-pre-wrap text-sm">
              {detail.target.summary}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export function ReporterInfoSection({ detail }: { detail: AdminReportDetail }) {
  const { t } = useTranslation();
  if (!detail.reporter) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        {t("reports.detail.reporterInfo", "신고자 정보")}
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">
            {t("reports.detail.reporterNickname", "닉네임")}
          </p>
          <p className="font-medium">{detail.reporter.nickname}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">
            {t("reports.detail.reporterEmail", "이메일")}
          </p>
          <p className="font-medium">{detail.reporter.email}</p>
        </div>
      </div>
    </section>
  );
}

export function ReportersListSection({
  reporters,
}: {
  reporters: AdminReportReporter[];
}) {
  const { t } = useTranslation();
  if (reporters.length === 0) return null;

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
        <Users className="h-4 w-4" />
        {t("reports.reporters.listTitle", {
          count: reporters.length,
          defaultValue: `신고자 목록 (${reporters.length}명)`,
        })}
      </h3>
      <div className="max-h-52 space-y-2 overflow-y-auto rounded-md border p-2">
        {reporters.map((reporter) => (
          <div
            key={reporter.id}
            className="flex items-start justify-between rounded-md p-2 hover:bg-muted/50"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{reporter.nickname}</span>
              <span className="text-xs text-muted-foreground">
                {reporter.email}
              </span>
              <span className="text-xs text-muted-foreground">
                {reporter.reason}
              </span>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatDate(reporter.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ReviewInfoSection({ detail }: { detail: AdminReportDetail }) {
  const { t } = useTranslation();
  if (!detail.reviewedByNickname) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        {t("reports.detail.reviewInfo", "처리 이력")}
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">
            {t("reports.detail.reviewedBy", "처리자")}
          </p>
          <p className="font-medium">{detail.reviewedByNickname}</p>
        </div>
        {detail.reviewedAt && (
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">
              {t("reports.detail.reviewedAt", "처리 일시")}
            </p>
            <p className="font-medium">{formatDate(detail.reviewedAt)}</p>
          </div>
        )}
        {detail.processedAction && (
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">
              {t("reports.detail.processedAction", "처리 유형")}
            </p>
            <p className="font-medium">{detail.processedAction}</p>
          </div>
        )}
        {detail.processReason && (
          <div className="col-span-2 space-y-0.5">
            <p className="text-xs text-muted-foreground">
              {t("reports.detail.processReason", "처리 사유")}
            </p>
            <p className="whitespace-pre-wrap text-sm">
              {detail.processReason}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export function ActionSection({
  isActionPending,
  onDismiss,
  onResolve,
  onWarn,
  onDeleteTarget,
}: {
  isActionPending: boolean;
  onDismiss: () => void;
  onResolve: () => void;
  onWarn: () => void;
  onDeleteTarget: () => void;
}) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4 border-t pt-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">
          {t("reports.detail.actions", "신고 처리")}
        </h3>
        <div className="flex flex-wrap gap-2">
          <ConfirmAction
            title={t("reports.confirm.dismissTitle", "신고 기각")}
            description={t(
              "reports.confirm.dismissDescription",
              "이 신고를 기각 처리하시겠습니까?",
            )}
            confirmLabel={t("reports.menu.dismiss", "기각")}
            cancelLabel={t("common.actions.cancel", "취소")}
            onConfirm={onDismiss}
          >
            <Button size="sm" variant="outline" disabled={isActionPending}>
              {t("reports.menu.dismiss", "기각")}
            </Button>
          </ConfirmAction>
          <ConfirmAction
            title={t("reports.confirm.resolveTitle", "신고 해결")}
            description={t(
              "reports.confirm.resolveDescription",
              "이 신고를 해결 처리하시겠습니까?",
            )}
            confirmLabel={t("reports.menu.resolve", "해결")}
            cancelLabel={t("common.actions.cancel", "취소")}
            onConfirm={onResolve}
          >
            <Button size="sm" variant="default" disabled={isActionPending}>
              {t("reports.menu.resolve", "해결")}
            </Button>
          </ConfirmAction>
          <ConfirmAction
            title={t("reports.confirm.warnTitle", "사용자 경고")}
            description={t(
              "reports.confirm.warnDescription",
              "신고 대상 사용자에게 경고 처리를 진행하시겠습니까?",
            )}
            confirmLabel={t("reports.menu.warn", "경고")}
            cancelLabel={t("common.actions.cancel", "취소")}
            onConfirm={onWarn}
          >
            <Button size="sm" variant="outline" disabled={isActionPending}>
              {t("reports.menu.warn", "경고")}
            </Button>
          </ConfirmAction>
        </div>
      </div>
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-destructive">
          <AlertTriangle className="h-4 w-4" />
          {t("reports.detail.dangerZone", "위험 작업")}
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          {t(
            "reports.detail.deleteTargetDescription",
            "신고 대상 자체를 삭제합니다. 이 작업은 상세 화면에서만 실행할 수 있습니다.",
          )}
        </p>
        <ConfirmAction
          title={t("reports.confirm.deleteTargetTitle", "신고 대상 삭제")}
          description={t(
            "reports.confirm.deleteTargetDescription",
            "신고 대상 콘텐츠를 삭제합니다. 연결된 데이터가 함께 정리될 수 있습니다. 계속하시겠습니까?",
          )}
          confirmLabel={t("reports.menu.deleteTarget", "대상 삭제")}
          cancelLabel={t("common.actions.cancel", "취소")}
          destructive
          onConfirm={onDeleteTarget}
        >
          <Button size="sm" variant="destructive" disabled={isActionPending}>
            {t("reports.menu.deleteTarget", "대상 삭제")}
          </Button>
        </ConfirmAction>
      </div>
    </section>
  );
}

function getReportCountVariant(
  count: number,
): "secondary" | "destructive" | "warning" {
  if (count >= 10) return "destructive";
  if (count >= 5) return "warning";
  return "secondary";
}
