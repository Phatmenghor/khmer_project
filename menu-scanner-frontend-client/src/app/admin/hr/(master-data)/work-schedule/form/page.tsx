"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TextField } from "@/components/shared/form-field/text-field";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { SubmitButton } from "@/components/shared/button/submit-button";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { MultiSelectDaysField } from "@/components/shared/form-field/multi-select-days-field";
import { TimePickerField } from "@/components/shared/form-field/time-picker-field";
import { ComboboxSelectUser } from "@/components/shared/combobox/combobox_select_user";
import { ComboboxSelectScheduleType } from "@/components/shared/combobox/combobox_select_schedule_type";
import { Loading } from "@/components/shared/common/loading";
import { showToast } from "@/components/shared/common/show-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectUser } from "@/features/auth/store/selectors/auth-selectors";
import { UserResponseModel } from "@/features/auth/store/models/response/users-response";
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "@/features/hr/store/selectors/work-schedule-selectors";
import {
  createWorkScheduleSchema,
  updateWorkScheduleSchema,
  WorkScheduleFormData,
} from "@/features/hr/store/models/schema/work-schedule.schema";
import {
  createWorkScheduleService,
  fetchWorkScheduleByIdService,
  updateWorkScheduleService,
} from "@/features/hr/store/thunks/work-schedule-thunks";
import {
  clearError,
  clearSelectedWorkSchedule,
} from "@/features/hr/store/slice/work-schedule-slice";
import {
  CreateWorkScheduleRequest,
  UpdateWorkScheduleRequest,
} from "@/features/hr/store/models/request/work-schedule-request";
import { DayOfWeek } from "@/types/business-profile";
import { AppDefault } from "@/constants/app-resource/default/default";
import { ROUTES } from "@/constants/app-routes/routes";

const DEFAULT_WORK_DAYS: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
];

function WorkScheduleFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);

  const workScheduleId = searchParams.get("id");
  const isCreate = !workScheduleId;

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  const [selectedUser, setSelectedUser] = useState<UserResponseModel | null>(null);
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

  useEffect(() => {
    const fetchScheduleData = async () => {
      if (!workScheduleId || isCreate) return;

      try {
        const resultAction = await dispatch(fetchWorkScheduleByIdService(workScheduleId));

        if (fetchWorkScheduleByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          if (data.userInfo) {
            setSelectedUser(data.userInfo as UserResponseModel);
          }
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
      } catch {}
    };

    fetchScheduleData();
  }, [workScheduleId, isCreate, dispatch, reset, currentUser?.userId]);

  useEffect(() => {
    dispatch(clearError());
    return () => {
      dispatch(clearSelectedWorkSchedule());
      dispatch(clearError());
    };
  }, [dispatch]);

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
          breakStartTime: data.breakStartTime || undefined,
          breakEndTime: data.breakEndTime || undefined,
        };

        const result = await dispatch(createWorkScheduleService(payload)).unwrap();
        showToast.success(`Work schedule "${result.name}" created successfully`);
      } else {
        const payload: UpdateWorkScheduleRequest = {
          name: data.name,
          scheduleTypeEnum: data.scheduleTypeEnum,
          workDays: data.workDays,
          startTime: data.startTime,
          endTime: data.endTime,
          breakStartTime: data.breakStartTime || undefined,
          breakEndTime: data.breakEndTime || undefined,
        };

        const result = await dispatch(
          updateWorkScheduleService({ id: data.id || "", param: payload }),
        ).unwrap();
        showToast.success(`Work schedule "${result.name}" updated successfully`);
      }

      router.push(ROUTES.HR.WORK_SCHEDULE);
    } catch (error: unknown) {
      showToast.error(
        (error as { message?: string })?.message ||
          `Failed to ${isCreate ? "create" : "update"} work schedule`,
      );
    }
  };

  const handleBack = () => {
    router.push(ROUTES.HR.WORK_SCHEDULE);
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <Card>
        <CardContent className="py-2 sm:py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xs sm:text-xs font-bold">
              {isCreate ? "Create Work Schedule" : "Edit Work Schedule"}
            </h1>
          </div>
        </CardContent>
      </Card>

      <Card>
        {!isCreate && isFetchingDetail ? (
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <Loading />
          </CardContent>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <FormBody>
              {reduxError && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded">
                  <p className="text-xs text-destructive font-medium">{reduxError}</p>
                </div>
              )}

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

              <TextField
                control={control}
                name="name"
                label="Schedule Name"
                placeholder="Enter schedule name"
                required
                disabled={isSubmitting}
                error={errors.name}
              />

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

              <MultiSelectDaysField
                control={control}
                name="workDays"
                label="Work Days"
                required
                disabled={isSubmitting}
                error={errors.workDays as any}
                defaultDays={DEFAULT_WORK_DAYS}
              />

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TimePickerField
                    control={control}
                    name="startTime"
                    label="Start Time"
                    placeholder="Select start time"
                    required
                    disabled={isSubmitting}
                    error={errors.startTime}
                  />
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

                <div className="border-t pt-3">
                  <h3 className="text-xs font-medium text-gray-600 mb-2">
                    Break Times (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TimePickerField
                      control={control}
                      name="breakStartTime"
                      label="Break Start Time"
                      placeholder="Select break start time"
                      disabled={isSubmitting}
                      error={errors.breakStartTime}
                    />
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
              <CancelButton onClick={handleBack} disabled={isSubmitting} />
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
      </Card>
    </div>
  );
}

export default function WorkScheduleFormPage() {
  return (
    <Suspense>
      <WorkScheduleFormInner />
    </Suspense>
  );
}
