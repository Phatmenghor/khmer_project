"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { ModalMode } from "@/constants/status/status";
import {
  clearError,
  clearSelectedWorkSchedule,
} from "../store/slice/work-schedule-type-slice";
import { FormHeader } from "@/components/shared/form-field/form-header";
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "../store/selectors/leave-type-selectors";
import {
  createLeaveTypeSchema,
  LeaveTypeFormData,
  updateLeaveTypeSchema,
} from "../store/models/schema/leave-type.schema";
import {
  createLeaveTypeService,
  fetchLeaveTypeByIdService,
  updateLeaveTypeService,
} from "../store/thunks/leave-type-thunks";
import {
  CreateLeaveTypeRequest,
  UpdateLeaveTypeRequest,
} from "../store/models/request/leave-type-request";
import { Loading } from "@/components/shared/common/loading";

type Props = {
  mode: ModalMode;
  leaveTypeId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function LeaveTypeModal({
  isOpen,
  onClose,
  leaveTypeId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<LeaveTypeFormData>({
    resolver: zodResolver(
      isCreate ? createLeaveTypeSchema : updateLeaveTypeSchema,
    ) as any,
    defaultValues: {
      id: "",
      enumName: "",
      description: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchLeaveTypeData = async () => {
      if (!leaveTypeId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(
          fetchLeaveTypeByIdService(leaveTypeId),
        );

        if (fetchLeaveTypeByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          reset({
            id: data.id,
            enumName: data.enumName || "",
            description: data.description || "",
          });
        }
      } catch (error) {
        console.error("Error fetching leave type data:", error);
      }
    };

    fetchLeaveTypeData();
  }, [leaveTypeId, isOpen, isCreate]);

  // Reset form for create mode
  useEffect(() => {
    if (isOpen && isCreate) {
      reset({
        enumName: "",
        description: "",
      });
    }
  }, [isOpen, isCreate]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen]);

  const onSubmit = async (data: LeaveTypeFormData) => {
    try {
      if (isCreate) {
        const payload: CreateLeaveTypeRequest = {
          enumName: data.enumName,
          description: data.description,
        };

        const result = await dispatch(createLeaveTypeService(payload)).unwrap();

        showToast.success(
          `Leave type "${result.enumName}" created successfully`,
        );
        handleClose();
      } else {
        const payload: UpdateLeaveTypeRequest = {
          enumName: data.enumName,
          description: data.description,
        };

        const result = await dispatch(
          updateLeaveTypeService({ id: data.id, param: payload }),
        ).unwrap();

        showToast.success(
          `Leave type "${result.enumName}" updated successfully`,
        );
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error || `Failed to ${isCreate ? "create" : "update"} leave type`,
      );
    }
  };

  const handleClose = () => {
    reset();
    dispatch(clearError());
    dispatch(clearSelectedWorkSchedule());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Leave Type" : "Edit Leave Type"}
          description={
            isCreate
              ? "Fill out the form to create a new leave type"
              : "Update leave type information below"
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

              <TextField
                control={control}
                name="enumName"
                label="Leave Type Name"
                placeholder="Enter Leave Type Name"
                required
                disabled={isSubmitting}
                error={errors.enumName}
              />

              <TextareaField
                control={control}
                name="description"
                label="Description"
                placeholder="Enter any additional description (optional)"
                rows={5}
                disabled={isSubmitting}
                error={errors.description}
              />
            </FormBody>

            <FormFooter
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage="Creating leave type..."
              updateMessage="Updating leave type..."
            >
              <CancelButton onClick={handleClose} disabled={isSubmitting} />
              <SubmitButton
                isSubmitting={isSubmitting}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Leave Type"
                updateText="Update Leave Type"
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
