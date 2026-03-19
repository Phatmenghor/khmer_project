"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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

const paymentOptionSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
});

type PaymentOptionFormData = z.infer<typeof paymentOptionSchema>;

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentOptionFormData>({
    resolver: zodResolver(paymentOptionSchema),
    defaultValues: {
      name: "",
    },
  });

  // Fetch payment option details if in edit mode
  useEffect(() => {
    if (mode === ModalMode.UPDATE_MODE && paymentOptionId && isOpen) {
      dispatch(fetchPaymentOptionByIdService(paymentOptionId));
    }
  }, [mode, paymentOptionId, isOpen, dispatch]);

  // Populate form with selected option data
  useEffect(() => {
    if (selectedOption && mode === ModalMode.UPDATE_MODE) {
      form.reset({
        name: selectedOption.name,
      });
    }
  }, [selectedOption, mode, form]);

  const onSubmit = async (data: PaymentOptionFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        await dispatch(createPaymentOptionService(data)).unwrap();
        showToast.success("Payment option created successfully");
      } else {
        await dispatch(
          updatePaymentOptionService({
            id: paymentOptionId!,
            ...data,
          })
        ).unwrap();
        showToast.success("Payment option updated successfully");
      }
      form.reset();
      dispatch(clearSelectedPaymentOption());
      onClose();
    } catch (error: any) {
      showToast.error(error || "Failed to save payment option");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    dispatch(clearSelectedPaymentOption());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === ModalMode.CREATE_MODE
              ? "Create Payment Option"
              : "Edit Payment Option"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Cash, ABA, ACE, Khmer Bank"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
