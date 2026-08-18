"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Check, X } from "lucide-react";
import { useAppDispatch } from "@/store";
import { approveLeaveService, fetchLeaveListService } from "@/features/hr/store/thunks/hr-thunks";
import { LeaveModel, LeaveStatusType } from "@/features/hr/store/models/hr-models";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { TextField } from "@/components/shared/form-field/text-field";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { TableImage } from "@/components/shared/table/table-image";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/components/shared/common/show-toast";
import { AppDefault } from "@/constants/app-resource/default/default";

interface LeaveDecisionFormData {
  actionNote?: string;
}

interface LeaveDetailModalProps {
  leave: LeaveModel | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function renderLeaveStatusBadge(status?: LeaveStatusType) {
  switch (status) {
    case "APPROVED":
      return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 rounded-xl px-2.5 py-0.5 font-bold">Approved</Badge>;
    case "REJECTED":
      return <Badge className="bg-red-500/10 text-red-600 border-red-500/30 rounded-xl px-2.5 py-0.5 font-bold">Rejected</Badge>;
    case "PENDING":
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 rounded-xl px-2.5 py-0.5 font-bold">Pending</Badge>;
    default:
      return <Badge variant="outline">{status || "Unknown"}</Badge>;
  }
}

export function LeaveDetailModal({ leave, isOpen, onClose, onSuccess }: LeaveDetailModalProps) {
  const dispatch = useAppDispatch();

  const decisionForm = useForm<LeaveDecisionFormData>({
    defaultValues: { actionNote: "" },
  });

  const {
    formState: { isSubmitting: isSubmittingDecision },
    reset,
  } = decisionForm;

  useEffect(() => {
    if (isOpen) {
      reset({ actionNote: "" });
    }
  }, [isOpen, reset]);

  if (!leave) return null;

  const onDecisionSubmit = async (status: "APPROVED" | "REJECTED") => {
    try {
      const data = decisionForm.getValues();
      await dispatch(
        approveLeaveService({
          id: leave.id,
          status,
          actionNote: data.actionNote || undefined,
        })
      ).unwrap();

      showToast.success(`Leave request ${status.toLowerCase()} successfully!`);
      onClose();
      reset();
      dispatch(fetchLeaveListService({ businessId: AppDefault.BUSINESS_ID }));
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to process leave request";
      showToast.error(message);
    }
  };

  const employeeName = leave.userInfo
    ? `${leave.userInfo.firstName || ""} ${leave.userInfo.lastName || ""}`.trim()
    : "Staff Member";

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="2xl">
      <FormHeader
        title={leave.status === "PENDING" ? "Review Leave Application" : "Leave Application Details"}
        description={leave.referenceNumber ? `Reference #${leave.referenceNumber}` : "Employee Leave Application"}
        isCreate={false}
      />
      <form className="flex flex-col flex-1 min-h-0 overflow-hidden" autoComplete="off">
        <FormBody className="space-y-4">
          {/* Employee Info Header Card */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/60 shadow-2xs">
            <CustomAvatar
              name={employeeName}
              imageUrl={leave.userInfo?.profileImageUrl}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-extrabold text-foreground text-sm">
                  {employeeName}
                </span>
                {renderLeaveStatusBadge(leave.status)}
              </div>
              <span className="text-xs text-muted-foreground font-medium block mt-0.5">
                {leave.userInfo?.email || "No email provided"}
              </span>
            </div>
          </div>

          {/* Leave Application Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs">
            <div>
              <span className="text-muted-foreground font-medium block">Leave Type</span>
              <span className="font-extrabold text-primary text-sm mt-0.5 block">{leave.leaveTypeEnum}</span>
            </div>
            <div>
              <span className="text-muted-foreground font-medium block">Total Duration</span>
              <span className="font-extrabold text-foreground text-sm mt-0.5 block">{leave.totalDays} Day(s)</span>
            </div>
            <div>
              <span className="text-muted-foreground font-medium block">Start Date</span>
              <span className="font-bold text-foreground mt-0.5 block">{leave.startDate}</span>
            </div>
            <div>
              <span className="text-muted-foreground font-medium block">End Date</span>
              <span className="font-bold text-foreground mt-0.5 block">{leave.endDate}</span>
            </div>
            <div className="sm:col-span-2 pt-2 border-t border-border/40">
              <span className="text-muted-foreground font-medium block">Reason for Leave</span>
              <p className="text-foreground font-medium mt-1 p-2.5 rounded-lg bg-background border border-border/50 text-xs leading-relaxed">
                {leave.reason || "No reason provided."}
              </p>
            </div>
            {leave.attachmentImage && (
              <div className="sm:col-span-2 pt-2 border-t border-border/40">
                <span className="text-muted-foreground font-medium block mb-1.5">Attached Document / Image</span>
                <TableImage
                  src={leave.attachmentImage}
                  alt="Attached Leave Document"
                  className="h-28 w-28 rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Manager Decision Input / Record */}
          {leave.status === "PENDING" ? (
            <TextField
              control={decisionForm.control}
              name="actionNote"
              label="Manager Decision Note"
              disabled={isSubmittingDecision}
              placeholder="E.g. Approved based on annual leave allowance"
            />
          ) : (
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1.5 text-xs">
              <div className="font-bold text-foreground text-xs pb-1 border-b border-border/40">
                Decision Information
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground font-medium">Processed By:</span>
                <span className="font-bold text-foreground">
                  {leave.actionUserInfo ? `${leave.actionUserInfo.firstName || ""} ${leave.actionUserInfo.lastName || ""}`.trim() : "System Administrator"}
                </span>
              </div>
              {leave.actionNote && (
                <div className="pt-1.5 border-t border-border/40">
                  <span className="text-muted-foreground font-medium block">Decision Note:</span>
                  <p className="text-foreground italic mt-0.5">{leave.actionNote}</p>
                </div>
              )}
            </div>
          )}
        </FormBody>

        <FormFooter
          isSubmitting={isSubmittingDecision}
          isDirty={true}
          isCreate={false}
        >
          {leave.status === "PENDING" ? (
            <>
              <CustomButton
                variant="outline"
                type="button"
                className="h-9 rounded-xl text-xs font-bold border-red-500/40 text-red-600 hover:bg-red-500/10 cursor-pointer gap-1.5"
                onClick={() => onDecisionSubmit("REJECTED")}
                disabled={isSubmittingDecision}
              >
                <X className="h-3.5 w-3.5" /> Reject Request
              </CustomButton>
              <CustomButton
                type="button"
                className="h-9 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer gap-1.5"
                onClick={() => onDecisionSubmit("APPROVED")}
                disabled={isSubmittingDecision}
              >
                <Check className="h-3.5 w-3.5" /> Approve Leave
              </CustomButton>
            </>
          ) : (
            <CustomButton
              variant="outline"
              type="button"
              className="h-9 rounded-xl text-xs font-bold cursor-pointer"
              onClick={onClose}
            >
              Close
            </CustomButton>
          )}
        </FormFooter>
      </form>
    </CustomModal>
  );
}
