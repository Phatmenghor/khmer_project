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

export function CustomerOrderDetailModal({
  orderId,
  isOpen,
  onClose,
}: CustomerOrderDetailModalProps) {
  const dispatch = useAppDispatch();
  const [state, setState] = useState<OrderDetailState>({
    order: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!orderId || !isOpen) return;

    const fetchOrderDetails = async () => {
      try {
        setState({ order: null, loading: true, error: null });
        const result = await dispatch(fetchOrderDetailsService(orderId)).unwrap();
        setState({ order: result, loading: false, error: null });
      } catch (error: unknown) {
        setState({
          order: null,
          loading: false,
          error: (error as { message?: string })?.message || "Failed to load order details",
        });
      }
    };

    fetchOrderDetails();
  }, [orderId, isOpen, dispatch]);

  const handleClose = () => {
    setState({ order: null, loading: false, error: null });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Order Details</DialogTitle>
      <DialogContent className="w-full sm:max-w-lg max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {state.loading ? (
          <div className="flex items-center justify-center h-48">
            <Loading />
          </div>
        ) : !state.order ? (
          <div className="flex items-center justify-center h-48 text-center px-6">
            <p className="text-sm text-muted-foreground">
              {state.error ? `Error: ${state.error}` : "No order data available"}
            </p>
          </div>
        ) : (
          <OrderReceipt order={state.order} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: string }) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-0.5">
      <span className={`text-sm ${bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
      <span className={`text-sm text-right ${bold ? "font-semibold text-foreground" : "text-foreground"} ${accent ?? ""}`}>
        {value}
      </span>
    </div>
  );
}

function Divider({ dashed }: { dashed?: boolean }) {
  return (
    <div className={`my-3 border-t ${dashed ? "border-dashed border-border" : "border-border"}`} />
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
      {text}
    </p>
  );
}

function getPaymentColor(status: string) {
  switch (status) {
    case "PAID": return "text-green-600 dark:text-green-400";
    case "UNPAID": return "text-orange-600 dark:text-orange-400";
    case "REFUNDED": return "text-red-600 dark:text-red-400";
    default: return "text-muted-foreground";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "COMPLETED":
    case "READY":
    case "DELIVERED": return "text-green-600 dark:text-green-400";
    case "CANCELLED":
    case "FAILED": return "text-red-600 dark:text-red-400";
    case "PENDING": return "text-yellow-600 dark:text-yellow-400";
    case "PREPARING":
    case "CONFIRMED":
    case "PROCESSING": return "text-blue-600 dark:text-blue-400";
    default: return "text-foreground";
  }
}

function OrderReceipt({ order }: { order: OrderResponse }) {
  const pricing = order.pricing;
  const hasDiscount = (pricing?.discountAmount ?? 0) > 0;
  const hasDelivery = (pricing?.deliveryFee ?? 0) > 0;
  const hasTax = (pricing?.taxAmount ?? 0) > 0;
  const hasCustomizations = (pricing?.customizationTotal ?? 0) > 0;
  const hasDeliveryAddress = !!order.deliveryAddress;
  const hasStatusHistory = order.statusHistory && order.statusHistory.length > 0;

  const fullAddress = hasDeliveryAddress
    ? [
        order.deliveryAddress.houseNumber,
        order.deliveryAddress.streetNumber,
        order.deliveryAddress.village,
        order.deliveryAddress.commune,
        order.deliveryAddress.district,
        order.deliveryAddress.province,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-0">
      {/* Header */}
      <div className="text-center mb-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Order Receipt</p>
        <p className="text-base font-bold text-foreground">{order.orderNumber}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{dateTimeFormat(order.createdAt)}</p>
      </div>

      <Divider />

      {/* Order Status & Payment */}
      <div className="space-y-1">
        <Row
          label="Order Status"
          value={getOrderStatusLabel(order.orderStatus)}
          accent={getStatusColor(order.orderStatus)}
          bold
        />
        <Row
          label="Payment"
          value={order.payment?.paymentMethod || "---"}
        />
        <Row
          label="Payment Status"
          value={order.payment?.paymentStatus || "---"}
          accent={getPaymentColor(order.payment?.paymentStatus ?? "")}
          bold
        />
      </div>

      <Divider dashed />

      {/* Customer Info */}
      <div className="space-y-1">
        <SectionLabel text="Customer" />
        <Row label="Name" value={order.customerName || "Walk-in Customer"} />
        {order.customerPhone && <Row label="Phone" value={order.customerPhone} />}
        {order.customerNote && <Row label="Note" value={order.customerNote} />}
      </div>

      <Divider dashed />

      {/* Items */}
      <div>
        <SectionLabel text={`Items (${order.items?.length ?? 0})`} />
        <div className="space-y-3">
          {order.items?.map((item, idx) => (
            <div key={item.id}>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-snug">
                    {idx + 1}. {item.product?.name || "Unknown"}
                  </p>
                  {item.product?.sizeName && (
                    <p className="text-xs text-muted-foreground">Size: {item.product.sizeName}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground">×{item.quantity} × {formatCurrency(item.finalPrice)}</p>
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(item.totalPrice)}</p>
                </div>
              </div>
              {item.customizations && item.customizations.length > 0 && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {item.customizations.map((c, ci) => (
                    <div key={ci} className="flex justify-between text-xs text-muted-foreground">
                      <span>+ {c.name}</span>
                      <span>+{formatCurrency(c.priceAdjustment)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Divider dashed />

      {/* Pricing */}
      <div className="space-y-1">
        <Row label="Subtotal" value={formatCurrency(pricing?.subtotal ?? 0)} />
        {hasCustomizations && (
          <Row label="Customizations" value={`+${formatCurrency(pricing!.customizationTotal)}`} />
        )}
        {hasDelivery && (
          <Row label="Delivery Fee" value={formatCurrency(pricing!.deliveryFee)} />
        )}
        {hasTax && (
          <Row label={`Tax (${pricing?.taxPercentage}%)`} value={`+${formatCurrency(pricing!.taxAmount)}`} />
        )}
        {hasDiscount && (
          <Row label="Discount" value={`-${formatCurrency(pricing!.discountAmount)}`} accent="text-red-600 dark:text-red-400" />
        )}
      </div>

      <Divider />

      <Row label="Total" value={formatCurrency(pricing?.finalTotal ?? 0)} bold />

      {/* Delivery Address */}
      {hasDeliveryAddress && fullAddress && (
        <>
          <Divider dashed />
          <div className="space-y-1">
            <SectionLabel text="Delivery Address" />
            <p className="text-sm text-foreground">{fullAddress}</p>
            {order.deliveryOption && (
              <Row label="Method" value={order.deliveryOption.name || "---"} />
            )}
            {order.deliveryAddress.note && (
              <Row label="Note" value={order.deliveryAddress.note} />
            )}
          </div>
        </>
      )}

      {/* Status History */}
      {hasStatusHistory && (
        <>
          <Divider dashed />
          <div>
            <SectionLabel text="Status History" />
            <div className="space-y-2">
              {order.statusHistory!.map((h, idx) => (
                <div key={h.id} className="flex justify-between items-baseline gap-4">
                  <span className="text-sm text-foreground">
                    {idx + 1}. {h.statusName}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {dateTimeFormat(h.changedAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="pb-2" />
    </div>
  );
}
