"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { ModalMode } from "@/constants/status/status";
import { AppDefault } from "@/constants/app-resource/default/default";
import { selectUser } from "@/redux/features/auth/store/selectors/auth-selectors";
import { UserResponseModel } from "@/redux/features/auth/store/models/response/users-response";
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "../store/selectors/work-schedule-selectors";
import {
  createWorkScheduleSchema,
  updateWorkScheduleSchema,
  WorkScheduleFormData,
} from "../store/models/schema/work-schedule.schema";
import {
  createWorkScheduleService,
  fetchWorkScheduleByIdService,
  updateWorkScheduleService,
} from "../store/thunks/work-schedule-thunks";
import {
  clearError,
  clearSelectedWorkSchedule,
} from "../store/slice/work-schedule-slice";
import {
  CreateWorkScheduleRequest,
  UpdateWorkScheduleRequest,
} from "../store/models/request/work-schedule-request";
import { MultiSelectDaysField } from "@/components/shared/form-field/multi-select-days-field";
import { TimePickerField } from "@/components/shared/form-field/time-picker-field";
import { ComboboxSelectUser } from "@/components/shared/combobox/combobox_select_user";
import { ComboboxSelectScheduleType } from "@/components/shared/combobox/combobox_select_schedule_type";
import { DayOfWeek } from "@/types/business-profile";
import { WorkScheduleTypeFormData } from "../store/models/schema/work-schedule-type.schema";
import { Loading } from "@/components/shared/common/loading";

// Default working days: Monday to Friday
const DEFAULT_WORK_DAYS: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
];

type Props = {
  mode: ModalMode;
  workScheduleId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function WorkScheduleModal({
  isOpen,
  onClose,
  workScheduleId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  // State for combobox selections
  const [selectedUser, setSelectedUser] = useState<UserResponseModel | null>(
    null,
  );
  const [selectedScheduleType, setSelectedScheduleType] = useState<string>("");

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<WorkScheduleFormData>({
    resolver: zodResolver(
      isCreate ? createWorkScheduleSchema : updateWorkScheduleSchema,
    ) as any,
    defaultValues: {
      id: "",
      userId: currentUser?.userId || "",
      businessId: AppDefault.BUSINESS_ID,
      name: "",
      scheduleTypeEnum: "",
      workDays: DEFAULT_WORK_DAYS,
      startTime: "",
      endTime: "",
      breakStartTime: "",
      breakEndTime: "",
    },
    mode: "onChange",
  });

  // Fetch data in edit mode
  useEffect(() => {
    const fetchScheduleData = async () => {
      if (!workScheduleId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(
          fetchWorkScheduleByIdService(workScheduleId),
        );

        if (fetchWorkScheduleByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          // Set the selected user
          if (data.userInfo) {
            setSelectedUser(data.userInfo as UserResponseModel);
          }

          // Set the selected schedule type
          if (data.scheduleTypeEnum) {
            setSelectedScheduleType(data.scheduleTypeEnum);
          }

          reset({
            id: data.id,
            userId: data.userInfo?.id || currentUser?.userId || "",
            businessId: data.businessId || AppDefault.BUSINESS_ID,
            name: data.name || "",
            scheduleTypeEnum: data.scheduleTypeEnum || "",
            workDays: (data.workDays || []) as DayOfWeek[],
            startTime: data.startTime || "",
            endTime: data.endTime || "",
            breakStartTime: data.breakStartTime || "",
            breakEndTime: data.breakEndTime || "",
          });
        }
      } catch (error) {
        console.error("Error fetching work schedule data:", error);
      }
    };

    fetchScheduleData();
  }, [workScheduleId, isOpen, isCreate, dispatch, reset, currentUser?.userId]);

  // Reset form for create mode
  useEffect(() => {
    if (isOpen && isCreate) {
      setSelectedUser(null);
      setSelectedScheduleType("");
      reset({
        userId: currentUser?.userId || "",
        businessId: AppDefault.BUSINESS_ID,
        name: "",
        scheduleTypeEnum: "",
        workDays: DEFAULT_WORK_DAYS,
        startTime: "",
        endTime: "",
        breakStartTime: "",
        breakEndTime: "",
      });
    }
  }, [isOpen, isCreate, reset, currentUser?.userId]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: WorkScheduleFormData) => {
    try {
      if (isCreate) {
        const payload: CreateWorkScheduleRequest = {
          userId: data.userId,
          businessId: data.businessId,
          name: data.name,
          scheduleTypeEnum: data.scheduleTypeEnum,
          workDays: data.workDays,
          startTime: data.startTime,
          endTime: data.endTime,
          breakStartTime: data.breakStartTime,
          breakEndTime: data.breakEndTime,
        };

        const result = await dispatch(
          createWorkScheduleService(payload),
        ).unwrap();

        showToast.success(
          `Work schedule "${result.name}" created successfully`,
        );
        handleClose();
      } else {
        const payload: UpdateWorkScheduleRequest = {
          name: data.name,
          scheduleTypeEnum: data.scheduleTypeEnum,
          workDays: data.workDays,
          startTime: data.startTime,
          endTime: data.endTime,
          breakStartTime: data.breakStartTime,
          breakEndTime: data.breakEndTime,
        };

        const result = await dispatch(
          updateWorkScheduleService({ id: data.id || "", param: payload }),
        ).unwrap();

        showToast.success(
          `Work schedule "${result.name}" updated successfully`,
        );
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error?.message ||
          `Failed to ${isCreate ? "create" : "update"} work schedule`,
      );
    }
  };

  const handleClose = () => {
    reset();
    setSelectedUser(null);
    setSelectedScheduleType("");
    dispatch(clearError());
    dispatch(clearSelectedWorkSchedule());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Work Schedule" : "Edit Work Schedule"}
          description={
            isCreate
              ? "Fill out the form to create a new work schedule"
              : "Update work schedule information below"
          }
        />

        {!isCreate && isFetchingDetail ? (
          <div className="p-6 flex items-center justify-center min-h-[400px] flex-1">
            <Loading />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <FormBody>
              {reduxError && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-sm text-destructive font-medium">
                    {reduxError}
                  </p>
                </div>
              )}

              {/* User Selection */}
              <ComboboxSelectUser
                dataSelect={selectedUser}
                onChangeSelected={(user) => {
                  setSelectedUser(user);
                  setValue("userId", user?.id || "", {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                disabled={isSubmitting}
                label="Select User"
                required
                error={errors.userId?.message}
              />

              {/* Schedule Name */}
              <TextField
                control={control}
                name="name"
                label="Schedule Name"
                placeholder="Enter schedule name"
                required
                disabled={isSubmitting}
                error={errors.name}
              />

              {/* Schedule Type */}
              <ComboboxSelectScheduleType
                value={selectedScheduleType}
                onValueChange={(value) => {
                  setSelectedScheduleType(value);
                  setValue("scheduleTypeEnum", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                disabled={isSubmitting}
                label="Schedule Type"
                required
                placeholder="Select schedule type"
                error={errors.scheduleTypeEnum?.message}
              />

              {/* Work Days */}
              <MultiSelectDaysField
                control={control}
                name="workDays"
                label="Work Days"
                required
                disabled={isSubmitting}
                error={errors.workDays as any}
                defaultDays={DEFAULT_WORK_DAYS}
              />

              {/* Time Section - Required Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Time */}
                  <TimePickerField
                    control={control}
                    name="startTime"
                    label="Start Time"
                    placeholder="Select start time"
                    required
                    disabled={isSubmitting}
                    error={errors.startTime}
                  />

                  {/* End Time */}
                  <TimePickerField
                    control={control}
                    name="endTime"
                    label="End Time"
                    placeholder="Select end time"
                    required
                    disabled={isSubmitting}
                    error={errors.endTime}
                  />
                </div>

                {/* Break Times - Optional Fields */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-3">
                    Break Times (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Break Start Time */}
                    <TimePickerField
                      control={control}
                      name="breakStartTime"
                      label="Break Start Time"
                      placeholder="Select break start time"
                      disabled={isSubmitting}
                      error={errors.breakStartTime}
                    />

                    {/* Break End Time */}
                    <TimePickerField
                      control={control}
                      name="breakEndTime"
                      label="Break End Time"
                      placeholder="Select break end time"
                      disabled={isSubmitting}
                      error={errors.breakEndTime}
                    />
                  </div>
                </div>
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage="Creating work schedule..."
              updateMessage="Updating work schedule..."
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Work Schedule"
                updateText="Update Work Schedule"
                submittingCreateText="Creating..."
                submittingUpdateText="Updating..."
              />
            </FormFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
