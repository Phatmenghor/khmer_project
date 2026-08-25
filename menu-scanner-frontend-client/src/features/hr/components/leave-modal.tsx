"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/store";
import { createLeaveService, updateLeaveService, fetchLeaveListService } from "@/features/hr/store/thunks/hr-thunks";
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

export function LeaveModal({ isOpen, onClose, onSuccess, editLeave }: LeaveModalProps) {
  const dispatch = useAppDispatch();
  const isEdit = !!editLeave;

  const leaveForm = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leaveType: "ANNUAL",
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

  useEffect(() => {
    if (isOpen) {
      if (isEdit && editLeave) {
        // Determine the leaveType select value
        const knownTypes = ["ANNUAL", "SICK", "UNPAID", "MATERNITY", "SPECIAL"];
        const isKnown = knownTypes.includes(editLeave.leaveTypeEnum as string);
        reset({
          leaveType: isKnown ? (editLeave.leaveTypeEnum as string) : "OTHER",
          otherLeaveType: isKnown ? "" : (editLeave.leaveTypeEnum as string),
          startDate: editLeave.startDate,
          endDate: editLeave.endDate,
          reason: editLeave.reason,
        });
      } else {
        reset({
          leaveType: "ANNUAL",
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
        description={isEdit ? "Update the pending leave request details" : "Submit a new employee leave request"}
        isCreate={!isEdit}
      />
      <form onSubmit={handleSubmit(onLeaveSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden" autoComplete="off">
        <FormBody className="space-y-3.5">
          <SelectField
            control={leaveForm.control}
            name="leaveType"
            label="Leave Type"
            required
            disabled={isSubmittingLeave || isEdit} // can't change type on edit
            error={leaveErrors.leaveType}
            options={LEAVE_TYPE_OPTIONS}
          />

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
