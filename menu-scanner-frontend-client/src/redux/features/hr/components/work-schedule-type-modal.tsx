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
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "../store/selectors/work-schedule-type-selectors";
import {
  createWorkScheduleTypeSchema,
  updateWorkScheduleTypeSchema,
  WorkScheduleTypeFormData,
} from "../store/models/schema/work-schedule-type.schema";
import {
  createWorkScheduleTypeService,
  fetchWorkScheduleTypeByIdService,
  updateWorkScheduleTypeService,
} from "../store/thunks/work-schedule-type-thunks";
import {
  clearError,
  clearSelectedWorkSchedule,
} from "../store/slice/work-schedule-type-slice";
import { FormHeader } from "@/components/shared/form-field/form-header";
import {
  CreateWorkScheduleTypeRequest,
  UpdateWorkScheduleTypeRequest,
} from "../store/models/request/work-schedule-type-request";
import { Loading } from "@/components/shared/common/loading";

type Props = {
  mode: ModalMode;
  workScheduleId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function WorkScheduleTypeModal({
  isOpen,
  onClose,
  workScheduleId,
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
  } = useForm<WorkScheduleTypeFormData>({
    resolver: zodResolver(
      isCreate ? createWorkScheduleTypeSchema : updateWorkScheduleTypeSchema,
    ) as any,
    defaultValues: {
      id: "",
      enumName: "",
      description: "",
    },
    mode: "onChange",
  });

  // Fetch user data for edit mode
  useEffect(() => {
    const fetchWorkScheduleData = async () => {
      if (!workScheduleId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(
          fetchWorkScheduleTypeByIdService(workScheduleId),
        );

        if (fetchWorkScheduleTypeByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          reset({
            id: data.id,
            enumName: data.enumName || "",
            description: data.description || "",
          });
        }
      } catch (error) {
        console.error("Error fetching work schedule data:", error);
      }
    };

    fetchWorkScheduleData();
  }, [workScheduleId, isOpen, isCreate, reset, dispatch]);

  // Reset form for create mode
  useEffect(() => {
    if (isOpen && isCreate) {
      reset({
        enumName: "",
        description: "",
      });
    }
  }, [isOpen, isCreate, reset]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: WorkScheduleTypeFormData) => {
    try {
      if (isCreate) {
        const payload: CreateWorkScheduleTypeRequest = {
          enumName: data.enumName,
          description: data.description,
        };

        const result = await dispatch(
          createWorkScheduleTypeService(payload),
        ).unwrap();

        showToast.success(
          `Work schedule "${result.enumName}" created successfully`,
        );
        handleClose();
      } else {
        const payload: UpdateWorkScheduleTypeRequest = {
          enumName: data.enumName,
          description: data.description,
        };

        const result = await dispatch(
          updateWorkScheduleTypeService({ id: data.id, param: payload }),
        ).unwrap();

        showToast.success(
          `Work schedule "${result.enumName}" updated successfully`,
        );
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error || `Failed to ${isCreate ? "create" : "update"} user business`,
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

              <TextField
                control={control}
                name="enumName"
                label="Work Schedule Name"
                placeholder="Enter Work Schedule Name"
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
