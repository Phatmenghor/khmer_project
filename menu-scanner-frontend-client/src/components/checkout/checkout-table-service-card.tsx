"use client";

import { Utensils, CheckCircle2, Clock } from "lucide-react";
import { OrderContext } from "@/utils/order/order-context";

interface CheckoutTableServiceCardProps {
  orderContext: OrderContext;
  itemsCount: number;
  totalQuantity: number;
}

export function CheckoutTableServiceCard({
  orderContext,
  itemsCount,
  totalQuantity,
}: CheckoutTableServiceCardProps) {
  if (!orderContext.isTable) return null;

  return (
    <div className="bg-card border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-base shrink-0 shadow-2xs">
            🪑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-foreground tracking-tight">
                {orderContext.tableName}
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Active Session
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Dine-In Table Service • Served directly to your table
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold">
        <span className="flex items-center gap-1">
          <Utensils className="w-3.5 h-3.5" /> Direct Kitchen Ticket Order
        </span>
        <span>{itemsCount} dishes ({totalQuantity} qty)</span>
      </div>
    </div>
  );
}
