"use client";

import { Messages } from "@/constants/messages";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { CancelButton } from "@/components/shared/button/cancel-button";
import { SubmitButton } from "@/components/shared/button/submit-button";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { ModalMode, Status } from "@/constants/status/status";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectError,
  selectOperations,
} from "../store/selectors/banner-selector";
import {
  CreateBannerData,
  createBannerSchema,
  updateBannerSchema,
} from "../store/models/schema/banner-schema";
import {
  createBannerService,
  updateBannerService,
} from "../store/thunks/banner-thunks";
import { clearError, clearSelectedBanner } from "../store/slice/banner-slice";
import { showToast } from "@/components/shared/common/show-toast";
import { BANNER_STATUS_CREATE_UPDATE } from "@/constants/status/create-update-status";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { uploadMultiSize } from "@/services/spaces-service";
import { AppDefault } from "@/constants/app-resource/default/default";
import { BannerResponseModel } from "../store/models/response/banner-response";

type Props = {
  mode: ModalMode;
  banner?: BannerResponseModel | null;
  onClose: () => void;
  isOpen: boolean;
};

export default function BannerModal({
  isOpen,
  onClose,
  banner,
  mode,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  // True from the click on Save/Create until the API call resolves.
  const [isProcessing, setIsProcessing] = useState(false);

  const dispatch = useAppDispatch();

  // Revoke the object URL when it changes or unmounts to avoid leaks.
  useEffect(() => {
    if (!previewUrl || !previewUrl.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const operations = useAppSelector(selectOperations);
  const reduxError = useAppSelector(selectError);
  const { isCreating, isUpdating } = operations;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreateBannerData>({
    resolver: zodResolver(isCreate ? createBannerSchema : updateBannerSchema),
    defaultValues: {
      image: { sm: "", md: "", o: "" },
      description: "",
      status: Status.ACTIVE,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen) {
      if (isCreate) {
        reset({
          image: { sm: "", md: "", o: "" },
          description: "",
          status: Status.ACTIVE,
        });
        setPendingFile(null);
        setPreviewUrl("");
      } else if (banner) {
        reset({
          image: {
            sm: banner.image?.sm || "",
            md: banner.image?.md || "",
            o: banner.image?.o || "",
          },
          description: banner.description || "",
          status: banner.status || "",
        });
        setPendingFile(null);
        setPreviewUrl(banner.image?.md || banner.image?.o || banner.image?.sm || "");
      }
    }
  }, [isOpen, banner, isCreate, reset]);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: CreateBannerData) => {
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

      const payload = {
        image: imagePayload,
        description: data.description || "",
        status: data.status,
      };

      if (isCreate) {
        await dispatch(createBannerService(payload)).unwrap();
        showToast.success(Messages.banner.created);
        handleClose();
      } else {
        if (!banner?.id) return;
        await dispatch(
          updateBannerService({ id: banner.id, payload }),
        ).unwrap();
        showToast.success(Messages.banner.updated);
        handleClose();
      }
    } catch (error: unknown) {
      showToast.error(
        (error as { message?: string })?.message || `Failed to ${isCreate ? "create" : "update"} banner`,
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
    dispatch(clearSelectedBanner());
    onClose();
  };

  const isSubmitting = (isCreate ? isCreating : isUpdating) || isUploadingImage || isProcessing;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-xl max-h-[92vh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Banner" : "Edit Banner"}
          description={
            isCreate
              ? "Upload an image and configure banner settings"
              : "Update banner information below"
          }
          isCreate={isCreate}
        />

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

            <div className="space-y-0.5">
              <SpacesImageUpload
                multiSize
                deferred
                label="Banner Image"
                businessId={AppDefault.BUSINESS_ID}
                value={previewUrl}
                onFileSelected={(file) => {
                  setPendingFile(file);
                  if (file) {
                    const objectUrl = URL.createObjectURL(file);
                    setPreviewUrl(objectUrl);
                    // Mark the form as dirty so the submit button enables;
                    // the real URLs are filled in onSubmit after upload.
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
                aspectRatio="banner"
                required
                disabled={isSubmitting}
                error={
                  (errors.image as any)?.message ||
                  (errors.image as any)?.root?.message
                }
                placeholder="Click to upload banner image"
              />

              <TextareaField
                control={control}
                name="description"
                label="Description"
                placeholder="Enter banner description (optional)"
                disabled={isSubmitting}
                error={errors.description}
                rows={3}
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
          </FormBody>

          <FormFooter
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            isCreate={isCreate}
            createMessage="Creating banner..."
            updateMessage="Updating banner..."
          >
            <CancelButton onClick={handleClose} disabled={isSubmitting} />
            <SubmitButton
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createText="Create Banner"
              updateText="Update Banner"
              submittingCreateText="Creating..."
              submittingUpdateText="Updating..."
            />
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
