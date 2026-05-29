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
} from "../store/models/schema/payment-options-schema";
import { PaymentOptionResponse } from "../store/models/response/payment-option-response";

type PaymentOptionFormData = z.infer<typeof createPaymentOptionSchema>;

const PAYMENT_OPTION_TYPE_OPTIONS = [
  { value: "CASH", label: "Cash" },
];

const PAYMENT_TYPE_OPTIONS = [
  { value: "SUBSCRIPTION", label: "Subscription" },
  { value: "USER_PLAN", label: "User Plan" },
  { value: "BUSINESS_RECORD", label: "Business Record" },
  { value: "REFUND", label: "Refund" },
  { value: "OTHER", label: "Other" },
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
    formState: { errors, isDirty },
  } = useForm<PaymentOptionFormData>({
    resolver: zodResolver(
      isCreate ? createPaymentOptionSchema : updatePaymentOptionSchema
    ),
    defaultValues: {
      name: "",
      paymentOptionType: "",
      paymentType: "SUBSCRIPTION",
      status: Status.ACTIVE,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (isCreate) {
      reset({
        name: "",
        paymentOptionType: "",
        paymentType: "SUBSCRIPTION",
        status: Status.ACTIVE,
      });
    } else if (paymentOption) {
      reset({
        name: paymentOption.name || "",
        paymentOptionType: paymentOption.paymentOptionType || "",
        paymentType: (paymentOption.paymentType || "SUBSCRIPTION") as any,
        status: (paymentOption.status || Status.ACTIVE) as "ACTIVE" | "INACTIVE",
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
      if (isCreate) {
        await dispatch(createPaymentOptionService(data)).unwrap();
        showToast.success(Messages.payment.created);
        handleClose();
      } else if (paymentOption?.id) {
        await dispatch(
          updatePaymentOptionService({
            id: paymentOption.id,
            payload: data,
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
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg mb-4">
                <p className="text-sm text-destructive font-medium">
                  {reduxError}
                </p>
              </div>
            )}

            <div className="space-y-4">
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
                label="Payment Option Type"
                placeholder="Select payment option type"
                options={PAYMENT_OPTION_TYPE_OPTIONS}
                required
                disabled={isSubmitting}
                error={errors.paymentOptionType}
              />

              <SelectField
                control={control}
                name="paymentType"
                label="Payment Type"
                placeholder="Select payment type"
                options={PAYMENT_TYPE_OPTIONS}
                required
                disabled={isSubmitting}
                error={errors.paymentType}
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
