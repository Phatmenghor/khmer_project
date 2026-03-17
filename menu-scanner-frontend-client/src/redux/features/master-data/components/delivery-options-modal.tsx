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
import { DELIVERY_OPTIONS_STATUS_CREATE_UPDATE } from "@/constants/status/create-update-status";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import {
  CreateDeliveryOptionsData,
  createDeliveryOptionsSchema,
  updateDeliveryOptionsSchema,
} from "../store/models/schema/delivery-options-schema";
import {
  createDeliveryOptionsService,
  fetchDeliveryOptionsByIdService,
  updateDeliveryOptionsService,
} from "../store/thunks/delivery-options-thunks";
import {
  selectError,
  selectIsFetchingDetail,
  selectOperations,
} from "../store/selectors/delivery-options-selector";
import {
  clearError,
  clearSelectedDeliveryOptions,
} from "../store/slice/delivery-options-slice";
import { TextField } from "@/components/shared/form-field/text-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { Loading } from "@/components/shared/common/loading";

type Props = {
  mode: ModalMode;
  deliveryOptionsId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function DeliveryOptionsModal({
  isOpen,
  onClose,
  deliveryOptionsId,
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
  } = useForm<CreateDeliveryOptionsData>({
    resolver: zodResolver(
      isCreate ? createDeliveryOptionsSchema : updateDeliveryOptionsSchema,
    ),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      price: 0,
      status: Status.ACTIVE,
    },
    mode: "onChange",
  });

  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        description: "",
        imageUrl: "",
        price: 0,
        status: Status.ACTIVE,
      });
    }
  }, [isOpen, deliveryOptionsId, reset]);

  // Fetch delivery options data for edit mode
  useEffect(() => {
    const fetchDeliveryOptionsData = async () => {
      if (!deliveryOptionsId || !isOpen || isCreate) return;

      try {
        const resultAction = await dispatch(
          fetchDeliveryOptionsByIdService(deliveryOptionsId),
        );

        if (fetchDeliveryOptionsByIdService.fulfilled.match(resultAction)) {
          const data = resultAction.payload;

          reset({
            name: data?.name || "",
            description: data?.description || "",
            imageUrl: data?.imageUrl || "",
            price: data?.price || 0,
            status: data?.status || "",
          });
        }
      } catch (error) {
        console.error("Error fetching delivery options data:", error);
      }
    };

    fetchDeliveryOptionsData();
  }, [deliveryOptionsId, isOpen, isCreate, reset, dispatch]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: CreateDeliveryOptionsData) => {
    try {
      let finalImageUrl = data.imageUrl;

      // Upload image if it's a base64 string with loading state
      if (finalImageUrl && isBase64Image(finalImageUrl)) {
        setIsUploadingImage(true);
        try {
          finalImageUrl = await uploadImage(finalImageUrl);
        } catch (uploadError) {
          console.error("Error uploading delivery options image:", uploadError);
          showToast.error(
            "Failed to upload delivery options image. Please try again.",
          );
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const payload: CreateDeliveryOptionsData = {
        name: data?.name || "",
        description: data?.description || "",
        imageUrl: finalImageUrl,
        price: data?.price || 0,
        status: data.status,
      };

      if (isCreate) {
        await dispatch(createDeliveryOptionsService(payload)).unwrap();
        showToast.success("Delivery options created successfully");
        handleClose();
      } else {
        await dispatch(
          updateDeliveryOptionsService({ id: deliveryOptionsId!, payload }),
        ).unwrap();
        showToast.success("Delivery options updated successfully");
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error?.message ||
          `Failed to ${isCreate ? "create" : "update"} delivery options`,
      );
    }
  };

  const handleClose = () => {
    reset();
    setIsUploadingImage(false);
    dispatch(clearError());
    dispatch(clearSelectedDeliveryOptions());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;
  const isProcessing = isSubmitting || isUploadingImage;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title={
            isCreate ? "Create New Delivery Options" : "Edit Delivery Options"
          }
          description={
            isCreate
              ? "Upload an image and configure delivery options settings"
              : "Update delivery options information below"
          }
          isCreate={isCreate}
        />

        {/* Show loading spinner in edit mode while fetching or when form is empty */}
        {!isCreate && (isFetchingDetail || !imageUrl) ? (
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
                {/* Banner Image Section - Prominent display */}
                <div className="space-y-3">
                  <ClickableImageUpload
                    label="Delivery Options Image"
                    value={imageUrl}
                    onChange={(base64) => setValue("imageUrl", base64)}
                    aspectRatio="square"
                    required
                    error={errors.imageUrl}
                    placeholder="Click to upload delivery options image"
                    helperText="Square image works best (500x500)"
                  />
                </div>

                {/* Divider */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    Delivery Options Details
                  </h3>

                  {/* Delivery Options Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <TextField
                      control={control}
                      name="name"
                      label="Name Delivery Options"
                      placeholder="Enter name delivery options"
                      disabled={isProcessing}
                      error={errors.name}
                    />

                    <TextField
                      control={control}
                      name="price"
                      label="Delivery Options Price"
                      placeholder="Enter delivery options price (optional)"
                      type="number"
                      valueAsNumber
                      disabled={isProcessing}
                      error={errors.price}
                    />

                    <SelectField
                      control={control}
                      name="status"
                      label="Status"
                      placeholder="Select status"
                      options={DELIVERY_OPTIONS_STATUS_CREATE_UPDATE}
                      required
                      disabled={isProcessing}
                      error={errors.status}
                    />
                  </div>

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
                  ? "Uploading delivery options..."
                  : "Creating delivery options..."
              }
              updateMessage={
                isProcessing
                  ? "Uploading delivery options..."
                  : "Updating delivery options..."
              }
            >
              <CancelButton onClick={handleClose} disabled={isProcessing} />
              <SubmitButton
                isSubmitting={isProcessing}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Delivery Options"
                updateText="Update Delivery Options"
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
