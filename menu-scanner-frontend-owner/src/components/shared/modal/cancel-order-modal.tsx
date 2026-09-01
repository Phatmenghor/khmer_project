"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { CustomModal } from "./custom-modal";
import { CustomButton } from "@/components/shared/button/custom-button";
import { TextareaField } from "@/components/shared/form-field/text-area-field";
import { Messages } from "@/constants/messages";

const cancelOrderSchema = z.object({
  customerNote: z
    .string()
    .max(500, "Note cannot exceed 500 characters")
    .optional()
    .default(""),
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
    formState: { errors },
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
      setIsSubmitting(false);
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    if (isSubmitting) return;
    reset();
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

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

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} size="sm">
      {/* ── Compact Header ── */}
      <div className="flex items-center gap-3 p-3.5 px-4 sm:px-5 border-b border-border/60 bg-gradient-to-r from-background via-card to-background shrink-0">
        <div className="p-2.5 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shrink-0 shadow-2xs">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-base text-foreground leading-tight">Cancel Order</h3>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate">
            Order #{orderNumber}
          </p>
        </div>
      </div>

      {/* ── Form Body ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <div className="p-3.5 px-4 sm:px-5 space-y-3 bg-card/40">
          {/* Order Details Summary Row */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border/80 text-xs space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-semibold">Order Number:</span>
              <span className="font-mono font-bold text-foreground">#{orderNumber}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <span className="text-muted-foreground font-semibold">New Status:</span>
              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold border border-red-500/20">
                CANCELLED
              </span>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Cancellation Note */}
          <div className="space-y-1">
            <TextareaField
              control={control}
              name="customerNote"
              label="Cancellation Note (Optional)"
              placeholder="Please tell us why you are cancelling this order..."
              disabled={isSubmitting}
              rows={3}
              error={errors.customerNote}
            />
          </div>
        </div>

        {/* ── Compact Footer ── */}
        <div className="p-3 px-4 sm:px-5 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-2.5 shrink-0">
          <CustomButton
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-9 px-4 text-xs font-bold rounded-xl border-border/80 hover:bg-muted/50 transition-all cursor-pointer"
          >
            Cancel
          </CustomButton>

          <CustomButton
            type="submit"
            variant="destructive"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="h-9 px-5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xs transition-all cursor-pointer"
          >
            {isSubmitting ? "Cancelling..." : "Confirm"}
          </CustomButton>
        </div>
      </form>
    </CustomModal>
  );
}
