"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { clearError } from "../store/slice/attendance-slice";
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "../store/selectors/attendance-selectors";
import {
  AttendanceFormData,
  updateRemarksSchema,
} from "../store/models/schema/attendance.schema";
import {
  fetchAttendanceByIdService,
  updateAttendanceService,
} from "../store/thunks/attendance-thunks";
import { UpdateAttendanceRequest } from "../store/models/request/attendance-request";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { Loading } from "@/components/shared/common/loading";

type Props = {
  attendanceId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function AttendanceModal({
  isOpen,
  onClose,
  attendanceId,
}: Props) {
  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const reduxError = useAppSelector(selectError);
  const { isUpdating } = operations;

  const [currentAttendanceData, setCurrentAttendanceData] = useState<any>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(updateRemarksSchema) as any,
    defaultValues: {
      id: "",
      remarks: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!attendanceId || !isOpen) return;

      try {
        const resultAction = await dispatch(
          fetchAttendanceByIdService(attendanceId),
        );

        if (fetchAttendanceByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          setCurrentAttendanceData(data);

          reset({
            id: data.id,
            remarks: data.remarks || "",
          });
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchAttendanceData();
  }, [attendanceId, isOpen, dispatch, reset]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: AttendanceFormData) => {
    try {
      const payload: UpdateAttendanceRequest = {
        remarks: data.remarks,
      };

      await dispatch(
        updateAttendanceService({
          id: data.id,
          param: payload,
        }),
      ).unwrap();

      showToast.success("Attendance updated successfully");
      handleClose();
    } catch (error: any) {
      showToast.error(error?.message || "Failed to update attendance");
    }
  };

  const handleClose = () => {
    reset();
    setCurrentAttendanceData(null);
    dispatch(clearError());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title="Edit Remarks"
          description="Add or update remarks for this attendance record"
        />

        {isFetchingDetail ? (
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

              <TextareaField
                control={control}
                name="remarks"
                label="Remarks"
                placeholder="Enter remarks (optional)"
                rows={6}
                disabled={isUpdating}
                error={errors.remarks}
              />
            </FormBody>

            <FormFooter
              isSubmitting={isUpdating}
              isDirty={isDirty}
              isCreate={false}
              updateMessage="Updating remarks..."
            >
              <div className="flex items-center justify-end w-full gap-2">
                <CancelButton onClick={handleClose} disabled={isUpdating} />
                <SubmitButton
                  isSubmitting={isUpdating}
                  isDirty={isDirty}
                  isCreate={false}
                  updateText="Update Remarks"
                  submittingUpdateText="Updating..."
                />
              </div>
            </FormFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
