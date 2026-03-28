"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
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
import { BANNER_STATUS_CREATE_UPDATE } from "@/constants/status/create-update-status";
import {
  CreateBrandData,
  createBrandSchema,
  updateBrandSchema,
} from "../store/models/schema/brand-schema";
import {
  createBrandService,
  updateBrandService,
} from "../store/thunks/brand-thunks";
import { clearError, clearSelectedBrand } from "../store/slice/brand-slice";
import {
  selectError,
  selectOperations,
} from "../store/selectors/brand-selector";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { TextAreaField } from "@/components/shared/form-field/textarea-field";
import { BrandResponseModel } from "../store/models/response/brand-response";

type Props = {
  mode: ModalMode;
  brand?: BrandResponseModel | null;
  onClose: () => void;
  isOpen: boolean;
};

export default function BrandModal({ isOpen, onClose, brand, mode }: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  // Local state for image upload loading
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const dispatch = useAppDispatch();

  const operations = useAppSelector(selectOperations);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<CreateBrandData>({
    resolver: zodResolver(isCreate ? createBrandSchema : updateBrandSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      description: "",
      status: Status.ACTIVE,
    },
    mode: "onChange",
  });

  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (isOpen) {
      if (isCreate) {
        // Reset form for create mode
        reset({
          name: "",
          imageUrl: "",
          description: "",
          status: Status.ACTIVE,
        });
      } else if (brand) {
        // Populate form with brand data for edit mode
        reset({
          name: brand.name || "",
          imageUrl: brand.imageUrl || "",
          description: brand.description || "",
          status: brand.status || "",
        });
      }
    }
  }, [isOpen, brand, isCreate, reset]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: CreateBrandData) => {
    try {
      let finalImageUrl = data.imageUrl;

      // Upload image if it's a base64 string with loading state
      if (finalImageUrl && isBase64Image(finalImageUrl)) {
        setIsUploadingImage(true);
        try {
          finalImageUrl = await uploadImage(finalImageUrl);
        } catch (uploadError) {
          console.error("Error uploading brand image:", uploadError);
          showToast.error("Failed to upload brand image. Please try again.");
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const payload: CreateBrandData = {
        name: data?.name || "",
        imageUrl: finalImageUrl,
        description: data.description || "",
        status: data.status,
      };

      if (isCreate) {
        await dispatch(createBrandService(payload)).unwrap();
        showToast.success("Brand created successfully");
        handleClose();
      } else {
        if (!brand?.id) return;
        await dispatch(
          updateBrandService({ brandId: brand.id, brandData: payload }),
        ).unwrap();
        showToast.success("Brand updated successfully");
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error?.message || `Failed to ${isCreate ? "create" : "update"} brand`,
      );
    }
  };

  const handleClose = () => {
    reset();
    setIsUploadingImage(false);
    dispatch(clearError());
    dispatch(clearSelectedBrand());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;
  const isProcessing = isSubmitting || isUploadingImage;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Brand" : "Edit Brand"}
          description={
            isCreate
              ? "Upload an image and configure brand settings"
              : "Update brand information below"
          }
          isCreate={isCreate}
        />

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
                    label="Brand Logo"
                    value={imageUrl}
                    onChange={(base64) => setValue("imageUrl", base64)}
                    aspectRatio="square"
                    height="h-40"
                    maxSize={5}
                    required
                    error={errors.imageUrl}
                    placeholder="Click to upload brand logo"
                    helperText="PNG with transparent background recommended"
                  />
                </div>

                {/* Divider */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    Banner Details
                  </h3>

                  {/* Banner Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <TextField
                      control={control}
                      name="name"
                      label="Name Brand"
                      placeholder="Enter name brand"
                      disabled={isProcessing}
                      error={errors.name}
                    />

                    <SelectField
                      control={control}
                      name="status"
                      label="Status"
                      placeholder="Select status"
                      options={BANNER_STATUS_CREATE_UPDATE}
                      required
                      disabled={isProcessing}
                      error={errors.status}
                    />
                  </div>

                  <TextAreaField
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
                isProcessing ? "Uploading brand..." : "Creating brand..."
              }
              updateMessage={
                isProcessing ? "Uploading brand..." : "Updating brand..."
              }
            >
              <CancelButton onClick={handleClose} disabled={isProcessing} />
              <SubmitButton
                isSubmitting={isProcessing}
                isDirty={isDirty}
                isCreate={isCreate}
                createText="Create Brand"
                updateText="Update Brand"
                submittingCreateText={
                  isProcessing ? "Uploading..." : "Creating..."
                }
                submittingUpdateText={
                  isProcessing ? "Uploading..." : "Updating..."
                }
              />
            </FormFooter>
          </form>
      </DialogContent>
    </Dialog>
  );
}
