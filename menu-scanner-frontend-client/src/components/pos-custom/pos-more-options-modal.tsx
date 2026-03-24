"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, Loader2, ChevronRight, ReceiptText, Percent, DollarSign, Check } from "lucide-react";

interface POSMoreOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerNote: string;
  onNoteChange: (note: string) => void;
}

export function POSMoreOptionsModal({
  open,
  onOpenChange,
  customerNote,
  onNoteChange,
}: POSMoreOptionsModalProps) {
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
  const [discountValue, setDiscountValue] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onOpenChange(false);
      setIsSubmitting(false);
    }, 300);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[440px] p-0 gap-0">
        {/* Hidden Title for Accessibility */}
        <DialogTitle className="sr-only">Order Options</DialogTitle>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b">
          <h2 className="text-lg font-semibold">Order Options</h2>
          <p className="text-xs text-muted-foreground mt-1">Add notes and discounts</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-5 overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Order Note */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-medium">Order Note</label>
            </div>
            <Textarea
              value={customerNote}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Special packaging, allergies, instructions..."
              rows={2}
              maxLength={150}
              className="text-sm resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{customerNote.length}/150</span>
              {customerNote && <Check className="w-3.5 h-3.5 text-green-500" />}
            </div>
          </div>

          {/* Discount Button */}
          <div className="pt-2 border-t">
            <button
              type="button"
              onClick={() => setShowDiscount(!showDiscount)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all",
                showDiscount
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4" />
                <span className="text-sm font-medium">Apply Discount</span>
              </div>
              <ChevronRight className={cn("w-4 h-4 transition-transform", showDiscount && "rotate-90")} />
            </button>
          </div>

          {/* Discount Section */}
          {showDiscount && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              {/* Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType("fixed");
                      setDiscountValue("");
                    }}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-md border text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                      discountType === "fixed"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:border-primary/50"
                    )}
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    Fixed
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType("percentage");
                      setDiscountValue("");
                    }}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-md border text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                      discountType === "percentage"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:border-primary/50"
                    )}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    Percent
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label htmlFor="discount-value" className="text-xs font-semibold text-muted-foreground">
                  {discountType === "fixed" ? "Amount" : "Percentage"}
                </label>
                <Input
                  id="discount-value"
                  type="number"
                  placeholder={discountType === "fixed" ? "0.00" : "0"}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  min="0"
                  step={discountType === "fixed" ? "0.01" : "0.1"}
                  className="h-9 text-sm"
                />
                {discountValue && (
                  <p className="text-xs text-primary font-semibold">
                    {discountType === "fixed"
                      ? formatCurrency(parseFloat(discountValue) || 0)
                      : `${discountValue}%`}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <label htmlFor="discount-reason" className="text-xs font-semibold text-muted-foreground">
                  Reason
                </label>
                <Input
                  id="discount-reason"
                  type="text"
                  placeholder="Loyalty, VIP, bulk order..."
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  maxLength={60}
                  className="h-9 text-sm"
                />
                <p className="text-xs text-muted-foreground text-right">{discountReason.length}/60</p>
              </div>

              {/* Summary */}
              {discountValue && (
                <div className="rounded-md border bg-primary/5 p-2.5 space-y-1">
                  <p className="text-xs font-semibold text-primary">Summary</p>
                  <div className="text-xs space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold text-primary">
                        {discountType === "fixed"
                          ? formatCurrency(parseFloat(discountValue) || 0)
                          : `${discountValue}%`}
                      </span>
                    </div>
                    {discountReason && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reason:</span>
                        <span className="truncate">{discountReason}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-muted/30 flex gap-3">
          <CustomButton
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Cancel
          </CustomButton>
          <CustomButton
            size="sm"
            className="flex-1"
            onClick={handleApply}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                Applying
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Apply
              </>
            )}
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
