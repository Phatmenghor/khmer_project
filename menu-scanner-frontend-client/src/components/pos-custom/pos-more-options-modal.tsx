"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, Loader2, ChevronRight, ReceiptText, Percent, DollarSign, Check, AlertCircle } from "lucide-react";

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
      <DialogContent className="w-full sm:max-w-[500px] p-0 gap-0">
        {/* Hidden Title for Accessibility */}
        <DialogTitle className="sr-only">Order Options</DialogTitle>

        {/* Header */}
        <div className="px-6 pt-6 pb-3 border-b bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-xl font-bold text-slate-900">Order Options</h2>
          <p className="text-xs text-muted-foreground mt-1">Customize your order details</p>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* ─── Order Note Section ─── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <ReceiptText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900 block">Order Note</label>
                <p className="text-xs text-muted-foreground">Add special instructions for this order</p>
              </div>
            </div>
            <Textarea
              value={customerNote}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="E.g., Special packaging, allergies, delivery instructions..."
              rows={3}
              maxLength={150}
              className="text-sm resize-none border-slate-200 focus:border-blue-400"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{customerNote.length} / 150</span>
              {customerNote && (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Added</span>
                </div>
              )}
            </div>
          </div>

          {/* ─── Discount Section ─── */}
          <div className="space-y-3 border-t pt-4">
            {/* Toggle Button */}
            <button
              type="button"
              onClick={() => setShowDiscount(!showDiscount)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all duration-200",
                showDiscount
                  ? "border-orange-300 bg-orange-50 text-orange-900 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg transition-colors", showDiscount ? "bg-orange-200" : "bg-slate-100")}>
                  <Percent className={cn("w-4 h-4", showDiscount ? "text-orange-600" : "text-slate-600")} />
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold block">Apply Discount</span>
                  <span className="text-xs text-muted-foreground">Offer special pricing</span>
                </div>
              </div>
              <ChevronRight className={cn("w-5 h-5 transition-transform duration-200", showDiscount && "rotate-90")} />
            </button>

            {/* Discount Form */}
            {showDiscount && (
              <div className="space-y-4 mt-4 p-4 border-2 border-orange-200 rounded-xl bg-gradient-to-br from-orange-50 to-white">
                {/* Type Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Discount Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType("fixed");
                        setDiscountValue("");
                      }}
                      className={cn(
                        "px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium flex items-center justify-center gap-2",
                        discountType === "fixed"
                          ? "border-orange-400 bg-white text-orange-600 shadow-md"
                          : "border-orange-200 bg-orange-50/50 text-slate-600 hover:border-orange-300"
                      )}
                    >
                      <DollarSign className="w-4 h-4" />
                      Fixed Amount
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType("percentage");
                        setDiscountValue("");
                      }}
                      className={cn(
                        "px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium flex items-center justify-center gap-2",
                        discountType === "percentage"
                          ? "border-orange-400 bg-white text-orange-600 shadow-md"
                          : "border-orange-200 bg-orange-50/50 text-slate-600 hover:border-orange-300"
                      )}
                    >
                      <Percent className="w-4 h-4" />
                      Percentage
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label htmlFor="discount-value" className="text-xs font-semibold text-slate-700">
                    {discountType === "fixed" ? "Discount Amount" : "Discount Percentage"}
                  </label>
                  <div className="relative">
                    <Input
                      id="discount-value"
                      type="number"
                      placeholder={discountType === "fixed" ? "0.00" : "0"}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      min="0"
                      step={discountType === "fixed" ? "0.01" : "0.1"}
                      className="h-10 text-sm pr-12 border-slate-300 focus:border-orange-400"
                    />
                    {discountType === "fixed" ? (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">$</span>
                    ) : (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">%</span>
                    )}
                  </div>
                  {discountValue && (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-orange-600">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Discount: {discountType === "fixed"
                        ? formatCurrency(parseFloat(discountValue) || 0)
                        : `${discountValue}%`}
                    </div>
                  )}
                </div>

                {/* Reason Input */}
                <div className="space-y-2 border-t border-orange-200 pt-4">
                  <label htmlFor="discount-reason" className="text-xs font-semibold text-slate-700">
                    Reason for Discount
                  </label>
                  <Input
                    id="discount-reason"
                    type="text"
                    placeholder="E.g., Loyalty program, VIP customer, bulk order..."
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    maxLength={60}
                    className="h-10 text-sm border-slate-300 focus:border-orange-400"
                  />
                  <p className="text-xs text-muted-foreground text-right">{discountReason.length} / 60</p>
                </div>

                {/* Summary Card */}
                {discountValue && (
                  <div className="rounded-lg border-2 border-orange-300 bg-white p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">Discount Summary</span>
                      <Badge className="bg-orange-100 text-orange-700 border-0">Applied</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-bold text-orange-600 text-base">
                          {discountType === "fixed"
                            ? formatCurrency(parseFloat(discountValue) || 0)
                            : `${discountValue}%`}
                        </span>
                      </div>
                      {discountReason && (
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                          <span className="text-muted-foreground">Reason:</span>
                          <span className="font-medium text-slate-900 text-right max-w-[200px] truncate">{discountReason}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gradient-to-r from-slate-50 to-white flex gap-3">
          <CustomButton
            variant="outline"
            size="sm"
            className="flex-1 border-slate-300 hover:bg-slate-100"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-1.5" />
            Cancel
          </CustomButton>
          <CustomButton
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleApply}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Saving
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Apply Changes
              </>
            )}
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
