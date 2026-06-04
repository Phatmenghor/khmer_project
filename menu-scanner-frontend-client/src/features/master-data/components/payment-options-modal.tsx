"use client";

import { Messages } from "@/constants/messages";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton } from "@/components/shared/form-field/cancel-button";
import { SubmitButton } from "@/components/shared/form-field/submid-button";
import { ClickableImageUpload } from "@/components/shared/form-field/clickable-image-upload";
import { showToast } from "@/components/shared/common/show-toast";
import { ModalMode, Status } from "@/constants/status/status";
import { useAppDispatch, useAppSelector } from "@/store";
import { uploadImage } from "@/utils/common/upload-image";
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
} from "../store/models/schema/payment-options-schema";
import { PaymentOptionResponse } from "../store/models/response/payment-option-response";

type PaymentOptionFormData = z.infer<typeof createPaymentOptionSchema>;

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
  const isSubmitting = isCreate ? operations.isCreating : operations.isUpdating;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<PaymentOptionFormData>({
    resolver: zodResolver(
      isCreate ? createPaymentOptionSchema : updatePaymentOptionSchema
    ),
    defaultValues: {
      name: "",
      paymentOptionType: "",
      status: Status.ACTIVE,
      imageUrl: "",
    },
    mode: "onChange",
  });

  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (!isOpen) return;

    if (isCreate) {
      reset({
        name: "",
        paymentOptionType: "",
        status: Status.ACTIVE,
        imageUrl: "",
      });
    } else if (paymentOption) {
      reset({
        name: paymentOption.name || "",
        paymentOptionType: paymentOption.paymentOptionType || "",
        status: (paymentOption.status || Status.ACTIVE) as "ACTIVE" | "INACTIVE",
        imageUrl: paymentOption.imageUrl || "",
      });
    }
  }, [isOpen, isCreate, paymentOption, reset]);


  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  const onSubmit = async (data: PaymentOptionFormData) => {
    try {
      let processedData = { ...data };
      if (data.imageUrl && !data.imageUrl.startsWith("http")) {
        processedData.imageUrl = await uploadImage(data.imageUrl);
      }
      if (isCreate) {
        await dispatch(createPaymentOptionService(processedData)).unwrap();
        showToast.success(Messages.payment.created);
        handleClose();
      } else if (paymentOption?.id) {
        await dispatch(
          updatePaymentOptionService({
            id: paymentOption.id,
            payload: processedData,
          })
        ).unwrap();
        showToast.success(Messages.payment.updated);
        handleClose();
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.payment.saveFailed);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-2xl p-0 flex flex-col">
        <FormHeader
          title={isCreate ? "Create New Payment Option" : "Edit Payment Option"}
          description={
            isCreate
              ? "Fill out the form to create a new payment option"
              : "Update payment option information below"
          }
          isCreate={isCreate}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <FormBody>
            {reduxError && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded mb-3">
                <p className="text-xs text-destructive font-medium">
                  {reduxError}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <TextField
                control={control}
                name="name"
                label="Payment Method Name"
                placeholder="e.g., Cash, ABA, ACE, Khmer Bank"
                required
                disabled={isSubmitting}
                error={errors.name}
              />

              <SelectField
                control={control}
                name="paymentOptionType"
                label="Type"
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

              <ClickableImageUpload
                label="QR Code / Payment Method Image"
                value={imageUrl}
                onChange={(base64) => setValue("imageUrl", base64, { shouldDirty: true })}
                disabled={isSubmitting}
                placeholder="Click to upload QR code or payment method image"
                helperText="PNG, JPG, GIF up to 10MB"
                height="h-32"
                aspectRatio="square"
              />
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
