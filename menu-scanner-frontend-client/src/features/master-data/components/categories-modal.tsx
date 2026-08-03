"use client";

import { Messages } from "@/constants/messages";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { CancelButton, SubmitButton } from "@/components/shared/button/custom-button";

import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { ModalMode, Status } from "@/constants/status/status";
import { useAppDispatch, useAppSelector } from "@/store";
import { showToast } from "@/components/shared/common/show-toast";
import { BANNER_STATUS_CREATE_UPDATE } from "@/constants/status/create-update-status";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { uploadMultiSize } from "@/services/spaces-service";
import { AppDefault } from "@/constants/app-resource/default/default";
import { Loading } from "@/components/shared/common/loading";
import {
  selectCategoriesWithProductCountContent,
  selectSelectedCategories,
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
  fetchCategoriesByIdService,
  updateCategoriesService,
} from "../store/thunks/categories-thunks";
import {
  clearError,
  clearSelectedCategories,
} from "../store/slice/categories-slice";

type Props = {
  mode: ModalMode;
  categoriesId?: string;
  onClose: () => void;
  isOpen: boolean;
};

export default function CategoriesModal({
  isOpen,
  onClose,
  categoriesId,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const dispatch = useAppDispatch();

  // Revoke the object URL when it changes or unmounts to avoid memory leaks.
  useEffect(() => {
    if (!previewUrl || !previewUrl.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const operations = useAppSelector(selectOperations);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating, isFetchingDetail } = operations;

  const categoriesContent = useAppSelector(selectCategoriesWithProductCountContent);
  const selectedCategories = useAppSelector(selectSelectedCategories);
  const categories = (selectedCategories?.id === categoriesId ? selectedCategories : null) || categoriesContent.find(c => c.id === categoriesId);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreateCategoriesData>({
    resolver: zodResolver(
      isCreate ? createCategoriesSchema : updateCategoriesSchema,
    ),
    defaultValues: {
      name: "",
      image: { sm: "", md: "", o: "" },
      description: "",
      status: Status.ACTIVE,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen && !isCreate && categoriesId) {
      dispatch(fetchCategoriesByIdService(categoriesId));
    }
  }, [isOpen, isCreate, categoriesId, dispatch]);

  useEffect(() => {
    if (isOpen) {
      if (isCreate) {
        reset({
          name: "",
          image: { sm: "", md: "", o: "" },
          description: "",
          status: Status.ACTIVE,
        });
        setPendingFile(null);
        setPreviewUrl("");
      } else if (categories) {
        reset({
          name: categories.name || "",
          image: {
            sm: categories.image?.sm || "",
            md: categories.image?.md || "",
            o: categories.image?.o || "",
          },
          description: categories.description || "",
          status: categories.status || "",
        });
        setPendingFile(null);
        setPreviewUrl(
          categories.image?.md || categories.image?.o || categories.image?.sm || "",
        );
      }
    }
  }, [isOpen, categories, isCreate, reset]);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: CreateCategoriesData) => {
    setIsProcessing(true);
    try {
      let imagePayload = data.image;

      // Upload the pending file only now that the user committed to submit.
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

      const payload: CreateCategoriesData = {
        name: data.name || "",
        image: imagePayload,
        description: data.description || "",
        status: data.status,
      };

      if (isCreate) {
        await dispatch(createCategoriesService(payload)).unwrap();
        showToast.success(Messages.category.created);
        handleClose();
      } else {
        if (!categories?.id) return;
        await dispatch(
          updateCategoriesService({
            categoriesId: categories.id,
            categoriesData: payload,
          }),
        ).unwrap();
        showToast.success(Messages.category.updated);
        handleClose();
      }
    } catch (error: unknown) {
      showToast.error(
        (error as { message?: string })?.message ||
          `Failed to ${isCreate ? "create" : "update"} category`,
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
    dispatch(clearSelectedCategories());
    onClose();
  };

  const isSubmitting = (isCreate ? isCreating : isUpdating) || isUploadingImage || isProcessing;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-3xl max-h-[92vh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Category" : "Edit Category"}
          description={
            isCreate
              ? "Upload an image and configure category settings"
              : "Update category information below"
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
                label="Category Image"
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
                required
                disabled={isSubmitting}
                error={
                  (errors.image as any)?.message ||
                  (errors.image as any)?.root?.message
                }
                placeholder="Click to upload category image"
                helperText="Square image works best (500x500)"
              />

              <div className="border-t pt-4">
                <h3 className="text-xs font-semibold text-foreground mb-3">
                  Category Details
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    control={control}
                    name="name"
                    label="Category Name"
                    placeholder="Enter category name"
                    required
                    disabled={isSubmitting}
                    error={errors.name}
                  />

                  <SelectField
                    control={control}
                    name="status"
                    label="Status"
                    placeholder="Select status"
                    options={BANNER_STATUS_CREATE_UPDATE}
                    required
                    disabled={isSubmitting}
                    error={errors.status}
                  />
                </div>

                <TextareaField
                  control={control}
                  name="description"
                  label="Description"
                  placeholder="Enter any additional description (optional)"
                  rows={5}
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
            createMessage="Creating category..."
            updateMessage="Updating category..."
          >
            <CancelButton onClick={handleClose} disabled={isSubmitting} />
            <SubmitButton
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createText="Create Category"
              updateText="Update Category"
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
