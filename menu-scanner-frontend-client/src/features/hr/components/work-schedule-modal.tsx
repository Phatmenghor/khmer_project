"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Calendar } from "lucide-react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { TextField } from "@/components/shared/form-field/text-field";
import { ShiftTimePickerField } from "@/components/shared/form-field/shift-time-picker-field";
import { DayDutyHeaderField } from "@/components/shared/form-field/day-duty-header-field";
import { ComboboxMultiSelectUser } from "@/components/shared/combobox/combobox_multi_select_user";
import { CancelButton, SubmitButton } from "@/components/shared/button/custom-button";
import { showToast } from "@/components/shared/common/show-toast";
import { Loading } from "@/components/shared/common/loading";
import { WorkScheduleFormValues } from "@/features/hr/store/models/schema/hr.schema";
import {
  WorkScheduleModel,
  getUserDisplayName,
  getUserRolesDisplay,
  getUserIdentifierDisplay,
} from "@/features/hr/store/models/hr-models";
import { DayOfWeek } from "@/types/business-profile";
import { cn } from "@/lib/utils";

export interface DayShiftFieldConfig {
  day: DayOfWeek;
  label: string;
  short: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
}

interface WorkScheduleModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  editingSchedule: WorkScheduleModel | null;
  form: UseFormReturn<WorkScheduleFormValues>;
  selectedUserIds: string[];
  onChangeSelectedUserIds: (ids: string[]) => void;
  dayConfigs: DayShiftFieldConfig[];
  onUpdateDayConfig: (day: DayOfWeek, field: keyof DayShiftFieldConfig, value: any) => void;
  onSubmit: (data: WorkScheduleFormValues) => Promise<void>;
  isFormDirtyOrReady: boolean;
}

export function WorkScheduleModal({
  isOpen,
  isLoading = false,
  onClose,
  editingSchedule,
  form,
  selectedUserIds,
  onChangeSelectedUserIds,
  dayConfigs,
  onUpdateDayConfig,
  onSubmit,
  isFormDirtyOrReady,
}: WorkScheduleModalProps) {
  const { formState: { errors, isSubmitting } } = form;

  const staffName = getUserDisplayName(editingSchedule?.userInfo);
  const userIdentifier = getUserIdentifierDisplay(editingSchedule?.userInfo);
  const rolesDisplay = getUserRolesDisplay(editingSchedule?.userInfo);

  const onFormInvalid = (formErrors: any) => {
    console.warn("WorkScheduleForm validation errors:", formErrors);
    const firstError = Object.values(formErrors)[0] as any;
    if (firstError?.message) {
      showToast.error(firstError.message);
    } else {
      showToast.error("Please fill in all required fields.");
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="4xl">
      <FormHeader
        title={editingSchedule ? "Edit Schedule" : "New Schedule"}
        description={
          editingSchedule
            ? "Update shift roster and day mappings"
            : "Configure shift roster with per-day 4-field shift mapping"
        }
        isCreate={!editingSchedule}
      />
      <form onSubmit={form.handleSubmit(onSubmit, onFormInvalid)} className="flex flex-col flex-1 min-h-0 overflow-hidden" autoComplete="off">
        <FormBody>
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[380px] w-full flex-1">
              <Loading />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* On Create: ComboboxMultiSelectUser / On Edit: Dedicated Read-Only Staff Display Field */}
                {!editingSchedule ? (
                  <ComboboxMultiSelectUser
                    control={form.control}
                    name="userIds"
                    selectedUserIds={selectedUserIds}
                    onChangeSelectedUserIds={onChangeSelectedUserIds}
                    disabled={isSubmitting}
                    label="Assign Staff Members"
                    required={true}
                    placeholder="Select staff members..."
                    error={errors.userIds?.message}
                  />
                ) : (
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs font-semibold text-foreground leading-tight flex items-center min-h-[16px]">
                      Assigned Staff Member
                    </label>
                    <div className="h-[36px] px-3 rounded-[12px] border border-border bg-muted/50 shadow-2xs flex items-center justify-between gap-2 text-base md:text-sm font-normal text-foreground">
                      <span className="truncate">{staffName}</span>
                      {userIdentifier && userIdentifier !== staffName ? (
                        <span className="text-base md:text-sm text-muted-foreground font-normal truncate">
                          {userIdentifier}
                        </span>
                      ) : (
                        <span className="text-base md:text-sm text-muted-foreground font-normal truncate ml-auto">
                          {rolesDisplay}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Form-Controlled TextField Component */}
                <TextField
                  control={form.control}
                  name="name"
                  label="Schedule Name"
                  required
                  disabled={isSubmitting}
                  placeholder="E.g. Full-Time Shift, Morning Roster"
                  error={errors.name}
                />
              </div>

              {/* 7-Day Diagram Roster Table Header Banner */}
              <div className="space-y-3 pt-2 border-t border-border/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-muted/30 border border-border/60">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-foreground">
                        Per-Day Shift Mapping Diagram
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        Configure custom shift times per day (Break times are optional for single-session shifts)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Full Un-nested List of 7 Days */}
                <div className="space-y-2.5">
                  {dayConfigs.map((config) => (
                    <div
                      key={config.day}
                      className={cn(
                        "p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 bg-card",
                        config.enabled
                          ? "border-primary/50 ring-1 ring-primary/20 shadow-2xs"
                          : "border-border/60"
                      )}
                    >
                      {/* Day Name with Direct Clickable Checkbox */}
                      <DayDutyHeaderField
                        label={config.label}
                        enabled={config.enabled}
                        onToggle={() => onUpdateDayConfig(config.day, "enabled", !config.enabled)}
                        disabled={isSubmitting}
                      />

                      {/* 4 Custom ShiftTimePickerField Form Components per Day */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 flex-1 items-center">
                        {/* 1. Start Time (Required *) */}
                        <ShiftTimePickerField
                          label="Start Time"
                          required={true}
                          value={config.startTime}
                          onChange={(val) => onUpdateDayConfig(config.day, "startTime", val)}
                          disabled={isSubmitting}
                          placeholder="Select time"
                          iconColorClassName="text-emerald-600"
                        />

                        {/* 2. End Time (Required *) */}
                        <ShiftTimePickerField
                          label="End Time"
                          required={true}
                          value={config.endTime}
                          onChange={(val) => onUpdateDayConfig(config.day, "endTime", val)}
                          disabled={isSubmitting}
                          placeholder="Select time"
                          iconColorClassName="text-amber-600"
                        />

                        {/* 3. Break Start (Optional) */}
                        <ShiftTimePickerField
                          label="Break Start"
                          required={false}
                          value={config.breakStartTime}
                          onChange={(val) => onUpdateDayConfig(config.day, "breakStartTime", val)}
                          disabled={isSubmitting}
                          placeholder="Optional"
                          iconColorClassName="text-blue-600"
                        />

                        {/* 4. Break End (Optional) */}
                        <ShiftTimePickerField
                          label="Break End"
                          required={false}
                          value={config.breakEndTime}
                          onChange={(val) => onUpdateDayConfig(config.day, "breakEndTime", val)}
                          disabled={isSubmitting}
                          placeholder="Optional"
                          iconColorClassName="text-purple-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </FormBody>
        <FormFooter
          isSubmitting={isSubmitting}
          isDirty={true}
          isCreate={!editingSchedule}
          createMessage="Saving schedule..."
          updateMessage="Updating schedule..."
        >
          <CancelButton onClick={onClose} disabled={isSubmitting || isLoading} />
          <SubmitButton
            isSubmitting={isSubmitting || isLoading}
            isDirty={true}
            isCreate={!editingSchedule}
            createText="Save Schedule"
            updateText="Update Schedule"
            submittingCreateText="Saving..."
            submittingUpdateText="Updating..."
          />
        </FormFooter>
      </form>
    </CustomModal>
  );
}
