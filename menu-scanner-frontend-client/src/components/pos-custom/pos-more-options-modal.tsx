"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomButton } from "@/components/shared/button/custom-button";
import { cn } from "@/lib/utils";
import { Loader2, ChevronRight, Percent, DollarSign, SlidersHorizontal, FileText, Tag } from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
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
        showToast.success(`Discount applied: saved $${discountAmountValue.toFixed(2)}`);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[400px] p-0 gap-0">
        <DialogTitle className="sr-only">Order Options</DialogTitle>

        {/* Header */}
        <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/90 to-primary px-5 pt-5 pb-4 flex-shrink-0">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white" />
            <div className="absolute bottom-0 left-6 w-14 h-14 rounded-full bg-white" />
          </div>
          <div className="relative flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <SlidersHorizontal className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Order Options</h2>
              <p className="text-[11px] text-white/70 mt-0.5">Add note or apply discount</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-4 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              Order Note
            </label>
            <Textarea
              value={customerNote}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Special instructions..."
              rows={2}
              maxLength={100}
              className="text-xs resize-none border-slate-200 focus:border-primary"
            />
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground">{customerNote.length} / 100</span>
            </div>
          </div>

          <div className="space-y-2 border-t pt-3">
            <button
              type="button"
              onClick={() => setShowDiscount(!showDiscount)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all",
                showDiscount
                  ? "border border-red-300 bg-red-50 text-red-700"
                  : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-primary/40 hover:bg-primary/5"
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn("p-1 rounded", showDiscount ? "bg-red-100" : "bg-slate-200")}>
                  <Tag className={cn("w-3 h-3", showDiscount ? "text-red-600" : "text-slate-500")} />
                </div>
                <span className="font-semibold text-xs">Apply Discount</span>
              </div>
              <ChevronRight className={cn("w-4 h-4 transition-transform duration-200", showDiscount && "rotate-90")} />
            </button>

            {}
            {showDiscount && (
              <div className="space-y-3 mt-2 p-3 border border-red-200 rounded bg-red-50">
                {}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType("fixed");
                        setDiscountValue("");
                      }}
                      className={cn(
                        "px-2 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1",
                        discountType === "fixed"
                          ? "border border-red-400 bg-white text-red-600"
                          : "border border-red-200 bg-white text-slate-600 hover:border-red-300"
                      )}
                    >
                      <DollarSign className="w-3 h-3" />
                      Fixed
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType("percentage");
                        setDiscountValue("");
                      }}
                      className={cn(
                        "px-2 py-1.5 rounded text-xs font-medium transition-all flex items-center justify-center gap-1",
                        discountType === "percentage"
                          ? "border border-red-400 bg-white text-red-600"
                          : "border border-red-200 bg-white text-slate-600 hover:border-red-300"
                      )}
                    >
                      <Percent className="w-3 h-3" />
                      %
                    </button>
                  </div>
                </div>

                {}
                <div className="space-y-1.5">
                  <label htmlFor="discount-value" className="text-xs font-semibold text-slate-700">
                    {discountType === "fixed" ? "Amount" : "Percentage (0-100%)"}
                  </label>
                  <div className="relative">
                    <Input
                      id="discount-value"
                      type="number"
                      placeholder={discountType === "fixed" ? "0.00" : "0"}
                      value={discountValue}
                      onChange={(e) => {
                        if (discountType === "percentage") {
                          const val = parseFloat(e.target.value) || 0;
                          if (val <= 100) {
                            setDiscountValue(e.target.value);
                          }
                        } else {
                          setDiscountValue(e.target.value);
                        }
                      }}
                      min="0"
                      max={discountType === "percentage" ? "100" : undefined}
                      step={discountType === "fixed" ? "0.01" : "1"}
                      className="h-10 text-sm pr-8 border border-slate-300 focus:border-primary"
                    />
                    {discountType === "fixed" ? (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">$</span>
                    ) : (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">%</span>
                    )}
                  </div>
                </div>

                {}
                <div className="space-y-1.5">
                  <label htmlFor="discount-reason" className="text-xs font-semibold text-slate-700">
                    Reason
                  </label>
                  <Textarea
                    id="discount-reason"
                    placeholder="Loyalty, VIP, bulk..."
                    rows={2}
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    maxLength={100}
                    className="text-xs resize-none border border-slate-300 focus:border-primary"
                  />
                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">{discountReason.length} / 100</span>
                  </div>
                </div>

                {}
                {discountValue && (
                  <div className="space-y-2 border-t pt-3 mt-3">
                    <p className="text-xs font-semibold text-slate-700">Audit Trail Preview</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <p className="text-muted-foreground">Before</p>
                        <p className="font-semibold text-slate-900">${currentOrderTotal.toFixed(2)}</p>
                      </div>
                      <div className="p-2 bg-white rounded border border-red-200">
                        <p className="text-muted-foreground">Discount</p>
                        <p className="font-semibold text-red-600">
                          -{calculateDiscountAmount().toFixed(2)}
                        </p>
                      </div>
                      <div className="p-2 bg-white rounded border border-green-200">
                        <p className="text-muted-foreground">After</p>
                        <p className="font-semibold text-green-600">
                          ${Math.max(0, currentOrderTotal - calculateDiscountAmount()).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {}
        <div className="px-4 py-3 border-t bg-slate-50 flex gap-2.5">
          <CustomButton
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-sm font-medium border-slate-300 hover:bg-slate-100 text-slate-700"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </CustomButton>
          <CustomButton
            size="sm"
            className="flex-1 h-9 text-sm font-medium bg-primary hover:bg-primary/95 text-white shadow-sm"
            onClick={handleApply}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Saving
              </>
            ) : (
              <span>Apply</span>
            )}
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
