"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch } from "@/store";
import { fetchOrderDetailsService } from "@/features/main/store/thunks/my-orders-thunks";
import { Loading } from "@/components/shared/common/loading";
import { OrderResponse, OrderItemResponse } from "@/features/main/store/models/response/order-response";
import { formatCurrency } from "@/utils/common/currency-format";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { getOrderStatusLabel } from "@/enums/order-status.enum";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
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
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
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

/* ── item card (product-card style) ────────────────────────────────────── */

function OrderItemCard({ item }: { item: OrderItemResponse }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md overflow-hidden transition-all duration-200 flex flex-col">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted/30 flex-shrink-0">
        {item.product?.imageUrl && !imgError ? (
          <img
            src={item.product.imageUrl}
            alt={item.product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/40">
            <Package className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}

        {/* Promotion badge */}
        {item.hasPromotion && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="destructive" className="text-xs font-bold px-2 py-0.5 shadow-md">
              Sale
            </Badge>
          </div>
        )}

        {/* Qty badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md">
            ×{item.quantity}
          </span>
        </div>

        {/* Add-ons badge */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="absolute bottom-2 left-2 z-10">
            <Badge variant="secondary" className="text-xs font-medium px-1.5 py-0.5 shadow-sm bg-background/90 backdrop-blur-sm">
              Add-ons
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <h4 className="font-medium text-sm leading-snug line-clamp-2 min-h-[40px]">
          {item.product?.name || "Unknown Product"}
        </h4>

        {item.product?.sizeName && (
          <p className="text-xs text-muted-foreground">Size: {item.product.sizeName}</p>
        )}

        <div className="mt-auto">
          <span className={cn("text-sm font-bold", item.hasPromotion ? "text-red-500" : "text-primary")}>
            {formatCurrency(item.finalPrice)}
          </span>
        </div>

        <div className="pt-1.5 border-t border-border/50 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{item.quantity} × {formatCurrency(item.finalPrice)}</span>
          <span className="text-sm font-bold text-foreground">{formatCurrency(item.totalPrice)}</span>
        </div>

        {/* Customizations */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="space-y-0.5 pt-1.5 border-t border-border/50">
            {item.customizations.map((c, ci) => (
              <div key={ci} className="flex justify-between text-xs text-muted-foreground">
                <span className="truncate">+ {c.name}</span>
                <span className="ml-2 flex-shrink-0">+{formatCurrency(c.priceAdjustment)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
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

      {/* ── Overview chips ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Order Number",
            value: <span className="font-mono text-xs">{order.orderNumber}</span>,
          },
          {
            label: "Date",
            value: <span className="text-xs">{dateTimeFormat(order.createdAt)}</span>,
          },
          {
            label: "Order Status",
            value: <span className={cn("font-semibold text-xs", statusColor(order.orderStatus))}>{getOrderStatusLabel(order.orderStatus)}</span>,
          },
          {
            label: "Payment",
            value: (
              <span className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-foreground">{order.payment?.paymentMethod || "---"}</span>
                <span className={cn("text-xs font-semibold", paymentColor(order.payment?.paymentStatus))}>{order.payment?.paymentStatus || "---"}</span>
              </span>
            ),
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border/60 bg-card px-4 py-3 space-y-1">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <div className="text-sm font-medium text-foreground">{item.value}</div>
          </div>
        ))}
      </div>

      {/* ── Items grid (product-card style) ── */}
      {order.items && order.items.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Items · {order.items.length}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {order.items.map((item) => (
              <OrderItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* ── Pricing · Customer · Delivery ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Pricing */}
        <Section title="Pricing Summary">
          <div className="space-y-2">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(p?.subtotal ?? 0)}</span>
              </div>
              {(p?.customizationTotal ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Add-ons</span>
                  <span className="font-medium">+{formatCurrency(p!.customizationTotal)}</span>
                </div>
              )}
              {(p?.deliveryFee ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">{formatCurrency(p!.deliveryFee)}</span>
                </div>
              )}
              {(p?.taxAmount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({p?.taxPercentage}%)</span>
                  <span className="font-medium">+{formatCurrency(p!.taxAmount)}</span>
                </div>
              )}
              {(p?.discountAmount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(p!.discountAmount)}</span>
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-border/60 flex justify-between items-center">
              <span className="text-sm font-semibold">Total</span>
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

      {/* ── Status History ── */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <Section title="Status History">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
            {order.statusHistory.map((h, idx) => (
              <div key={h.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-foreground">{h.statusName}</span>
                </div>
                <span className="text-xs text-muted-foreground ml-2">{dateTimeFormat(h.changedAt)}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

    </div>
  );
}
