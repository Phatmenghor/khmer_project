"use client";

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
import { ModalMode } from "@/constants/status/status";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  createPaymentOptionService,
  updatePaymentOptionService,
  fetchPaymentOptionByIdService,
} from "../store/thunks/payment-options-thunks";
import { selectSelectedPaymentOption } from "../store/selectors/payment-options-selectors";
import { clearSelectedPaymentOption } from "../store/slice/payment-options-slice";
import {
  createPaymentOptionSchema,
  updatePaymentOptionSchema,
} from "../store/models/schema/payment-options-schema";

type PaymentOptionFormData = z.infer<typeof createPaymentOptionSchema>;

const PAYMENT_TYPE_OPTIONS = [
  { value: "CASH", label: "Cash" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

interface PaymentOptionsModalProps {
  isOpen: boolean;
  mode: ModalMode;
  paymentOptionId?: string;
  onClose: () => void;
}

export default function PaymentOptionsModal({
  isOpen,
  mode,
  paymentOptionId,
  onClose,
}: PaymentOptionsModalProps) {
  const dispatch = useAppDispatch();
  const selectedOption = useAppSelector(selectSelectedPaymentOption);
  const isCreate = mode === ModalMode.CREATE_MODE;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PaymentOptionFormData>({
    resolver: zodResolver(
      isCreate ? createPaymentOptionSchema : updatePaymentOptionSchema
    ),
    defaultValues: {
      name: "",
      paymentOptionType: "",
      status: "ACTIVE",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isCreate || !isOpen) return;
    if (paymentOptionId) {
      dispatch(fetchPaymentOptionByIdService(paymentOptionId));
    }
  }, [isCreate, paymentOptionId, isOpen, dispatch]);

  useEffect(() => {
    if (selectedOption && !isCreate) {
      reset({
        name: selectedOption.name,
        paymentOptionType: selectedOption.paymentOptionType,
        status: selectedOption.status,
      });
    }
  }, [selectedOption, isCreate, reset]);

  const onSubmit = async (data: PaymentOptionFormData) => {
    try {
      if (isCreate) {
        await dispatch(createPaymentOptionService(data)).unwrap();
        showToast.success("Payment option created successfully");
      } else {
        await dispatch(
          updatePaymentOptionService({
            id: paymentOptionId!,
            payload: data,
          })
        ).unwrap();
        showToast.success("Payment option updated successfully");
      }
      reset();
      dispatch(clearSelectedPaymentOption());
      onClose();
    } catch (error: any) {
      showToast.error(error || "Failed to save payment option");
    }
  };

  const handleClose = () => {
    reset();
    dispatch(clearSelectedPaymentOption());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <FormHeader
          title={isCreate ? "Create Payment Option" : "Edit Payment Option"}
          description={isCreate ? "Add a new payment method" : "Update payment method details"}
          isCreate={isCreate}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <FormBody>
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
                label="Payment Type"
                placeholder="Select payment type"
                options={PAYMENT_TYPE_OPTIONS}
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
          </FormBody>

          <FormFooter
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            isCreate={isCreate}
            createMessage="Creating payment option..."
            updateMessage="Updating payment option..."
          >
            <CancelButton onClick={handleClose} disabled={isSubmitting} />
            <SubmitButton isSubmitting={isSubmitting} label={isCreate ? "Create" : "Update"} />
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
