import {
  type AdminReportDetail,
  type AdminReportReporter,
} from "@/features/reports/api/reports-api";
import {
  ActionSection,
  BasicInfoSection,
  ReporterInfoSection,
  ReportersListSection,
  ReviewInfoSection,
  TargetInfoSection,
} from "./report-detail-sections";
import { isReportActionable } from "./report-table-utils";

interface ReportDetailContentProps {
  detail: AdminReportDetail;
  reporters: AdminReportReporter[];
  isActionPending: boolean;
  onDismiss: () => void;
  onResolve: () => void;
  onWarn: () => void;
  onDeleteTarget: () => void;
}

export function ReportDetailContent({
  detail,
  reporters,
  isActionPending,
  onDismiss,
  onResolve,
  onWarn,
  onDeleteTarget,
}: ReportDetailContentProps) {
  return (
    <div className="space-y-5 py-2">
      <BasicInfoSection detail={detail} />
      <TargetInfoSection detail={detail} />
      <ReporterInfoSection detail={detail} />
      <ReportersListSection reporters={reporters} />
      <ReviewInfoSection detail={detail} />
      {isReportActionable(detail.status) && (
        <ActionSection
          isActionPending={isActionPending}
          onDismiss={onDismiss}
          onResolve={onResolve}
          onWarn={onWarn}
          onDeleteTarget={onDeleteTarget}
        />
      )}
    </div>
  );
}
