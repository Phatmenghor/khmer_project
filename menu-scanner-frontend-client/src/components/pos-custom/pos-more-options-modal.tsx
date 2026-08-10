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
import { Tag, ChevronDown, BadgePercent, BadgeDollarSign } from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateDiscountAmount = (): number => {
    const value = parseFloat(discountValue) || 0;
    return discountType === "fixed" ? value : (currentOrderTotal * value) / 100;
  };

  const handleApply = () => {
    setIsSubmitting(true);

    if (showDiscount && discountValue && onDiscountApply) {
      const discountAmountValue = calculateDiscountAmount();
      if (discountAmountValue > 0) {
        onDiscountApply({
          type: discountType,
          value: parseFloat(discountValue),
          reason: "",
          beforeTotal: currentOrderTotal,
          afterTotal: Math.max(0, currentOrderTotal - discountAmountValue),
          discountAmount: discountAmountValue,
          appliedAt: new Date().toISOString(),
        });
        showToast.success(`Discount applied: saved ${formatCurrency(discountAmountValue)}`);
      }
    }

    setTimeout(() => {
      setShowDiscount(false);
      setDiscountValue("");
      onOpenChange(false);
      setIsSubmitting(false);
    }, 300);
  };

  const discountAmount = calculateDiscountAmount();
  const finalTotalAfterDiscount = Math.max(0, currentOrderTotal - discountAmount);

  return (
    <CustomModal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      size="default"
      disableScrollWrapper={true}
    >
      <FormHeader
        title="Order Options"
        description="Add customer notes or apply a custom discount"
        isCreate={false}
      />

      <FormBody className="space-y-4 px-1">

        {/* ── Order Note ─────────────────────────────────── */}
        <div className="space-y-1.5">
          <CustomTextarea
            label="Order Remarks / Note"
            id="order-note"
            value={customerNote}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Enter special instructions, customer request, or remarks..."
            rows={3}
            maxLength={200}
            className="resize-none text-xs"
          />
          <div className="flex justify-end">
            <span className="text-[10px] text-muted-foreground font-medium">{customerNote.length} / 200</span>
          </div>
        </div>

        {/* ── Apply Discount Toggle ───────────────────────── */}
        <div className="space-y-2 border-t border-border/60 pt-3">
          <CustomButton
            variant="unstyled"
            size="unstyled"
            type="button"
            onClick={() => setShowDiscount(!showDiscount)}
            className={cn(
              "w-full flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-xs font-bold transition-all border",
              showDiscount
                ? "border-red-500/50 bg-red-500/8 text-red-600 dark:text-red-400"
                : "border-border/70 bg-muted/30 text-foreground hover:border-primary/40 hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className={cn("p-1.5 rounded-[8px]", showDiscount ? "bg-red-500/15" : "bg-muted")}>
                <Tag className={cn("w-3.5 h-3.5", showDiscount ? "text-red-500 dark:text-red-400" : "text-muted-foreground")} />
              </div>
              <span className="font-bold text-sm">Apply Discount</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-200 text-muted-foreground", showDiscount && "rotate-180")} />
          </CustomButton>

          {showDiscount && (
            <div className="space-y-3 mt-1 p-3.5 border border-red-500/25 rounded-[12px] bg-gradient-to-b from-red-500/4 to-red-500/2 shadow-xs">

              {/* Discount Type Toggle Buttons */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-foreground uppercase tracking-wide">Discount Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <CustomButton
                    variant="unstyled"
                    size="unstyled"
                    type="button"
                    onClick={() => setDiscountType("fixed")}
                    className={cn(
                      "h-9 px-3 rounded-[8px] text-xs font-bold transition-all flex items-center justify-center gap-2 border",
                      discountType === "fixed"
                        ? "border-red-500/60 bg-red-500/10 text-red-600 dark:text-red-400 shadow-xs"
                        : "border-border/70 bg-background text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    <BadgeDollarSign className="w-3.5 h-3.5" />
                    Fixed Amount
                  </CustomButton>
                  <CustomButton
                    variant="unstyled"
                    size="unstyled"
                    type="button"
                    onClick={() => setDiscountType("percentage")}
                    className={cn(
                      "h-9 px-3 rounded-[8px] text-xs font-bold transition-all flex items-center justify-center gap-2 border",
                      discountType === "percentage"
                        ? "border-red-500/60 bg-red-500/10 text-red-600 dark:text-red-400 shadow-xs"
                        : "border-border/70 bg-background text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    <BadgePercent className="w-3.5 h-3.5" />
                    Percentage
                  </CustomButton>
                </div>
              </div>

              {/* Discount Value Input */}
              <CustomInput
                id="discount-value"
                type="text"
                inputMode="decimal"
                label={discountType === "fixed" ? "Discount Amount" : "Discount Percentage"}
                value={discountValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d*\.?\d*$/.test(val)) {
                    setDiscountValue(val);
                  }
                }}
                placeholder={discountType === "fixed" ? "Enter amount (e.g. 5.00)..." : "Enter percentage (e.g. 10)..."}
                rightIcon={
                  <span className="text-[11px] font-extrabold text-muted-foreground">
                    {discountType === "fixed" ? "$" : "%"}
                  </span>
                }
                size="md"
              />

              {/* Live Discount Preview */}
              {discountValue && parseFloat(discountValue) > 0 && (
                <div className="p-3 bg-background rounded-[10px] border border-red-500/20 space-y-1.5 text-xs shadow-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Order Subtotal</span>
                    <span className="font-semibold">{formatCurrency(currentOrderTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-red-600 dark:text-red-400 font-bold">
                    <span>Discount ({discountType === "percentage" ? `${discountValue}%` : "Fixed"})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-foreground font-extrabold pt-1.5 border-t border-border/60">
                    <span>New Total</span>
                    <span className="text-primary text-sm">{formatCurrency(finalTotalAfterDiscount)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </FormBody>

      <FormFooter isSubmitting={isSubmitting} isDirty={true} isCreate={false}>
        <CancelButton onClick={() => onOpenChange(false)} disabled={isSubmitting} />
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
