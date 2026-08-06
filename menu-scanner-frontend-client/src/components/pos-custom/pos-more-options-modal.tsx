"use client";

import { useState } from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { FormFooter } from "@/components/shared/form-field/form-footer";
import { CancelButton, CustomButton, SubmitButton } from "@/components/shared/button/custom-button";
import { CustomInput } from "@/components/shared/form-field/custom-input";
import { CustomTextarea } from "@/components/shared/form-field/custom-textarea";
import { cn } from "@/lib/utils";
import { Loader2, ChevronRight, Percent, DollarSign, FileText, Tag } from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
import { formatCurrency } from "@/utils/common/currency-format";

interface POSMoreOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerNote: string;
  onNoteChange: (note: string) => void;
  currentOrderTotal?: number;
  onDiscountApply?: (discount: {
    type: "fixed" | "percentage";
    value: number;
    reason: string;
    beforeTotal: number;
    afterTotal: number;
    discountAmount: number;
    appliedAt: string;
  }) => void;
}

export function POSMoreOptionsModal({
  open,
  onOpenChange,
  customerNote,
  onNoteChange,
  currentOrderTotal = 0,
  onDiscountApply,
}: POSMoreOptionsModalProps) {
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
  const [discountValue, setDiscountValue] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateDiscountAmount = (): number => {
    const value = parseFloat(discountValue) || 0;
    if (discountType === "fixed") {
      return value;
    } else {
      return (currentOrderTotal * value) / 100;
    }
  };

  const handleApply = () => {
    setIsSubmitting(true);

    if (showDiscount && discountValue && onDiscountApply) {
      const discountAmountValue = calculateDiscountAmount();
      if (discountAmountValue > 0) {
        const beforeTotal = currentOrderTotal;
        const afterTotal = Math.max(0, currentOrderTotal - discountAmountValue);

        const discountPayload = {
          type: discountType,
          value: parseFloat(discountValue),
          reason: discountReason || "Manual discount applied at POS",
          beforeTotal,
          afterTotal,
          discountAmount: discountAmountValue,
          appliedAt: new Date().toISOString(),
        };
        onDiscountApply(discountPayload);
        showToast.success(`Discount applied: saved ${formatCurrency(discountAmountValue)}`);
      }
    }

    setTimeout(() => {
      setShowDiscount(false);
      setDiscountValue("");
      setDiscountReason("");
      onOpenChange(false);
      setIsSubmitting(false);
    }, 300);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const discountAmount = calculateDiscountAmount();
  const finalTotalAfterDiscount = Math.max(0, currentOrderTotal - discountAmount);

  return (
    <CustomModal
      isOpen={open}
      onClose={handleClose}
      size="default"
      disableScrollWrapper={true}
    >
      <FormHeader
        title="Order Options"
        description="Add customer notes or apply a custom discount"
        isCreate={false}
      />

      <FormBody className="space-y-4">
        {/* Customer Note Section */}
        <div className="space-y-1.5">
          <CustomTextarea
            label="Order Note"
            value={customerNote}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Special instructions or customer request..."
            rows={2}
            maxLength={100}
          />
          <div className="flex justify-end">
            <span className="text-[10px] text-muted-foreground font-medium">{customerNote.length} / 100</span>
          </div>
        </div>

        {/* Apply Discount Section */}
        <div className="space-y-2 border-t border-border/70 pt-3">
          <CustomButton
            variant="unstyled"
            size="unstyled"
            type="button"
            onClick={() => setShowDiscount(!showDiscount)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-xs font-bold transition-all border",
              showDiscount
                ? "border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400"
                : "border-border/80 bg-muted/20 text-foreground hover:border-primary/40 hover:bg-muted/40"
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn("p-1 rounded-[6px]", showDiscount ? "bg-red-500/20" : "bg-muted")}>
                <Tag className={cn("w-3.5 h-3.5", showDiscount ? "text-red-600 dark:text-red-400" : "text-muted-foreground")} />
              </div>
              <span>Apply Discount</span>
            </div>
            <ChevronRight className={cn("w-4 h-4 transition-transform duration-200", showDiscount && "rotate-90")} />
          </CustomButton>

          {showDiscount && (
            <div className="space-y-3 mt-2 p-3 border border-red-500/30 rounded-[10px] bg-red-500/5">
              {/* Discount Type Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">Discount Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <CustomButton
                    variant="unstyled"
                    size="unstyled"
                    type="button"
                    onClick={() => {
                      setDiscountType("fixed");
                      setDiscountValue("");
                    }}
                    className={cn(
                      "px-2 py-1.5 rounded-[6px] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border",
                      discountType === "fixed"
                        ? "border-red-500 bg-background text-red-600 font-bold shadow-2xs"
                        : "border-border/80 bg-background text-muted-foreground hover:border-red-300"
                    )}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Fixed ($)
                  </CustomButton>
                  <CustomButton
                    variant="unstyled"
                    size="unstyled"
                    type="button"
                    onClick={() => {
                      setDiscountType("percentage");
                      setDiscountValue("");
                    }}
                    className={cn(
                      "px-2 py-1.5 rounded-[6px] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border",
                      discountType === "percentage"
                        ? "border-red-500 bg-background text-red-600 font-bold shadow-2xs"
                        : "border-border/80 bg-background text-muted-foreground hover:border-red-300"
                    )}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    Percentage (%)
                  </CustomButton>
                </div>
              </div>

              {/* Amount / Percentage Input */}
              <div className="space-y-1">
                <CustomInput
                  id="discount-value"
                  type="number"
                  label={discountType === "fixed" ? "Discount Amount ($)" : "Discount Percentage (0-100%)"}
                  step={discountType === "fixed" ? "0.01" : "1"}
                  min="0"
                  max={discountType === "percentage" ? "100" : undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "fixed" ? "0.00" : "0"}
                  size="sm"
                />
              </div>

              {/* Reason Input */}
              <div className="space-y-1">
                <CustomInput
                  id="discount-reason"
                  type="text"
                  label="Reason (Optional)"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="e.g. VIP Customer, Promotional deal..."
                  size="sm"
                />
              </div>

              {/* Discount Calculation Summary */}
              {discountValue && parseFloat(discountValue) > 0 && (
                <div className="p-2.5 bg-background rounded-[8px] border border-red-500/20 space-y-1 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Order Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(currentOrderTotal)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Discount:</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                  <div className="flex justify-between text-foreground font-extrabold pt-1 border-t border-border/60">
                    <span>New Total:</span>
                    <span className="text-primary">{formatCurrency(finalTotalAfterDiscount)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </FormBody>

      <FormFooter
        isSubmitting={isSubmitting}
        isDirty={true}
        isCreate={false}
      >
        <CancelButton onClick={handleClose} disabled={isSubmitting} />
        <SubmitButton
          onClick={handleApply}
          isSubmitting={isSubmitting}
          isDirty={true}
          isCreate={false}
          updateText="Apply Options"
          submittingUpdateText="Saving..."
        />
      </FormFooter>
    </CustomModal>
  );
}
