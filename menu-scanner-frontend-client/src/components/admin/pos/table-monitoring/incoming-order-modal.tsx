"use client";

import React from "react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import {
  BellRing,
  Utensils,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  ShoppingBag,
} from "lucide-react";

interface IncomingOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderResponse | null;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  isProcessing?: boolean;
}

export function IncomingOrderModal({
  isOpen,
  onClose,
  order,
  onAccept,
  onReject,
  isProcessing = false,
}: IncomingOrderModalProps) {
  if (!order) return null;

  const tableName = order.customerName || "Table Order";
  const items = order.items || [];
  const orderNumber = order.orderNumber || order.id?.slice(0, 8).toUpperCase() || "";

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      disableScrollWrapper={true}
    >
      {/* Alert Header */}
      <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-card border-b border-amber-500/30 p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0 animate-bounce">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-700 dark:text-amber-300 uppercase tracking-wide bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                Incoming Table Order
              </span>
              <span className="text-xs font-mono font-bold text-muted-foreground">
                #{orderNumber}
              </span>
            </div>
            <h2 className="text-lg font-black text-foreground tracking-tight mt-0.5">
              🪑 {tableName}
            </h2>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Kitchen Special Instructions Alert */}
        {order.customerNote ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-start gap-3">
            <MessageSquare className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
                Special Kitchen Notes
              </span>
              <p className="text-xs font-bold text-foreground mt-0.5 leading-relaxed">
                "{order.customerNote}"
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-muted/30 border border-border/60 rounded-xl p-2.5 text-xs text-muted-foreground italic flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>No special kitchen instructions provided.</span>
          </div>
        )}

        {/* Ordered Dishes Breakdown */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-foreground pb-1 border-b border-border/60">
            <span className="flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-primary" />
              Dishes & Drinks ({items.length})
            </span>
            <span>Qty x Price</span>
          </div>

          <div className="divide-y divide-border/40 space-y-2">
            {items.map((item: any, idx: number) => (
              <div key={item.id || idx} className="pt-2 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {item.quantity}x
                  </div>
                  <div>
                    <span className="font-extrabold text-foreground">{item.productName}</span>
                    {item.sizeName && (
                      <span className="text-[10px] text-muted-foreground ml-1.5 bg-muted px-1.5 py-0.5 rounded-md">
                        Size: {item.sizeName}
                      </span>
                    )}
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                        Add-ons: {item.customizations.map((c: any) => c.name).join(", ")}
                      </div>
                    )}
                  </div>
                </div>

                <span className="font-bold text-foreground shrink-0">
                  {formatCurrency((item.totalPrice || item.currentPrice * item.quantity) || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Pricing Total */}
        <div className="bg-muted/20 border border-border/80 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-muted-foreground">Order Total</span>
            <div className="text-xs text-muted-foreground font-medium">
              {items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0)} total items
            </div>
          </div>
          <span className="text-xl font-black text-primary">
            {formatCurrency(order.pricing?.finalTotal || 0)}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 sm:p-5 border-t border-border/60 bg-card flex items-center justify-end gap-2.5">
        <CustomButton
          variant="outline"
          onClick={() => onReject(order.id)}
          disabled={isProcessing}
          className="h-10 text-xs font-bold text-destructive hover:bg-destructive/10 border-destructive/30 rounded-xl gap-1.5 cursor-pointer"
        >
          <XCircle className="w-4 h-4" />
          Reject Order
        </CustomButton>

        <CustomButton
          onClick={() => onAccept(order.id)}
          disabled={isProcessing}
          isLoading={isProcessing}
          className="h-10 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 shadow-sm hover:shadow cursor-pointer px-5"
        >
          <CheckCircle2 className="w-4 h-4" />
          Accept & Send to Kitchen
        </CustomButton>
      </div>
    </CustomModal>
  );
}
