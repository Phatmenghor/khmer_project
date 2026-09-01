"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Check, X, AlertTriangle } from "lucide-react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { CustomButton, CancelButton } from "@/components/shared/button/custom-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface DecisionFormData {
  actionNote: string;
}

interface LeaveDecisionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (actionNote: string) => Promise<void>;
  status: "APPROVED" | "REJECTED";
  employeeName: string;
  isSubmitting?: boolean;
}

export function LeaveDecisionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  status,
  employeeName,
  isSubmitting = false,
}: LeaveDecisionConfirmModalProps) {
  const isApprove = status === "APPROVED";
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<DecisionFormData>({
    defaultValues: { actionNote: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ actionNote: "" });
      setError(null);
      setIsProcessing(false);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: DecisionFormData) => {
    try {
      setError(null);
      setIsProcessing(true);
      await onConfirm(data.actionNote);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const inFlight = isSubmitting || isProcessing;
  const title = isApprove ? "Approve Leave Request" : "Reject Leave Request";
  const IconComponent = isApprove ? Check : X;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 p-4 px-5 border-b border-border/60 bg-gradient-to-r from-background via-card to-background shrink-0">
        <div
          className={cn(
            "p-2.5 rounded-2xl border shrink-0 shadow-2xs",
            isApprove
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
              : "bg-red-500/10 text-red-600 border-red-500/30"
          )}
        >
          <IconComponent className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-base text-foreground leading-tight">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            {isApprove ? "Confirm leave approval action" : "Confirm leave rejection action"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
        {/* ── Body ── */}
        <div className="p-4 px-5 space-y-3.5 bg-card/40">
          <div
            className={cn(
              "p-3.5 rounded-2xl border space-y-1.5",
              isApprove
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-red-500/5 border-red-500/20"
            )}
          >
            <div className="flex flex-col gap-0.5">
              <span
                className={cn(
                  "text-[11px] font-bold flex items-center gap-1.5",
                  isApprove ? "text-emerald-600" : "text-red-600"
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full animate-pulse",
                    isApprove ? "bg-emerald-600" : "bg-red-600"
                  )}
                />
                Target Staff
              </span>
              <span className="text-xs font-semibold text-foreground truncate">
                {employeeName}
              </span>
            </div>
            <p
              className={cn(
                "text-[11px] font-medium leading-relaxed",
                isApprove ? "text-emerald-700/80 dark:text-emerald-400/80" : "text-red-700/80 dark:text-red-400/80"
              )}
            >
              {isApprove
                ? "Approving this request will mark the leave as authorized for the specified dates."
                : "Rejecting this request will mark the leave as denied for the staff member."}
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <TextareaField
              control={control}
              name="actionNote"
              label={isApprove ? "Approval Note (Optional)" : "Rejection Reason (Optional)"}
              placeholder={
                isApprove
                  ? "Enter note (press Enter for newline)..."
                  : "Enter reason for rejection (press Enter for newline)..."
              }
              disabled={inFlight}
              error={errors.actionNote}
              rows={3}
            />
          </div>

          {error && (
            <Alert variant="destructive" className="py-2.5 rounded-xl flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <AlertDescription className="text-xs font-bold">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="p-4 px-5 border-t border-border/60 bg-background flex items-center justify-end gap-2.5 shrink-0">
          <CancelButton
            onClick={onClose}
            disabled={inFlight}
            className="h-9 rounded-xl font-semibold min-w-[90px] border border-border/80 hover:border-foreground/30 hover:bg-accent/50 text-foreground text-xs px-4 cursor-pointer transition-all duration-150"
          />
          <CustomButton
            type="submit"
            size="sm"
            disabled={inFlight}
            isLoading={inFlight}
            className={cn(
              "h-9 rounded-xl font-extrabold min-w-[135px] text-white text-xs px-4 shadow-xs cursor-pointer transition-all duration-150",
              isApprove
                ? "bg-emerald-600 hover:bg-emerald-700 border border-emerald-700/40 text-white"
                : "bg-red-600 hover:bg-red-700 border border-red-700/40 text-white"
            )}
          >
            {inFlight ? "Processing..." : isApprove ? "Confirm Approve" : "Confirm Reject"}
          </CustomButton>
        </div>
      </form>
    </CustomModal>
  );
}
