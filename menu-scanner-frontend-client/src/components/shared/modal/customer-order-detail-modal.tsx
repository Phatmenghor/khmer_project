"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch } from "@/store";
import { fetchOrderDetailsService } from "@/features/main/store/thunks/my-orders-thunks";
import { Loading } from "@/components/shared/common/loading";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { formatCurrency } from "@/utils/common/currency-format";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { getOrderStatusLabel } from "@/enums/order-status.enum";
import { CustomButton } from "@/components/shared/button/custom-button";
import { OrderItemCard } from "@/components/shared/card/order-item-card";
import { cn } from "@/lib/utils";

interface CustomerOrderDetailModalProps {
  orderId?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface OrderDetailState {
  order: OrderResponse | null;
  loading: boolean;
  error: string | null;
}

export function CustomerOrderDetailModal({ orderId, isOpen, onClose }: CustomerOrderDetailModalProps) {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<OrderDetailState>({ order: null, loading: false, error: null });

  useEffect(() => {
    if (!orderId || !isOpen) return;
    const load = async () => {
      try {
        setState({ order: null, loading: true, error: null });
        const result = await dispatch(fetchOrderDetailsService(orderId)).unwrap();
        setState({ order: result, loading: false, error: null });
      } catch (err: unknown) {
        setState({ order: null, loading: false, error: (err as { message?: string })?.message || "Failed to load order details" });
      }
    };
    load();
  }, [orderId, isOpen, dispatch]);

  const handleClose = () => {
    setState({ order: null, loading: false, error: null });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Order Details</DialogTitle>
      <DialogContent className="w-full sm:max-w-6xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex-shrink-0">
          <h2 className="text-base font-semibold text-foreground">Order Details</h2>
          {state.order && (
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{state.order.orderNumber}</p>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {state.loading ? (
            <div className="flex items-center justify-center h-48"><Loading /></div>
          ) : !state.order ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm text-muted-foreground">{state.error ? `Error: ${state.error}` : "No order data available"}</p>
            </div>
          ) : (
            <OrderBody order={state.order} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t flex-shrink-0 flex justify-end">
          <CustomButton variant="outline" onClick={handleClose} className="h-9 px-6 rounded-lg text-sm">
            Close
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── helpers ───────────────────────────────────────────────────────────── */

function paymentColor(s?: string) {
  if (s === "PAID") return "text-green-600 dark:text-green-400";
  if (s === "REFUNDED") return "text-red-600 dark:text-red-400";
  return "text-orange-500 dark:text-orange-400";
}

function statusColor(s?: string) {
  if (["COMPLETED", "READY", "DELIVERED"].includes(s ?? "")) return "text-green-600 dark:text-green-400";
  if (["CANCELLED", "FAILED"].includes(s ?? "")) return "text-red-600 dark:text-red-400";
  if (s === "PENDING") return "text-yellow-600 dark:text-yellow-400";
  if (["PREPARING", "CONFIRMED", "PROCESSING"].includes(s ?? "")) return "text-blue-600 dark:text-blue-400";
  return "text-foreground";
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border/60 bg-card overflow-hidden", className)}>
      <div className="px-4 py-2.5 border-b border-border/60 bg-muted/30">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}


/* ── body ───────────────────────────────────────────────────────────────── */

function OrderBody({ order }: { order: OrderResponse }) {
  const p = order.pricing;

  const address = order.deliveryAddress
    ? [
        order.deliveryAddress.houseNumber,
        order.deliveryAddress.streetNumber,
        order.deliveryAddress.village,
        order.deliveryAddress.commune,
        order.deliveryAddress.district,
        order.deliveryAddress.province,
      ].filter(Boolean).join(", ")
    : null;

  return (
    <div className="p-5 space-y-5">

      {/* ── Overview ── */}
      <Section title="Order Info">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Order Number" value={<span className="font-mono">{order.orderNumber}</span>} />
          <Field label="Date" value={dateTimeFormat(order.createdAt)} />
          <Field label="Order Status" value={<span className={cn("font-medium", statusColor(order.orderStatus))}>{getOrderStatusLabel(order.orderStatus)}</span>} />
          <Field
            label="Payment"
            value={
              <span className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">{order.payment?.paymentMethod || "---"}</span>
                <span className={cn("text-sm", paymentColor(order.payment?.paymentStatus))}>{order.payment?.paymentStatus || "---"}</span>
              </span>
            }
          />
        </div>
      </Section>

      {/* ── Items grid (product-card style) ── */}
      {order.items && order.items.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Items · {order.items.length}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {order.items.map((item) => (
              <OrderItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* ── Pricing · Customer · Delivery · Status History (one section, grid-2) ── */}
      <Section title="Details">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <Field label="Subtotal" value={formatCurrency(p?.subtotal ?? 0)} />
          {(p?.customizationTotal ?? 0) > 0 && (
            <Field label="Add-ons" value={`+${formatCurrency(p!.customizationTotal)}`} />
          )}
          {(p?.deliveryFee ?? 0) > 0 && (
            <Field label="Delivery Fee" value={formatCurrency(p!.deliveryFee)} />
          )}
          {(p?.taxAmount ?? 0) > 0 && (
            <Field label={`Tax (${p?.taxPercentage}%)`} value={`+${formatCurrency(p!.taxAmount)}`} />
          )}
          {(p?.discountAmount ?? 0) > 0 && (
            <Field label="Discount" value={<span className="text-red-600 dark:text-red-400 font-medium">-{formatCurrency(p!.discountAmount)}</span>} />
          )}
          <Field label="Total" value={<span className="font-bold text-base text-foreground">{formatCurrency(p?.finalTotal ?? 0)}</span>} />

          <Field label="Customer Name" value={order.customerName || "Walk-in Customer"} />
          {order.customerPhone && (
            <Field
              label="Phone"
              value={
                <a href={`tel:${order.customerPhone}`} className="text-primary hover:underline font-medium">
                  {order.customerPhone}
                </a>
              }
            />
          )}
          {order.customerNote && <Field label="Customer Note" value={order.customerNote} />}

          {address && <Field label="Delivery Address" value={address} />}
          {order.deliveryOption && <Field label="Delivery Method" value={order.deliveryOption.name || "---"} />}
          {order.deliveryAddress?.note && <Field label="Delivery Note" value={order.deliveryAddress.note} />}

          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="col-span-2 pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Status History</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                {order.statusHistory.map((h, idx) => (
                  <div key={h.id} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-foreground">{h.statusName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{dateTimeFormat(h.changedAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

    </div>
  );
}
