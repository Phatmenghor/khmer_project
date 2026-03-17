"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { ModalMode } from "@/constants/status/status";
import { clearError, clearSelectedLeave } from "../store/slice/leave-slice";
import { FormHeader } from "@/components/shared/form-field/form-header";
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "../store/selectors/leave-selectors";
import {
  createLeaveSchema,
  LeaveFormData,
  updateLeaveSchema,
} from "../store/models/schema/leave.schema";
import { ComboboxSelectLeaveType } from "@/components/shared/combobox/combobox_select_leave_type";
import {
  createLeaveService,
  fetchLeaveByIdService,
  updateLeaveService,
} from "../store/thunks/leave-thunks";
import {
  CreateLeaveRequest,
  UpdateLeaveRequest,
} from "../store/models/request/leave-request";
import { Check, X } from "lucide-react";
import { Loading } from "@/components/shared/common/loading";

type Props = {
  mode: ModalMode;
  leaveId?: string;
  onClose: () => void;
  isOpen: boolean;
  onApprove?: (leave: any) => void;
  onReject?: (leave: any) => void;
};

export default function LeaveModal({
  isOpen,
  onClose,
  leaveId,
  mode,
  onApprove,
  onReject,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  const [currentLeaveData, setCurrentLeaveData] = useState<any>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<LeaveFormData>({
    resolver: zodResolver(
      isCreate ? createLeaveSchema : updateLeaveSchema,
    ) as any,
    defaultValues: {
      id: "",
      leaveTypeEnum: "",
      startDate: "",
      endDate: "",
      reason: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchLeaveData = async () => {
      if (!leaveId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(fetchLeaveByIdService(leaveId));

        if (fetchLeaveByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          setCurrentLeaveData(data);

          reset({
            id: data.id,
            leaveTypeEnum: data.leaveTypeEnum || "",
            startDate: data.startDate || "",
            endDate: data.endDate || "",
            reason: data.reason || "",
          });
        }
      } catch (error) {
        console.error("Error fetching leave data:", error);
      }
    };

    fetchLeaveData();
  }, [leaveId, isOpen, isCreate, dispatch, reset]);

  // Reset form for create mode
  useEffect(() => {
    if (isOpen && isCreate) {
      reset({
        id: "",
        leaveTypeEnum: "",
        startDate: "",
        endDate: "",
        reason: "",
      });
    }
  }, [isOpen, isCreate, reset]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: LeaveFormData) => {
    try {
      if (isCreate) {
        const payload: CreateLeaveRequest = {
          leaveTypeEnum: data.leaveTypeEnum,
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
        };

        await dispatch(createLeaveService(payload)).unwrap();

        showToast.success(`Leave request created successfully`);
        handleClose();
      } else {
        const payload: UpdateLeaveRequest = {
          leaveTypeEnum: data.leaveTypeEnum,
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
        };

        await dispatch(
          updateLeaveService({ id: data.id, param: payload }),
        ).unwrap();

        showToast.success(`Leave request updated successfully`);
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error || `Failed to ${isCreate ? "create" : "update"} leave request`,
      );
    }
  };

  const handleClose = () => {
    reset();
    setCurrentLeaveData(null);
    dispatch(clearError());
    dispatch(clearSelectedLeave());
    onClose();
  };

  const handleApprove = () => {
    if (currentLeaveData && onApprove) {
      onApprove(currentLeaveData);
      handleClose();
    }
  };

  const handleReject = () => {
    if (currentLeaveData && onReject) {
      onReject(currentLeaveData);
      handleClose();
    }
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;
  const isPending = currentLeaveData?.status === "PENDING";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Leave Request" : "Edit Leave Request"}
          description={
            isCreate
              ? "Fill out the form to create a new leave request"
              : "Update leave request information below"
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

              <Controller
                control={control}
                name="leaveTypeEnum"
                render={({ field }) => (
                  <ComboboxSelectLeaveType
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                    label="Leave Type"
                    required
                    placeholder="Select leave type..."
                    error={errors.leaveTypeEnum?.message}
                  />
                )}
              />

              <DateTimePickerField
                control={control}
                name="startDate"
                label="Start Date"
                placeholder="Select start date"
                required
                disabled={isSubmitting}
                error={errors.startDate}
                mode="date"
              />

              <DateTimePickerField
                control={control}
                name="endDate"
                label="End Date"
                placeholder="Select end date"
                required
                disabled={isSubmitting}
                error={errors.endDate}
                mode="date"
              />

              <TextareaField
                control={control}
                name="reason"
                label="Reason"
                placeholder="Enter reason for leave request"
                rows={5}
                required
                disabled={isSubmitting}
                error={errors.reason}
              />
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage="Creating leave request..."
              updateMessage="Updating leave request..."
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {!isCreate && isPending && onApprove && (
                    <Button
                      type="button"
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {!isCreate && isPending && onReject && (
                    <Button
                      type="button"
                      onClick={handleReject}
                      disabled={isSubmitting}
                      variant="destructive"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <CancelButton onClick={handleClose} disabled={isSubmitting} />
                  <SubmitButton
                    isSubmitting={isSubmitting}
                    isDirty={isDirty}
                    isCreate={isCreate}
                    createText="Create Leave Request"
                    updateText="Update Leave Request"
                    submittingCreateText="Creating..."
                    submittingUpdateText="Updating..."
                  />
                </div>
              </div>
            </FormFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
