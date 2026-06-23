"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomModal } from "./custom-modal";
import { Messages } from "@/constants/messages";
import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";

import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { Alert, AlertDescription } from "@/components/ui/alert";


const cancelOrderSchema = z.object({
  customerNote: z.string().max(500, "Note cannot exceed 500 characters").optional().default(""),
});

type CancelOrderFormData = z.infer<typeof cancelOrderSchema>;

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  onConfirm: (data: { status: "CANCELLED"; customerNote: string }) => Promise<void>;
}

export function CancelOrderModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  onConfirm,
}: CancelOrderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CancelOrderFormData>({
    resolver: zodResolver(cancelOrderSchema),
    defaultValues: {
      customerNote: "",
    },
    mode: "onChange",
  });


  useEffect(() => {
    if (isOpen) {
      reset();
      setError(null);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: CancelOrderFormData) => {
    try {
      setError(null);
      setIsSubmitting(true);

      const payload = {
        status: "CANCELLED" as const,
        customerNote: data.customerNote || "",
      };

      await onConfirm(payload);
      handleClose();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : Messages.orders.cancelFailed;
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} size="lg" className="max-h-[92vh] -col">
      
        {}
        <FormHeader
          title="Cancel Order"
          description={`You are about to cancel order #${orderNumber}`}
          showAvatar={false}
          isCreate={false}
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-visible"
        >
          {}
          <FormBody>
            {}
            <div className="space-y-2 p-3 bg-muted rounded border border-muted-foreground/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Order Number:</span>
                <span className="text-xs font-semibold text-foreground">#{orderNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">New Status:</span>
                <span className="text-xs font-semibold px-1 py-1 rounded bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
                  CANCELLED
                </span>
              </div>
            </div>

            {}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-3 w-3" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {}
            <div className="space-y-1">
              <TextareaField
                control={control}
                name="customerNote"
                label="Cancellation Note (Optional)"
                placeholder="Please tell us why you're cancelling this order (max 500 characters)..."
                disabled={isSubmitting}
                rows={4}
                error={errors.customerNote}
              />
            </div>
          </FormBody>

          {}
          <FormFooter
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            isCreate={false}
            createMessage=""
            updateMessage="Cancelling order..."
          >
            <CustomButton
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial"
            >
              Keep Order
            </CustomButton>

            <CustomButton
              type="submit"
              variant="destructive"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isSubmitting ? "Cancelling..." : "Cancel Order"}
            </CustomButton>
          </FormFooter>
        </form>
      
    </CustomModal>
  );
}
