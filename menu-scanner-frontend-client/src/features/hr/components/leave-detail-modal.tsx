"use client";

import React, { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  approveLeaveService,
  fetchLeaveListService,
  getLeaveByIdService,
} from "@/features/hr/store/thunks/hr-thunks";
import { clearSelectedLeave } from "@/features/hr/store/slice/hr-slice";
import {
  LeaveModel,
  LeaveStatusType,
  LeaveStatusHistoryItem,
  getUserAvatarUrl,
  getUserRolesDisplay,
} from "@/features/hr/store/models/hr-models";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/shared/common/show-toast";
import { AppDefault } from "@/constants/app-resource/default/default";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import { CustomImagePreview } from "@/components/shared/image/custom-image-preview";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LeaveDecisionConfirmModal } from "./leave-decision-confirm-modal";

interface LeaveDetailModalProps {
  leave: LeaveModel | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function renderLeaveStatusBadge(status?: LeaveStatusType) {
  switch (status) {
    case "APPROVED":
      return <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-600 hover:text-emerald-600 border border-emerald-500/30 hover:border-emerald-500/80 rounded-xl px-2.5 py-0.5 font-bold transition-colors cursor-default">Approved</Badge>;
    case "REJECTED":
      return <Badge className="bg-red-500/10 hover:bg-red-500/10 text-red-600 hover:text-red-600 border border-red-500/30 hover:border-red-500/80 rounded-xl px-2.5 py-0.5 font-bold transition-colors cursor-default">Rejected</Badge>;
    case "CANCELLED":
      return <Badge className="bg-gray-500/10 hover:bg-gray-500/10 text-gray-500 hover:text-gray-500 border border-gray-500/30 hover:border-gray-500/80 rounded-xl px-2.5 py-0.5 font-bold transition-colors cursor-default">Cancelled</Badge>;
    case "PENDING":
      return <Badge className="bg-amber-500/10 hover:bg-amber-500/10 text-amber-600 hover:text-amber-600 border border-amber-500/30 hover:border-amber-500/80 rounded-xl px-2.5 py-0.5 font-bold transition-colors cursor-default">Pending</Badge>;
    default:
      return <Badge variant="outline">{status || "Unknown"}</Badge>;
  }
}

function historyDotColor(status: LeaveStatusType) {
  switch (status) {
    case "APPROVED": return "bg-emerald-500";
    case "REJECTED": return "bg-red-500";
    case "CANCELLED": return "bg-gray-400";
    default: return "bg-primary";
  }
}

function historyLabel(status: LeaveStatusType) {
  switch (status) {
    case "PENDING": return "Leave Submitted";
    case "APPROVED": return "Approved by Manager";
    case "REJECTED": return "Rejected by Manager";
    case "CANCELLED": return "Cancelled";
    default: return status;
  }
}

function HistoryTimeline({ history, loading }: { history?: LeaveStatusHistoryItem[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="col-span-2 flex items-center gap-2 py-2 text-muted-foreground text-xs">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading history...
      </div>
    );
  }
  if (!history || history.length === 0) return null;
  return (
    <div className="col-span-2 relative pl-4 border-l border-border/60 space-y-4 py-1">
      {history.map((item) => (
        <div key={item.id} className="relative">
          <div className={`absolute -left-[20.5px] top-0.5 h-2 w-2 rounded-full border border-background shadow-xs ${historyDotColor(item.status)}`} />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-foreground text-xs">{historyLabel(item.status)}</span>
            <span className="text-[10px] text-muted-foreground">
              {item.changedByName || "System"} &bull; {dateTimeFormat(item.changedAt)}
            </span>
            {item.note && (
              <p className="mt-1.5 p-2 rounded-lg bg-background border border-border/50 text-[11px] text-foreground italic leading-relaxed">
                &ldquo;{item.note}&rdquo;
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeaveDetailModal({ leave, isOpen, onClose, onSuccess }: LeaveDetailModalProps) {
  const dispatch = useAppDispatch();
  const { selectedLeave, selectedLeaveLoading } = useAppSelector((s) => s.hr);

  const [confirmStatus, setConfirmStatus] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // Fetch full detail (with statusHistory) every time the modal opens
  useEffect(() => {
    if (isOpen && leave?.id) {
      dispatch(getLeaveByIdService(leave.id));
    }
    if (!isOpen) {
      dispatch(clearSelectedLeave());
    }
  }, [isOpen, leave?.id, dispatch]);

  if (!leave) return null;

  // Use enriched data from store if available, fall back to prop
  const liveLeave: LeaveModel = selectedLeave?.id === leave.id ? selectedLeave : leave;

  const employeeName = liveLeave.userInfo
    ? `${liveLeave.userInfo.firstName || ""} ${liveLeave.userInfo.lastName || ""}`.trim()
    : "Staff Member";

  const employeeSubtitle = liveLeave.userInfo
    ? getUserRolesDisplay(liveLeave.userInfo)
    : "Staff Member";

  const avatarUrl = getUserAvatarUrl(liveLeave.userInfo);

  const handleConfirmSubmit = async (actionNote: string) => {
    if (!confirmStatus) return;
    setIsSubmittingDecision(true);
    try {
      await dispatch(
        approveLeaveService({
          id: liveLeave.id,
          status: confirmStatus,
          actionNote: actionNote || undefined,
        })
      ).unwrap();

      showToast.success(`Leave request ${confirmStatus.toLowerCase()} successfully!`);
      setConfirmStatus(null);
      // Refresh detail to get updated statusHistory
      dispatch(getLeaveByIdService(liveLeave.id));
      // Refresh list in background
      dispatch(fetchLeaveListService({ businessId: AppDefault.BUSINESS_ID }));
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to process leave request";
      showToast.error(message);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  return (
    <>
      <CustomModal isOpen={isOpen} onClose={onClose} size="2xl" disableScrollWrapper={true}>
        <DialogHeader className="px-4 py-3 border-b border-border/60 m-0 bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-3 pr-4 text-left">
            {avatarUrl ? (
              <CustomImagePreview
                src={avatarUrl}
                alt={employeeName}
                fallbackText={employeeName}
                className="h-10 w-10 rounded-[10px]"
              />
            ) : employeeName ? (
              <CustomAvatar name={employeeName} size="lg" />
            ) : null}

            <div className="flex-1 min-w-0 text-left">
              <DialogTitle className="text-sm md:text-base font-semibold leading-tight text-foreground truncate">
                {employeeName}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-snug truncate">
                {employeeSubtitle} &bull; {liveLeave.userInfo?.email || "No email"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <FormBody className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
              {/* Leave Information */}
              <SectionTitle>Leave Information</SectionTitle>
              <InfoRow label="Reference Number" value={liveLeave.referenceNumber || "-"} />
              <InfoRow label="Leave Type" value={liveLeave.leaveTypeEnum} />
              <InfoRow label="Start Date" value={liveLeave.startDate} />
              <InfoRow label="End Date" value={liveLeave.endDate} />
              <InfoRow label="Total Days" value={`${liveLeave.totalDays} Day(s)`} />
              <InfoRow label="Status" value={renderLeaveStatusBadge(liveLeave.status)} />
              <InfoRow label="Reason for Leave" value={liveLeave.reason || "-"} fullWidth />

              {/* Status History Timeline */}
              {(selectedLeaveLoading || (liveLeave.statusHistory && liveLeave.statusHistory.length > 0)) && (
                <>
                  <SectionTitle>Application Timeline &amp; Audit</SectionTitle>
                  <HistoryTimeline history={liveLeave.statusHistory} loading={selectedLeaveLoading} />
                </>
              )}
            </div>
          </FormBody>

          <FormFooter isSubmitting={isSubmittingDecision} isDirty={true} isCreate={false}>
            {liveLeave.status === "PENDING" ? (
              <>
                <CustomButton
                  variant="outline"
                  type="button"
                  className="h-9 rounded-xl text-xs font-bold border border-red-500/40 hover:border-red-500/80 text-red-600 dark:text-red-400 hover:bg-red-500/10 cursor-pointer px-4 transition-all duration-150"
                  onClick={() => setConfirmStatus("REJECTED")}
                  disabled={isSubmittingDecision || selectedLeaveLoading}
                >
                  Reject Request
                </CustomButton>
                <CustomButton
                  type="button"
                  className="h-9 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-4 shadow-xs transition-all duration-150"
                  onClick={() => setConfirmStatus("APPROVED")}
                  disabled={isSubmittingDecision || selectedLeaveLoading}
                >
                  Approve Leave
                </CustomButton>
              </>
            ) : (
              <CustomButton
                variant="outline"
                type="button"
                className="h-9 rounded-xl text-xs font-semibold border border-border/80 hover:border-foreground/30 hover:bg-accent/50 text-foreground cursor-pointer px-5 transition-all duration-150"
                onClick={onClose}
              >
                Close
              </CustomButton>
            )}
          </FormFooter>
        </div>
      </CustomModal>

      {/* Confirm decision modal */}
      {confirmStatus && (
        <LeaveDecisionConfirmModal
          isOpen={!!confirmStatus}
          onClose={() => setConfirmStatus(null)}
          onConfirm={handleConfirmSubmit}
          status={confirmStatus}
          employeeName={employeeName}
          isSubmitting={isSubmittingDecision}
        />
      )}
    </>
  );
}
