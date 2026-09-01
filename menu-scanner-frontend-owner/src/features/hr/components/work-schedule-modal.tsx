"use client";

import React from "react";
import { UserResponseModel } from "@/features/auth/store/models/response/users-response";
import { WorkScheduleModel } from "@/features/hr/store/models/hr-models";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton, SubmitButton } from "@/components/shared/button/custom-button";
import { CustomInput } from "@/components/shared/form-field/custom-input";
import { ComboboxMultiSelectUser } from "@/components/shared/combobox/combobox_multi_select_user";
import { DefaultShiftRosterSection } from "@/features/business/components/default-shift-roster-section";
import { UserCheck } from "lucide-react";
import { Loading } from "@/components/shared/common/loading";
import { DayOfWeekType } from "@/constants/week-days";

export interface DayShiftFieldConfig {
  day: DayOfWeekType;
  label: string;
  short: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
  enableCheckIn?: boolean;
  scanMode?: string;
}

export interface WorkScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: any) => void;
  isSubmitting?: boolean;
  isLoading?: boolean;
  editingSchedule?: WorkScheduleModel | null;
  form?: any;
  selectedUserIds?: string[];
  onChangeSelectedUserIds?: (ids: string[]) => void;
  selectedStaffIds?: string[];
  setSelectedStaffIds?: (ids: string[]) => void;
  staffList?: UserResponseModel[];
  scheduleName?: string;
  setScheduleName?: (val: string) => void;
  dayConfigs: DayShiftFieldConfig[];
  onUpdateDayConfig: (day: DayOfWeekType, field: keyof DayShiftFieldConfig, value: any) => void;
  isFormDirtyOrReady?: boolean;
}

export function WorkScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  isLoading = false,
  editingSchedule = null,
  form,
  selectedUserIds = [],
  onChangeSelectedUserIds,
  selectedStaffIds = [],
  setSelectedStaffIds,
  staffList = [],
  scheduleName: propScheduleName,
  setScheduleName: propSetScheduleName,
  dayConfigs,
  onUpdateDayConfig,
  isFormDirtyOrReady = true,
}: WorkScheduleModalProps) {
  const isCreate = !editingSchedule;

  const effectiveSelectedUserIds = form
    ? form.watch("userIds") || selectedUserIds
    : selectedStaffIds.length > 0 ? selectedStaffIds : selectedUserIds;

  const handleStaffChange = (ids: string[]) => {
    if (form) {
      form.setValue("userIds", ids, { shouldDirty: true });
    }
    if (onChangeSelectedUserIds) onChangeSelectedUserIds(ids);
    if (setSelectedStaffIds) setSelectedStaffIds(ids);
  };

  const scheduleName = form
    ? form.watch("name") || ""
    : propScheduleName || "";

  const handleNameChange = (val: string) => {
    if (form) {
      form.setValue("name", val, { shouldDirty: true });
    }
    if (propSetScheduleName) propSetScheduleName(val);
  };

  const selectedStaffMember = effectiveSelectedUserIds.length === 1
    ? (editingSchedule?.userInfo || staffList.find((u) => u.id === effectiveSelectedUserIds[0]))
    : null;

  const staffDisplayName = selectedStaffMember
    ? (selectedStaffMember.fullName || `${selectedStaffMember.firstName || ""} ${selectedStaffMember.lastName || ""}`.trim())
    : "Staff Member";

  const staffUserIdentifier = selectedStaffMember
    ? (selectedStaffMember.userIdentifier || selectedStaffMember.email || selectedStaffMember.phoneNumber || "")
    : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form) {
      form.handleSubmit(onSubmit)(e);
    } else {
      onSubmit(e);
    }
  };

  const handleUpdateDayShift = (idx: number, field: any, value: any) => {
    const targetConfig = dayConfigs[idx];
    if (targetConfig) {
      onUpdateDayConfig(targetConfig.day, field as keyof DayShiftFieldConfig, value);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
    >
      <FormHeader
        title={isCreate ? "Create Staff Work Schedule" : "Edit Staff Work Schedule"}
        description={
          isCreate
            ? "Configure staff assignment, schedule name, and weekly shift working hours"
            : "Update shift working hours and scan rules for this schedule"
        }
        isCreate={isCreate}
      />

      {isLoading ? (
        <div className="py-12 flex justify-center items-center flex-1">
          <Loading />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <FormBody contentClassName="space-y-4 p-4 sm:p-5">
            {/* Top Form Row: Assigned Staff & Schedule Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Assigned Staff Input/Readonly Card */}
              <div className="space-y-1">
                {!isCreate ? (
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[11px] font-extrabold text-foreground leading-tight flex items-center min-h-[16px]">
                      Assigned Staff Member
                    </label>
                    <div className="flex items-center gap-2.5 px-3 rounded-[8px] bg-muted/30 border border-border/80 h-[36px] min-w-0">
                      <UserCheck className="h-4 w-4 text-primary shrink-0" />
                      <div className="flex items-center gap-1.5 truncate min-w-0 flex-1">
                        <span className="text-xs sm:text-sm font-normal text-foreground truncate">
                          {staffDisplayName}
                        </span>
                        {staffUserIdentifier && (
                          <span className="text-xs sm:text-sm font-normal text-foreground truncate">
                            ({staffUserIdentifier})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <ComboboxMultiSelectUser
                    selectedUserIds={effectiveSelectedUserIds}
                    onChangeSelectedUserIds={handleStaffChange}
                    label="Assign Staff Members"
                    required={false}
                    disabled={isSubmitting}
                    placeholder="Select staff or leave blank for all"
                  />
                )}
              </div>

              {/* Schedule Name */}
              <div className="space-y-1">
                <CustomInput
                  label="Schedule Name"
                  required
                  value={scheduleName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Morning Shift Roster"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Reuse DefaultShiftRosterSection Component */}
            <DefaultShiftRosterSection
              dayShifts={dayConfigs}
              onUpdateDayShift={handleUpdateDayShift}
              disabled={isSubmitting}
            />
          </FormBody>

          <FormFooter
            isSubmitting={isSubmitting}
            isDirty={isFormDirtyOrReady}
            isCreate={isCreate}
            createMessage="Saving Schedule..."
            updateMessage="Updating Schedule..."
          >
            <CancelButton onClick={onClose} disabled={isSubmitting || isLoading} />
            <SubmitButton
              isSubmitting={isSubmitting || isLoading}
              isDirty={isFormDirtyOrReady}
              isCreate={isCreate}
              createText="Save Schedule"
              updateText="Update Schedule"
            />
          </FormFooter>
        </form>
      )}
    </CustomModal>
  );
}
