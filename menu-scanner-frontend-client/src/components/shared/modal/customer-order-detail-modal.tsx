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
import { Package } from "lucide-react";

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
    const fetch = async () => {
      try {
        setState({ order: null, loading: true, error: null });
        const result = await dispatch(fetchOrderDetailsService(orderId)).unwrap();
        setState({ order: result, loading: false, error: null });
      } catch (error: unknown) {
        setState({ order: null, loading: false, error: (error as { message?: string })?.message || "Failed to load order details" });
      }
    };
    fetch();
  }, [orderId, isOpen, dispatch]);

  const handleClose = () => {
    setState({ order: null, loading: false, error: null });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Order Details</DialogTitle>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex-shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Order Details</h2>
            {state.order && (
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">{state.order.orderNumber}</p>
            )}
          </div>
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
            <OrderDetailContent order={state.order} />
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

/* ─── helpers ─────────────────────────────────────────────────────────── */

function paymentColor(s: string) {
  if (s === "PAID") return "text-green-600 dark:text-green-400";
  if (s === "REFUNDED") return "text-red-600 dark:text-red-400";
  return "text-orange-500 dark:text-orange-400";
}

function statusColor(s: string) {
  if (["COMPLETED", "READY", "DELIVERED"].includes(s)) return "text-green-600 dark:text-green-400";
  if (["CANCELLED", "FAILED"].includes(s)) return "text-red-600 dark:text-red-400";
  if (s === "PENDING") return "text-yellow-600 dark:text-yellow-400";
  if (["PREPARING", "CONFIRMED", "PROCESSING"].includes(s)) return "text-blue-600 dark:text-blue-400";
  return "text-foreground";
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
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

/* ─── main content ────────────────────────────────────────────────────── */

function OrderDetailContent({ order }: { order: OrderResponse }) {
  const p = order.pricing;
  const hasDiscount = (p?.discountAmount ?? 0) > 0;
  const hasDelivery = (p?.deliveryFee ?? 0) > 0;
  const hasTax = (p?.taxAmount ?? 0) > 0;
  const hasCustom = (p?.customizationTotal ?? 0) > 0;

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
    <div className="p-5 space-y-4">

      {/* ── Row 1: Overview chips ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Order Number", value: <span className="font-mono">{order.orderNumber}</span> },
          { label: "Date", value: dateTimeFormat(order.createdAt) },
          { label: "Order Status", value: <span className={statusColor(order.orderStatus)}>{getOrderStatusLabel(order.orderStatus)}</span> },
          { label: "Payment", value: (
            <span className="flex flex-col gap-0.5">
              <span className="text-foreground font-medium text-xs">{order.payment?.paymentMethod || "---"}</span>
              <span className={`text-xs ${paymentColor(order.payment?.paymentStatus ?? "")}`}>{order.payment?.paymentStatus || "---"}</span>
            </span>
          )},
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border/60 bg-card px-4 py-3 space-y-1">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <div className="text-sm font-medium text-foreground">{item.value}</div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Items (full width) ── */}
      <Section title={`Items · ${order.items?.length ?? 0}`}>
        <div className="divide-y divide-border/50">
          {order.items?.map((item) => (
            <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
              {/* Image */}
              <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted border border-border/50">
                {item.product?.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.product?.name || "Unknown Product"}</p>
                    {item.product?.sizeName && <p className="text-xs text-muted-foreground">Size: {item.product.sizeName}</p>}
                  </div>
                  <p className="text-sm font-semibold text-foreground flex-shrink-0">{formatCurrency(item.totalPrice)}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{formatCurrency(item.finalPrice)} × {item.quantity}</p>
                {item.customizations && item.customizations.length > 0 && (
                  <div className="mt-1.5 space-y-0.5">
                    {item.customizations.map((c, ci) => (
                      <div key={ci} className="flex justify-between text-xs text-muted-foreground">
                        <span>+ {c.name}</span>
                        <span>+{formatCurrency(c.priceAdjustment)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Row 3: Pricing + Customer + Delivery ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Pricing */}
        <Section title="Pricing">
          <div className="space-y-2">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(p?.subtotal ?? 0)}</span>
              </div>
              {hasCustom && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Add-ons</span>
                  <span className="font-medium">+{formatCurrency(p!.customizationTotal)}</span>
                </div>
              )}
              {hasDelivery && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">{formatCurrency(p!.deliveryFee)}</span>
                </div>
              )}
              {hasTax && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({p?.taxPercentage}%)</span>
                  <span className="font-medium">+{formatCurrency(p!.taxAmount)}</span>
                </div>
              )}
              {hasDiscount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(p!.discountAmount)}</span>
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-border/60 flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground">Total</span>
              <span className="text-base font-bold text-foreground">{formatCurrency(p?.finalTotal ?? 0)}</span>
            </div>
          </div>
        </Section>

        {/* Customer */}
        <Section title="Customer">
          <div className="space-y-3">
            <Field label="Name" value={order.customerName || "Walk-in Customer"} />
            {order.customerPhone && (
              <Field
                label="Phone"
                value={
                  <a href={`tel:${order.customerPhone}`} className="text-primary hover:underline font-medium text-sm">
                    {order.customerPhone}
                  </a>
                }
              />
            )}
            {order.customerNote && <Field label="Note" value={order.customerNote} />}
          </div>
        </Section>

        {/* Delivery */}
        <Section title="Delivery">
          <div className="space-y-3">
            {address ? (
              <Field label="Address" value={address} />
            ) : (
              <p className="text-xs text-muted-foreground">No delivery address</p>
            )}
            {order.deliveryOption && <Field label="Method" value={order.deliveryOption.name || "---"} />}
            {order.deliveryAddress?.note && <Field label="Note" value={order.deliveryAddress.note} />}
          </div>
        </Section>
      </div>

      {/* ── Row 4: Status History ── */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <Section title="Status History">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {order.statusHistory.map((h, idx) => (
              <div key={h.id} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-foreground">{h.statusName}</span>
                </div>
                <span className="text-xs text-muted-foreground">{dateTimeFormat(h.changedAt)}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

    </div>
  );
}
