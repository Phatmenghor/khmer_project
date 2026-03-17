"use client";

import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { showToast } from "@/components/shared/common/show-toast";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { clearError } from "../store/slice/leave-slice";
import { FormHeader } from "@/components/shared/form-field/form-header";
import {
  selectError,
  selectOperations,
} from "../store/selectors/leave-selectors";
import { approveLeaveSchema } from "../store/models/schema/leave.schema";
import { approveLeaveService } from "../store/thunks/leave-thunks";
import { ApproveLeaveRequest } from "../store/models/request/leave-request";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

type ApproveRejectAction = "APPROVED" | "REJECTED";

type ApproveRejectFormData = {
  status: string;
  actionNote: string;
};

type Props = {
  leaveId?: string;
  onClose: () => void;
  isOpen: boolean;
  action: ApproveRejectAction;
};

export default function ApproveRejectLeaveModal({
  isOpen,
  onClose,
  leaveId,
  action,
}: Props) {
  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const reduxError = useAppSelector(selectError);
  const { isUpdating } = operations;

  const isApprove = action === "APPROVED";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ApproveRejectFormData>({
    resolver: zodResolver(approveLeaveSchema) as any,
    defaultValues: {
      status: action,
      actionNote: "",
    },
    mode: "onChange",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        status: action,
        actionNote: "",
      });
      dispatch(clearError());
    }
  }, [isOpen, action, reset, dispatch]);

  const onSubmit = async (data: ApproveRejectFormData) => {
    if (!leaveId) {
      showToast.error("Leave ID is required");
      return;
    }

    try {
      const payload: ApproveLeaveRequest = {
        status: data.status,
        actionNote: data.actionNote,
      };

      await dispatch(
        approveLeaveService({ id: leaveId, param: payload }),
      ).unwrap();

      showToast.success(
        `Leave request ${isApprove ? "approved" : "rejected"} successfully`,
      );
      handleClose();
    } catch (error: any) {
      showToast.error(
        error || `Failed to ${isApprove ? "approve" : "reject"} leave request`,
      );
    }
  };

  const handleClose = () => {
    reset();
    dispatch(clearError());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title={isApprove ? "Approve Leave Request" : "Reject Leave Request"}
          description={
            isApprove
              ? "Please provide a note for approving this leave request"
              : "Please provide a reason for rejecting this leave request"
          }
        />

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
              name="actionNote"
              label={isApprove ? "Approval Note" : "Rejection Reason"}
              placeholder={
                isApprove
                  ? "Enter approval note (optional)"
                  : "Enter reason for rejection"
              }
              rows={5}
              required
              disabled={isUpdating}
              error={errors.actionNote}
            />
          </FormBody>

          <FormFooter
            isSubmitting={isUpdating}
            isDirty={isDirty}
            isCreate={false}
            createMessage=""
            updateMessage={
              isApprove ? "Approving leave..." : "Rejecting leave..."
            }
          >
            <CancelButton onClick={handleClose} disabled={isUpdating} />
            <Button
              type="submit"
              disabled={isUpdating || !isDirty}
              className={
                isApprove
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isUpdating ? (
                <>{isApprove ? "Approving..." : "Rejecting..."}</>
              ) : (
                <>
                  {isApprove ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </>
                  )}
                </>
              )}
            </Button>
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
