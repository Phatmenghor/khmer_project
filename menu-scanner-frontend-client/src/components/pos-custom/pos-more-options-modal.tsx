"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomButton } from "@/components/shared/button/custom-button";
import { cn } from "@/lib/utils";
import { X, Loader2, ChevronRight, Percent, DollarSign, Settings2 } from "lucide-react";

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
      <DialogContent className="w-full sm:max-w-[400px] p-0 gap-0">
        {/* Hidden Title for Accessibility */}
        <DialogTitle className="sr-only">Order Options</DialogTitle>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg shrink-0">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <h2 className="text-lg font-semibold text-slate-900">Order Options</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
          {/* ─── Order Note Section ─── */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-900 block">Order Note</label>
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

          {/* ─── Discount Section ─── */}
          <div className="space-y-2 border-t pt-3">
            {/* Toggle Button */}
            <button
              type="button"
              onClick={() => setShowDiscount(!showDiscount)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-all",
                showDiscount
                  ? "border border-red-400 bg-red-50 text-red-700"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:bg-red-50/20"
              )}
            >
              <div className="flex items-center gap-2">
                <Percent className={cn("w-3.5 h-3.5", showDiscount ? "text-red-600" : "text-slate-600")} />
                <span className="font-medium">Discount</span>
              </div>
              <ChevronRight className={cn("w-4 h-4 transition-transform", showDiscount && "rotate-90")} />
            </button>

            {/* Discount Form */}
            {showDiscount && (
              <div className="space-y-3 mt-2 p-3 border border-red-200 rounded bg-red-50">
                {/* Type Selection */}
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

                {/* Amount Input */}
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

                {/* Reason Input */}
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
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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
