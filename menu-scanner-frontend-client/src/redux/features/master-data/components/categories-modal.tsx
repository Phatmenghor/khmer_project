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
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import {
  selectError,
  selectOperations,
} from "../store/selectors/categories-selector";
import {
  CreateCategoriesData,
  createCategoriesSchema,
  updateCategoriesSchema,
} from "../store/models/schema/categories-schema";
import {
  createCategoriesService,
  updateCategoriesService,
} from "../store/thunks/categories-thunks";
import {
  clearError,
  clearSelectedCategories,
} from "../store/slice/categories-slice";
import { CategoriesResponseModel } from "../store/models/response/categories-response";

type Props = {
  mode: ModalMode;
  categories?: CategoriesResponseModel | null;
  onClose: () => void;
  isOpen: boolean;
};

export default function CategoriesModal({
  isOpen,
  onClose,
  categories,
  mode,
}: Props) {
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
  } = useForm<CreateCategoriesData>({
    resolver: zodResolver(
      isCreate ? createCategoriesSchema : updateCategoriesSchema,
    ),
    defaultValues: {
      name: "",
      imageUrl: "",
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
          status: Status.ACTIVE,
        });
      } else if (categories) {
        // Populate form with categories data for edit mode
        reset({
          name: categories.name || "",
          imageUrl: categories.imageUrl || "",
          status: categories.status || "",
        });
      }
    }
  }, [isOpen, categories, isCreate, reset]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: CreateCategoriesData) => {
    try {
      let finalImageUrl = data.imageUrl;

      // Upload image if it's a base64 string
      if (finalImageUrl && isBase64Image(finalImageUrl)) {
        setIsUploadingImage(true);
        try {
          finalImageUrl = await uploadImage(finalImageUrl);
        } catch (uploadError) {
          console.error("Error uploading category image:", uploadError);
          showToast.error(
            "Failed to upload category image. Please try again.",
          );
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const payload: CreateCategoriesData = {
        name: data?.name || "",
        imageUrl: finalImageUrl,
        status: data.status,
      };

      if (isCreate) {
        await dispatch(createCategoriesService(payload)).unwrap();
        showToast.success("Category created successfully");
        handleClose();
      } else {
        if (!categories?.id) return;
        await dispatch(
          updateCategoriesService({
            categoriesId: categories.id,
            categoriesData: payload,
          }),
        ).unwrap();
        showToast.success("Category updated successfully");
        handleClose();
      }
    } catch (error: any) {
      showToast.error(
        error?.message ||
          `Failed to ${isCreate ? "create" : "update"} category`,
      );
    }
  };

  const handleClose = () => {
    reset();
    setIsUploadingImage(false);
    dispatch(clearError());
    dispatch(clearSelectedCategories());
    onClose();
  };

  const isSubmitting = isCreate ? isCreating : isUpdating;
  const isProcessing = isSubmitting || isUploadingImage;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-2xl p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Category" : "Edit Category"}
          description={
            isCreate
              ? "Fill out the form to create a new category"
              : "Update category information below"
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
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  {reduxError}
                </p>
              </div>
            )}

            {/* Category Image Upload */}
            <ClickableImageUpload
              label="Category Image"
              value={imageUrl}
              onChange={(base64) => setValue("imageUrl", base64)}
              aspectRatio="square"
              required
              error={errors.imageUrl}
              placeholder="Click to upload category image"
              helperText="Square image works best (500x500)"
            />

            {/* Category Name */}
            <TextField
              control={control}
              name="name"
              label="Category Name"
              placeholder="Enter category name"
              required
              disabled={isProcessing}
              error={errors.name}
            />

            {/* Status */}
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
          </FormBody>

          <FormFooter
            isSubmitting={isProcessing}
            isDirty={isDirty}
            isCreate={isCreate}
            createMessage={isProcessing ? "Uploading..." : "Creating category..."}
            updateMessage={isProcessing ? "Uploading..." : "Updating category..."}
          >
            <CancelButton onClick={handleClose} disabled={isProcessing} />
            <SubmitButton
              isSubmitting={isProcessing}
              isDirty={isDirty}
              isCreate={isCreate}
              createText="Create category"
              updateText="Update category"
              submittingCreateText="Creating..."
              submittingUpdateText="Updating..."
            />
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
