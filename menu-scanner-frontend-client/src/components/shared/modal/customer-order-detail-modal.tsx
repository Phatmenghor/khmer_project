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
    const fetch = async () => {
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
        <div className="px-6 py-4 border-b flex-shrink-0">
          <h2 className="text-base font-semibold text-foreground">Order Details</h2>
          {state.order && (
            <p className="text-sm text-muted-foreground mt-0.5">{state.order.orderNumber}</p>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
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
            <OrderDetailContent order={state.order} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex-shrink-0 flex justify-end">
          <CustomButton variant="outline" onClick={handleClose} className="h-9 px-6 rounded-lg">
            Close
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getPaymentColor(status: string) {
  switch (status) {
    case "PAID": return "text-green-600 dark:text-green-400";
    case "UNPAID": return "text-orange-500 dark:text-orange-400";
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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function PricingRow({ label, value, bold, colorClass }: { label: string; value: string; bold?: boolean; colorClass?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{label}</span>
      <span className={`text-sm ${bold ? "font-semibold text-foreground" : "text-foreground"} ${colorClass ?? ""}`}>{value}</span>
    </div>
  );
}

function OrderDetailContent({ order }: { order: OrderResponse }) {
  const pricing = order.pricing;
  const hasDiscount = (pricing?.discountAmount ?? 0) > 0;
  const hasDelivery = (pricing?.deliveryFee ?? 0) > 0;
  const hasTax = (pricing?.taxAmount ?? 0) > 0;
  const hasCustomizations = (pricing?.customizationTotal ?? 0) > 0;

  const fullAddress = order.deliveryAddress
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
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left column — items + pricing */}
      <div className="lg:col-span-2 space-y-5">
        {/* Items */}
        <SectionCard title={`Order Items (${order.items?.length ?? 0})`}>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                {/* Image */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted border border-border/50">
                  {item.product?.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        {item.product?.name || "Unknown Product"}
                      </p>
                      {item.product?.sizeName && (
                        <p className="text-xs text-muted-foreground mt-0.5">Size: {item.product.sizeName}</p>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground flex-shrink-0">
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(item.finalPrice)} × {item.quantity}
                  </p>

                  {item.customizations && item.customizations.length > 0 && (
                    <div className="mt-2 space-y-0.5">
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
        </SectionCard>

        {/* Pricing */}
        <SectionCard title="Pricing Summary">
          <div className="space-y-2.5">
            <PricingRow label="Subtotal" value={formatCurrency(pricing?.subtotal ?? 0)} />
            {hasCustomizations && (
              <PricingRow label="Customizations" value={`+${formatCurrency(pricing!.customizationTotal)}`} />
            )}
            {hasDelivery && (
              <PricingRow label="Delivery Fee" value={formatCurrency(pricing!.deliveryFee)} />
            )}
            {hasTax && (
              <PricingRow label={`Tax (${pricing?.taxPercentage}%)`} value={`+${formatCurrency(pricing!.taxAmount)}`} />
            )}
            {hasDiscount && (
              <PricingRow label="Discount" value={`-${formatCurrency(pricing!.discountAmount)}`} colorClass="text-red-600 dark:text-red-400" />
            )}
            <div className="pt-3 border-t border-border/50">
              <PricingRow label="Total" value={formatCurrency(pricing?.finalTotal ?? 0)} bold />
            </div>
          </div>
        </SectionCard>

        {/* Status History */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <SectionCard title="Status History">
            <div className="space-y-3">
              {order.statusHistory.map((h, idx) => (
                <div key={h.id} className="flex items-center justify-between pb-3 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground">{h.statusName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{dateTimeFormat(h.changedAt)}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>

      {/* Right column — order info, customer, delivery */}
      <div className="space-y-5">
        {/* Order Info */}
        <SectionCard title="Order Info">
          <div className="space-y-4">
            <InfoRow label="Order Number" value={<span className="font-mono font-semibold">{order.orderNumber}</span>} />
            <InfoRow label="Date" value={dateTimeFormat(order.createdAt)} />
            <InfoRow
              label="Order Status"
              value={<span className={`font-medium ${getStatusColor(order.orderStatus)}`}>{getOrderStatusLabel(order.orderStatus)}</span>}
            />
            <InfoRow label="Payment Method" value={order.payment?.paymentMethod || "---"} />
            <InfoRow
              label="Payment Status"
              value={<span className={`font-medium ${getPaymentColor(order.payment?.paymentStatus ?? "")}`}>{order.payment?.paymentStatus || "---"}</span>}
            />
          </div>
        </SectionCard>

        {/* Customer */}
        <SectionCard title="Customer">
          <div className="space-y-4">
            <InfoRow label="Name" value={order.customerName || "Walk-in Customer"} />
            {order.customerPhone && (
              <InfoRow
                label="Phone"
                value={
                  <a href={`tel:${order.customerPhone}`} className="text-primary hover:underline font-medium">
                    {order.customerPhone}
                  </a>
                }
              />
            )}
            {order.customerNote && <InfoRow label="Note" value={order.customerNote} />}
          </div>
        </SectionCard>

        {/* Delivery */}
        {(fullAddress || order.deliveryOption) && (
          <SectionCard title="Delivery">
            <div className="space-y-4">
              {fullAddress && <InfoRow label="Address" value={fullAddress} />}
              {order.deliveryOption && (
                <InfoRow label="Method" value={order.deliveryOption.name || "---"} />
              )}
              {order.deliveryAddress?.note && (
                <InfoRow label="Note" value={order.deliveryAddress.note} />
              )}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
