"use client";

import { Messages } from "@/constants/messages";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { SpacesImageUpload } from "@/components/shared/form-field/spaces-image-upload";
import { uploadMultiSize } from "@/services/spaces-service";
import { AppDefault } from "@/constants/app-resource/default/default";
import { showToast } from "@/components/shared/common/show-toast";
import { ModalMode, Status } from "@/constants/status/status";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  createPaymentOptionService,
  updatePaymentOptionService,
} from "../store/thunks/payment-options-thunks";
import {
  selectPaymentOptionsOperations,
  selectPaymentOptionsError,
} from "../store/selectors/payment-options-selectors";
import { clearError } from "../store/slice/payment-options-slice";
import {
  createPaymentOptionSchema,
  updatePaymentOptionSchema,
  CreatePaymentOptionData,
} from "../store/models/schema/payment-options-schema";
import { PaymentOptionResponse } from "../store/models/response/payment-option-response";

const PAYMENT_OPTION_TYPE_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "BANK", label: "Bank Transfer" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

interface PaymentOptionsModalProps {
  isOpen: boolean;
  mode: ModalMode;
  paymentOption: PaymentOptionResponse | null;
  onClose: () => void;
}

export default function PaymentOptionsModal({
  isOpen,
  mode,
  paymentOption,
  onClose,
}: PaymentOptionsModalProps) {
  const dispatch = useAppDispatch();
  const operations = useAppSelector(selectPaymentOptionsOperations);
  const reduxError = useAppSelector(selectPaymentOptionsError);
  const isCreate = mode === ModalMode.CREATE_MODE;

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!previewUrl || !previewUrl.startsWith("blob:")) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreatePaymentOptionData>({
    resolver: zodResolver(
      isCreate ? createPaymentOptionSchema : updatePaymentOptionSchema
    ),
    defaultValues: {
      name: "",
      paymentOptionType: "",
      status: Status.ACTIVE,
      image: { sm: "", md: "", o: "" },
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (isCreate) {
      reset({
        name: "",
        paymentOptionType: "",
        status: Status.ACTIVE,
        image: { sm: "", md: "", o: "" },
      });
      setPendingFile(null);
      setPreviewUrl("");
    } else if (paymentOption) {
      reset({
        name: paymentOption.name || "",
        paymentOptionType: paymentOption.paymentOptionType || "",
        status: (paymentOption.status || Status.ACTIVE) as "ACTIVE" | "INACTIVE",
        image: {
          sm: paymentOption.image?.sm || "",
          md: paymentOption.image?.md || "",
          o: paymentOption.image?.o || "",
        },
      });
      setPendingFile(null);
      setPreviewUrl(
        paymentOption.image?.md || paymentOption.image?.o || paymentOption.image?.sm || "",
      );
    }
  }, [isOpen, isCreate, paymentOption, reset]);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: CreatePaymentOptionData) => {
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

      const payload: CreatePaymentOptionData = {
        name: data.name || "",
        paymentOptionType: data.paymentOptionType,
        status: data.status,
        image: imagePayload,
      };

      if (isCreate) {
        await dispatch(createPaymentOptionService(payload)).unwrap();
        showToast.success(Messages.payment.created);
        handleClose();
      } else if (paymentOption?.id) {
        await dispatch(
          updatePaymentOptionService({
            id: paymentOption.id,
            payload,
          })
        ).unwrap();
        showToast.success(Messages.payment.updated);
        handleClose();
      }
    } catch (error: unknown) {
      showToast.error(
        (error as { message?: string })?.message || Messages.payment.saveFailed,
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
    onClose();
  };

  const isSubmitting =
    (isCreate ? operations.isCreating : operations.isUpdating) ||
    isUploadingImage ||
    isProcessing;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[92vh] p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Payment Option" : "Edit Payment Option"}
          description={
            isCreate
              ? "Add a payment method your customers can use at checkout"
              : "Update payment option information below"
          }
          isCreate={isCreate}
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
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
                label="QR Code / Payment Image"
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
                placeholder="Click to upload QR code or payment method image"
                helperText="Square image works best — e.g. bank QR code (500×500)"
              />

              <div className="border-t pt-4">
                <h3 className="text-xs font-semibold text-foreground mb-3">
                  Payment Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    control={control}
                    name="name"
                    label="Payment Method Name"
                    placeholder="e.g. ABA Bank, Cash, Wing"
                    required
                    disabled={isSubmitting}
                    error={errors.name}
                  />

                  <SelectField
                    control={control}
                    name="paymentOptionType"
                    label="Payment Type"
                    placeholder="Select type"
                    options={PAYMENT_OPTION_TYPE_OPTIONS}
                    required
                    disabled={isSubmitting}
                    error={errors.paymentOptionType}
                  />

                  <SelectField
                    control={control}
                    name="status"
                    label="Status"
                    placeholder="Select status"
                    options={STATUS_OPTIONS}
                    required
                    disabled={isSubmitting}
                    error={errors.status}
                  />
                </div>
              </div>
            </div>
          </FormBody>

          <FormFooter
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            isCreate={isCreate}
            createMessage="Creating payment option..."
            updateMessage="Updating payment option..."
          >
            <CancelButton onClick={handleClose} disabled={isSubmitting} />
            <SubmitButton
              isSubmitting={isSubmitting}
              isDirty={isDirty}
              isCreate={isCreate}
              createText="Create Payment Option"
              updateText="Update Payment Option"
              submittingCreateText="Creating..."
              submittingUpdateText="Updating..."
            />
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
