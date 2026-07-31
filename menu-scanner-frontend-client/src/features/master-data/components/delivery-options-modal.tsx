"use client";

import { Messages } from "@/constants/messages";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton, SubmitButton } from "@/components/shared/button/custom-button";

import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { ModalMode, Status } from "@/constants/status/status";
import { useAppDispatch, useAppSelector } from "@/store";
import { showToast } from "@/components/shared/common/show-toast";
import { DELIVERY_OPTIONS_STATUS_CREATE_UPDATE } from "@/constants/status/create-update-status";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { uploadMultiSize } from "@/services/spaces-service";
import { AppDefault } from "@/constants/app-resource/default/default";
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
  selecDeliveryOptionsContent,
  selectSelectedDeliveryOptions,
  selectError,
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

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!previewUrl || !previewUrl.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const operations = useAppSelector(selectOperations);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating, isFetchingDetail } = operations;

  const deliveryOptionsContent = useAppSelector(selecDeliveryOptionsContent);
  const selectedDeliveryOptions = useAppSelector(selectSelectedDeliveryOptions);
  const deliveryOptions = deliveryOptionsContent.find(d => d.id === deliveryOptionsId) || (selectedDeliveryOptions?.id === deliveryOptionsId ? selectedDeliveryOptions : null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreateDeliveryOptionsData>({
    resolver: zodResolver(
      isCreate ? createDeliveryOptionsSchema : updateDeliveryOptionsSchema,
    ),
    defaultValues: {
      name: "",
      image: { sm: "", md: "", o: "" },
      description: "",
      price: 0,
      status: Status.ACTIVE,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen && !isCreate && deliveryOptionsId && !deliveryOptions) {
      dispatch(fetchDeliveryOptionsByIdService(deliveryOptionsId));
    }
  }, [isOpen, isCreate, deliveryOptionsId, deliveryOptions, dispatch]);

  useEffect(() => {
    if (!isOpen) return;

    if (isCreate) {
      reset({
        name: "",
        image: { sm: "", md: "", o: "" },
        description: "",
        price: 0,
        status: Status.ACTIVE,
      });
      setPendingFile(null);
      setPreviewUrl("");
    } else if (deliveryOptions) {
      reset({
        name: deliveryOptions.name || "",
        image: {
          sm: deliveryOptions.image?.sm || "",
          md: deliveryOptions.image?.md || "",
          o: deliveryOptions.image?.o || "",
        },
        description: deliveryOptions.description || "",
        price: deliveryOptions.price || 0,
        status: deliveryOptions.status || Status.ACTIVE,
      });
      setPendingFile(null);
      setPreviewUrl(
        deliveryOptions.image?.md || deliveryOptions.image?.o || deliveryOptions.image?.sm || "",
      );
    }
  }, [isOpen, isCreate, deliveryOptions, reset]);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: CreateDeliveryOptionsData) => {
    setIsProcessing(true);
    try {
      let imagePayload = data.image;

      if (pendingFile) {
        setIsUploadingImage(true);
        try {
          const result = await uploadMultiSize(pendingFile, AppDefault.BUSINESS_ID);
          imagePayload = { sm: result.sm.url, md: result.md.url, o: result.o.url };
        } catch (uploadErr: any) {
          showToast.error(uploadErr?.message || "Image upload failed — please try again");
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const payload: CreateDeliveryOptionsData = {
        name: data.name || "",
        image: imagePayload,
        description: data.description || "",
        price: data.price || 0,
        status: data.status,
      };

      if (isCreate) {
        await dispatch(createDeliveryOptionsService(payload)).unwrap();
        showToast.success(Messages.delivery.created);
        handleClose();
      } else {
        if (deliveryOptions?.id) {
          await dispatch(
            updateDeliveryOptionsService({ id: deliveryOptions.id, payload }),
          ).unwrap();
          showToast.success(Messages.delivery.updated);
          handleClose();
        }
      }
    } catch (error: unknown) {
      showToast.error(
        (error as { message?: string })?.message ||
          `Failed to ${isCreate ? "create" : "update"} delivery options`,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    reset();
    setPendingFile(null);
    setPreviewUrl("");
    dispatch(clearError());
    dispatch(clearSelectedDeliveryOptions());
    onClose();
  };

  const isSubmitting = (isCreate ? isCreating : isUpdating) || isUploadingImage || isProcessing;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-3xl max-h-[92vh] p-0 flex flex-col">
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

        {!isCreate && isFetchingDetail ? (
          <div className="p-4 flex items-center justify-center min-h-[50vh] flex-1">
            <Loading />
          </div>
        ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-visible"
        >
          <FormBody>
            {reduxError && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded mb-3">
                <p className="text-xs text-destructive font-medium">
                  {reduxError}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <SpacesImageUpload
                multiSize
                deferred
                label="Delivery Options Image"
                businessId={AppDefault.BUSINESS_ID}
                value={previewUrl}
                onFileSelected={(file) => {
                  setPendingFile(file);
                  if (file) {
                    const objectUrl = URL.createObjectURL(file);
                    setPreviewUrl(objectUrl);
                    setValue(
                      "image",
                      { sm: objectUrl, md: objectUrl, o: objectUrl },
                      { shouldDirty: true, shouldValidate: true },
                    );
                  } else {
                    setPreviewUrl("");
                    setValue(
                      "image",
                      { sm: "", md: "", o: "" },
                      { shouldDirty: true, shouldValidate: true },
                    );
                  }
                }}
                aspectRatio="square"
                maxSizeMb={5}
                disabled={isSubmitting}
                placeholder="Click to upload delivery options image"
                helperText="Square image works best (500x500)"
              />

              <div className="border-t pt-4">
                <h3 className="text-xs font-semibold text-foreground mb-3">
                  Delivery Options Details
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    control={control}
                    name="name"
                    label="Delivery Name"
                    placeholder="e.g. Standard Delivery"
                    required
                    disabled={isSubmitting}
                    error={errors.name}
                  />

                  <TextField
                    control={control}
                    name="price"
                    label="Price (USD)"
                    placeholder="e.g. 2.50"
                    type="number"
                    valueAsNumber
                    disabled={isSubmitting}
                    error={errors.price}
                  />

                  <SelectField
                    control={control}
                    name="status"
                    label="Status"
                    placeholder="Select status"
                    options={DELIVERY_OPTIONS_STATUS_CREATE_UPDATE}
                    required
                    disabled={isSubmitting}
                    error={errors.status}
                  />
                </div>

                <TextareaField
                  control={control}
                  name="description"
                  label="Description"
                  placeholder="Describe this delivery option (optional)"
                  rows={4}
                  disabled={isSubmitting}
                  error={errors.description}
                />
              </div>
            </div>
          </FormBody>

          <FormFooter
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            isCreate={isCreate}
            createMessage="Creating delivery options..."
            updateMessage="Updating delivery options..."
          >
            <CancelButton onClick={handleClose} disabled={isSubmitting} />
            <SubmitButton
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createText="Create Delivery Options"
              updateText="Update Delivery Options"
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
