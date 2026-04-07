"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { TextAreaField } from "@/components/shared/form-field/textarea-field";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Validation schema for cancel order form
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

  // Reset state when modal opens/closes
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
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to cancel order";
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[92dvh] p-0 flex flex-col">
        {/* Header */}
        <FormHeader
          title="Cancel Order"
          description={`You are about to cancel order #${orderNumber}`}
          showAvatar={false}
          isCreate={false}
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Body */}
          <FormBody>
            {/* Alert Box */}
            <Alert className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                This action cannot be undone. The order will be marked as cancelled and no longer processing.
              </AlertDescription>
            </Alert>

            {/* Order Information Display */}
            <div className="space-y-3 p-4 bg-muted rounded-lg border border-muted-foreground/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Order Number:</span>
                <span className="text-sm font-semibold text-foreground">#{orderNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Status:</span>
                <span className="text-sm font-semibold px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
                  CANCELLED
                </span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Customer Note Field */}
            <div className="space-y-2">
              <TextAreaField
                control={control}
                name="customerNote"
                label="Cancellation Note (Optional)"
                placeholder="Please tell us why you're cancelling this order (max 500 characters)..."
                disabled={isSubmitting}
                rows={4}
                error={errors.customerNote}
              />
              <p className="text-xs text-muted-foreground">
                This note will be recorded with the cancellation and may help us improve our service.
              </p>
            </div>
          </FormBody>

          {/* Footer */}
          <FormFooter
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            isCreate={false}
            createMessage=""
            updateMessage="Cancelling order..."
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial"
            >
              Keep Order
            </Button>

            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isSubmitting ? "Cancelling..." : "Cancel Order"}
            </Button>
          </FormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
