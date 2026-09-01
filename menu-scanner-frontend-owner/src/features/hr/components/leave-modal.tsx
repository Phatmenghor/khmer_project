"use client";

import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/store";
import { createLeaveService, updateLeaveService, fetchLeaveListService, fetchMyLeaveBalanceService } from "@/features/hr/store/thunks/hr-thunks";
import { LeaveModel } from "@/features/hr/store/models/hr-models";
import { leaveSchema, LeaveFormValues } from "@/features/hr/store/models/schema/hr.schema";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton, SubmitButton } from "@/components/shared/button/custom-button";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { showToast } from "@/components/shared/common/show-toast";
import { getTodayLocalDateString } from "@/utils/date/date-time-format";
import { AppDefault } from "@/constants/app-resource/default/default";
import { Calendar, Clock } from "lucide-react";

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editLeave?: LeaveModel | null; // pass to enable edit mode
}

const LEAVE_TYPE_OPTIONS = [
  { value: "ANNUAL", label: "Annual Leave" },
  { value: "SICK", label: "Sick Leave" },
  { value: "UNPAID", label: "Unpaid Leave" },
  { value: "MATERNITY", label: "Maternity / Paternity Leave" },
  { value: "SPECIAL", label: "Special / Casual Leave" },
  { value: "OTHER", label: "Other (Custom Leave Type)" },
];

const LEAVE_SESSION_OPTIONS = [
  { value: "FULL_DAY", label: "Full Day (1.0 Day)" },
  { value: "MORNING_SESSION", label: "Section 1 - Morning (0.5 Day)" },
  { value: "AFTERNOON_SESSION", label: "Section 2 - Afternoon (0.5 Day)" },
];

export function LeaveModal({ isOpen, onClose, onSuccess, editLeave }: LeaveModalProps) {
  const dispatch = useAppDispatch();
  const isEdit = !!editLeave;

  const leaveForm = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leaveType: "ANNUAL",
      leaveSession: "FULL_DAY",
      startDate: getTodayLocalDateString(),
      endDate: getTodayLocalDateString(),
      reason: "",
    },
  });

  const {
    formState: { errors: leaveErrors, isSubmitting: isSubmittingLeave, isDirty: isDirtyLeave },
    reset,
    watch,
    handleSubmit,
  } = leaveForm;

  const selectedLeaveType = watch("leaveType");
  const watchSession = watch("leaveSession");
  const watchStart = watch("startDate");
  const watchEnd = watch("endDate");

  // Dynamic calculated leave duration preview
  const calculatedDays = useMemo(() => {
    if (!watchStart || !watchEnd) return 0;
    const start = new Date(watchStart);
    const end = new Date(watchEnd);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const rawDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const multiplier = watchSession === "MORNING_SESSION" || watchSession === "AFTERNOON_SESSION" ? 0.5 : 1.0;
    return Math.round(rawDays * multiplier * 10) / 10;
  }, [watchStart, watchEnd, watchSession]);

  useEffect(() => {
    if (isOpen) {
      if (isEdit && editLeave) {
        const knownTypes = ["ANNUAL", "SICK", "UNPAID", "MATERNITY", "SPECIAL"];
        const isKnown = knownTypes.includes(editLeave.leaveTypeEnum as string);
        reset({
          leaveType: isKnown ? (editLeave.leaveTypeEnum as string) : "OTHER",
          otherLeaveType: isKnown ? "" : (editLeave.leaveTypeEnum as string),
          leaveSession: editLeave.leaveSession || "FULL_DAY",
          startDate: editLeave.startDate,
          endDate: editLeave.endDate,
          reason: editLeave.reason,
        });
      } else {
        reset({
          leaveType: "ANNUAL",
          leaveSession: "FULL_DAY",
          startDate: getTodayLocalDateString(),
          endDate: getTodayLocalDateString(),
          reason: "",
        });
      }
    }
  }, [isOpen, isEdit, editLeave, reset]);

  const onLeaveSubmit = async (data: LeaveFormValues) => {
    try {
      const finalLeaveType =
        data.leaveType === "OTHER" && data.otherLeaveType?.trim()
          ? data.otherLeaveType.trim()
          : data.leaveType;

      if (isEdit && editLeave) {
        await dispatch(
          updateLeaveService({
            id: editLeave.id,
            leaveTypeEnum: finalLeaveType,
            leaveSession: data.leaveSession as any,
            startDate: data.startDate,
            endDate: data.endDate,
            reason: data.reason,
          })
        ).unwrap();
        showToast.success("Leave request updated successfully!");
      } else {
        await dispatch(
          createLeaveService({
            leaveTypeEnum: finalLeaveType,
            leaveSession: data.leaveSession as any,
            startDate: data.startDate,
            endDate: data.endDate,
            reason: data.reason,
          })
        ).unwrap();
        showToast.success("Leave application submitted successfully!");
      }

      onClose();
      reset();
      dispatch(fetchLeaveListService({ businessId: AppDefault.BUSINESS_ID }));
      dispatch(fetchMyLeaveBalanceService());
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit leave application";
      showToast.error(message);
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="xl">
      <FormHeader
        title={isEdit ? "Edit Leave Request" : "Apply Leave"}
        description={isEdit ? "Update the pending leave request details" : "Submit a new employee leave request with section selection"}
        isCreate={!isEdit}
      />
      <form onSubmit={handleSubmit(onLeaveSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden" autoComplete="off">
        <FormBody className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SelectField
              control={leaveForm.control}
              name="leaveType"
              label="Leave Type"
              required
              disabled={isSubmittingLeave || isEdit}
              error={leaveErrors.leaveType}
              options={LEAVE_TYPE_OPTIONS}
            />

            <SelectField
              control={leaveForm.control}
              name="leaveSession"
              label="Leave Duration / Session"
              required
              disabled={isSubmittingLeave}
              error={leaveErrors.leaveSession}
              options={LEAVE_SESSION_OPTIONS}
            />
          </div>

          {selectedLeaveType === "OTHER" && (
            <TextField
              control={leaveForm.control}
              name="otherLeaveType"
              label="Custom Leave Type Name"
              required
              placeholder="e.g. Compassionate Leave, Emergency Leave..."
              disabled={isSubmittingLeave || isEdit}
              error={leaveErrors.otherLeaveType}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DateTimePickerField
              control={leaveForm.control}
              name="startDate"
              label="Start Date"
              mode="date"
              required
              disabled={isSubmittingLeave}
              error={leaveErrors.startDate}
            />
            <DateTimePickerField
              control={leaveForm.control}
              name="endDate"
              label="End Date"
              mode="date"
              required
              disabled={isSubmittingLeave}
              error={leaveErrors.endDate}
            />
          </div>

          {/* Real-time calculated duration badge */}
          <div className="rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 flex items-center justify-between text-xs font-semibold text-primary">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0 text-primary" />
              <span>
                Session:{" "}
                <span className="font-extrabold">
                  {watchSession === "MORNING_SESSION"
                    ? "Section 1 - Morning (0.5 Day)"
                    : watchSession === "AFTERNOON_SESSION"
                    ? "Section 2 - Afternoon (0.5 Day)"
                    : "Full Day (1.0 Day)"}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="font-extrabold text-foreground">{calculatedDays} Day(s) Total</span>
            </div>
          </div>

          <TextareaField
            control={leaveForm.control}
            name="reason"
            label="Reason for Leave"
            required
            disabled={isSubmittingLeave}
            placeholder="Specify the reason for leave..."
            error={leaveErrors.reason}
          />
        </FormBody>

        <FormFooter
          isSubmitting={isSubmittingLeave}
          isDirty={isDirtyLeave || true}
          isCreate={!isEdit}
          createMessage={isEdit ? "Saving changes..." : "Submitting leave..."}
        >
          <CancelButton onClick={onClose} disabled={isSubmittingLeave} />
          <SubmitButton
            isSubmitting={isSubmittingLeave}
            isCreate={!isEdit}
            createText={isEdit ? "Save Changes" : "Submit Application"}
          />
        </FormFooter>
      </form>
    </CustomModal>
  );
}
