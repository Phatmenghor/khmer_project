"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/store";
import { createLeaveService, fetchLeaveListService } from "@/features/hr/store/thunks/hr-thunks";
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
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { showToast } from "@/components/shared/common/show-toast";
import { getTodayLocalDateString } from "@/utils/date/date-time-format";
import { AppDefault } from "@/constants/app-resource/default/default";

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LeaveModal({ isOpen, onClose, onSuccess }: LeaveModalProps) {
  const dispatch = useAppDispatch();

  const leaveForm = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leaveType: "ANNUAL",
      startDate: getTodayLocalDateString(),
      endDate: getTodayLocalDateString(),
      reason: "",
      attachmentImage: "",
    },
  });

  const {
    formState: { errors: leaveErrors, isSubmitting: isSubmittingLeave, isDirty: isDirtyLeave },
    reset,
    watch,
    setValue,
    handleSubmit,
  } = leaveForm;

  const selectedLeaveType = watch("leaveType");

  useEffect(() => {
    if (isOpen) {
      reset({
        leaveType: "ANNUAL",
        startDate: getTodayLocalDateString(),
        endDate: getTodayLocalDateString(),
        reason: "",
        attachmentImage: "",
      });
    }
  }, [isOpen, reset]);

  const onLeaveSubmit = async (data: LeaveFormValues) => {
    try {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

      const finalLeaveType =
        data.leaveType === "OTHER" && data.otherLeaveType?.trim()
          ? data.otherLeaveType.trim()
          : data.leaveType;

      await dispatch(
        createLeaveService({
          leaveTypeEnum: finalLeaveType,
          startDate: data.startDate,
          endDate: data.endDate,
          totalDays,
          reason: data.reason,
          attachmentImage: data.attachmentImage,
        })
      ).unwrap();

      showToast.success("Leave application submitted successfully!");
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
        title="Apply Leave"
        description="Submit a new employee leave request"
        isCreate={true}
      />
      <form onSubmit={handleSubmit(onLeaveSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden" autoComplete="off">
        <FormBody className="space-y-3.5">
          <SelectField
            control={leaveForm.control}
            name="leaveType"
            label="Leave Type"
            required
            disabled={isSubmittingLeave}
            error={leaveErrors.leaveType}
            options={[
              { value: "ANNUAL", label: "Annual Leave" },
              { value: "SICK", label: "Sick Leave" },
              { value: "UNPAID", label: "Unpaid Leave" },
              { value: "MATERNITY", label: "Maternity / Paternity Leave" },
              { value: "SPECIAL", label: "Special / Casual Leave" },
              { value: "OTHER", label: "Other (Custom Leave Type)" },
            ]}
          />

          {selectedLeaveType === "OTHER" && (
            <TextField
              control={leaveForm.control}
              name="otherLeaveType"
              label="Custom Leave Type Name"
              required
              placeholder="e.g. Compassionate Leave, Emergency Leave..."
              disabled={isSubmittingLeave}
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

          <ClickableImageUpload
            label="Attachment Image / Document (Optional)"
            value={watch("attachmentImage")}
            onChange={(base64) => setValue("attachmentImage", base64, { shouldDirty: true })}
            disabled={isSubmittingLeave}
            placeholder="Click to attach medical certificate or document photo"
            aspectRatio="banner"
            height="h-32"
          />
        </FormBody>

        <FormFooter
          isSubmitting={isSubmittingLeave}
          isDirty={isDirtyLeave || true}
          isCreate={true}
          createMessage="Submitting leave..."
        >
          <CancelButton onClick={onClose} disabled={isSubmittingLeave} />
          <SubmitButton isSubmitting={isSubmittingLeave} isCreate={true} createText="Submit Application" />
        </FormFooter>
      </form>
    </CustomModal>
  );
}
