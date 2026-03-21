"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { ModalMode, Status } from "@/constants/status/status";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { uploadImage, isBase64Image } from "@/utils/common/upload-image";
import { showToast } from "@/components/shared/common/show-toast";
import {
  DELIVERY_OPTIONS_STATUS_CREATE_UPDATE,
  ORDER_STATUS_CREATE_UPDATE,
} from "@/constants/status/create-update-status";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { CheckboxField } from "@/components/shared/form-field/checkbox-field";
import { Loading } from "@/components/shared/common/loading";
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "../store/selectors/order-status-selector";
import {
  CreateOrderStatusData,
  createOrderStatusSchema,
  updateOrderStatusSchema,
} from "../store/models/schema/order-status-schema";
import {
  createOrderStatusService,
  fetchOrderStatusByIdService,
  updateOrderStatusService,
} from "../store/thunks/order-status-thunks";
import {
  clearError,
  clearSelectedOrderStatus,
} from "../store/slice/order-status-slice";

type Props = {
  mode: ModalMode;
  orderStatusId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function OrderStatusModal({
  isOpen,
  onClose,
  orderStatusId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  // Local state for image upload loading
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
  } = useForm<CreateOrderStatusData>({
    resolver: zodResolver(
      isCreate ? createOrderStatusSchema : updateOrderStatusSchema,
    ),
    defaultValues: {
      name: "",
      description: "",
      status: Status.ACTIVE,
      isInitial: false,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        description: "",
        status: Status.ACTIVE,
        isInitial: false,
      });
    }
  }, [isOpen, orderStatusId, reset]);

  // Fetch order status data for edit mode
  useEffect(() => {
    const fetchOrderStatusData = async () => {
      if (!orderStatusId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(
          fetchOrderStatusByIdService(orderStatusId),
        );

        if (fetchOrderStatusByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          reset({
            name: data?.name || "",
            description: data?.description || "",
            status: data?.status || "",
            isInitial: data?.isInitial || false,
          });
        }
      } catch (error) {
        console.error("Error fetching order status data:", error);
      }
    };

    fetchOrderStatusData();
  }, [orderStatusId, isOpen, isCreate, reset, dispatch]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: CreateOrderStatusData) => {
    try {
      const payload: CreateOrderStatusData = {
        name: data?.name || "",
        description: data?.description || "",
        status: data.status,
        isInitial: data?.isInitial || false,
      };

      if (isCreate) {
        await dispatch(createOrderStatusService(payload)).unwrap();
        showToast.success("Order status created successfully");
        handleClose();
      } else {
        await dispatch(
          updateOrderStatusService({ id: orderStatusId!, payload }),
        ).unwrap();
        showToast.success("Order status updated successfully");
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error?.message ||
          `Failed to ${isCreate ? "create" : "update"} order status`,
      );
    }
  };

  const handleClose = () => {
    reset();
    setIsUploadingImage(false);
    dispatch(clearError());
    dispatch(clearSelectedOrderStatus());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;
  const isProcessing = isSubmitting || isUploadingImage;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Order Status" : "Edit Order Status"}
          description={
            isCreate
              ? "Create order status information below"
              : "Update order status information below"
          }
          isCreate={isCreate}
        />

        {/* Show loading spinner in edit mode while fetching or when form is empty */}
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
              {/* Display Redux errors */}
              {reduxError && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg mb-4">
                  <p className="text-sm text-destructive font-medium">
                    {reduxError}
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {/* Divider */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    Order Status Details
                  </h3>

                  {/* Order Status Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <TextField
                      control={control}
                      name="name"
                      label="Name Order Status"
                      placeholder="Enter name order status"
                      disabled={isProcessing}
                      error={errors.name}
                    />

                    <SelectField
                      control={control}
                      name="status"
                      label="Status"
                      placeholder="Select status"
                      options={ORDER_STATUS_CREATE_UPDATE}
                      required
                      disabled={isProcessing}
                      error={errors.status}
                    />
                  </div>

                  <CheckboxField
                    control={control}
                    name="isInitial"
                    label="Set as Initial Status"
                    description="Mark this as the initial status for new orders. Only one status per business can be marked as initial."
                    disabled={isProcessing}
                  />

                  <TextareaField
                    control={control}
                    name="description"
                    label="Description"
                    placeholder="Enter any additional description (optional)"
                    rows={5}
                    disabled={isProcessing}
                    error={errors.description}
                  />
                </div>
              </div>
            </FormBody>

            <FormFooter
              isSubmitting={isProcessing}
              isDirty={isDirty}
              isCreate={isCreate}
              createMessage={
                isProcessing
                  ? "Uploading order status..."
                  : "Creating order status..."
              }
              updateMessage={
                isProcessing
                  ? "Uploading order status..."
                  : "Updating order status..."
              }
            >
              <CancelButton onClick={handleClose} disabled={isProcessing} />
              <SubmitButton
                isSubmitting={isProcessing}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Order Status"
                updateText="Update Order Status"
                submittingCreateText={
                  isProcessing ? "Uploading..." : "Creating..."
                }
                submittingUpdateText={
                  isProcessing ? "Uploading..." : "Updating..."
                }
              />
            </FormFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
