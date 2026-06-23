"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import { SmartImage } from "@/components/shared/image/smart-image";
import { CustomModal } from "./custom-modal";
import { useEffect, useState } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch } from "@/store";
import { fetchOrderDetailsService } from "@/features/main/store/thunks/my-orders-thunks";
import { Loading } from "@/components/shared/common/loading";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { formatCurrency } from "@/utils/common/currency-format";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { getOrderStatusLabel } from "@/enums/order-status.enum";

import { cn } from "@/lib/utils";
import { Copy, MapPin, Package, Check, XCircle } from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
import { Messages } from "@/constants/messages";

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; badgeBg: string }
> = {
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    badgeBg: "bg-amber-100 text-amber-700",
  },
  CONFIRMED: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    badgeBg: "bg-blue-100 text-blue-700",
  },
  COMPLETED: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    badgeBg: "bg-green-100 text-green-700",
  },
  CANCELLED: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    badgeBg: "bg-red-100 text-red-700",
  },
};

const ORDER_STEPS = ["PENDING", "CONFIRMED", "COMPLETED"];
const STEP_ORDER: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  COMPLETED: 2,
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5">
      <h3 className="text-xs font-bold text-foreground">
        {children}
      </h3>
    </div>
  );
}

function InfoRow({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", fullWidth && "col-span-2")}>
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <span className="text-xs text-foreground">{value || "-"}</span>
    </div>
  );
}

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
    const load = async () => {
      try {
        setState({ order: null, loading: true, error: null });
        const result = await dispatch(
          fetchOrderDetailsService(orderId)
        ).unwrap();
        setState({ order: result, loading: false, error: null });
      } catch (err: unknown) {
        setState({
          order: null,
          loading: false,
          error:
            (err as { message?: string })?.message ||
            "Failed to load order details",
        });
      }
    };
    load();
  }, [orderId, isOpen, dispatch]);

  const handleClose = () => {
    setState({ order: null, loading: false, error: null });
    onClose();
  };

  if (state.loading) {
    return (
      <CustomModal isOpen={isOpen} onClose={handleClose} size="5xl" className="max-h-[92vh] gap-0 -col">
        <DialogTitle className="sr-only">Order Details Loading</DialogTitle>
        
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        
      </CustomModal>
    );
  }

  if (!state.order) {
    return (
      <CustomModal isOpen={isOpen} onClose={handleClose} size="5xl" className="max-h-[92vh] gap-0 -col">
        <DialogTitle className="sr-only">Order Details</DialogTitle>
        
          <div className="flex items-center justify-center h-64 flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">
              {state.error ? `Error: ${state.error}` : "No order data available"}
            </p>
          </div>
        
      </CustomModal>
    );
  }

  const order = state.order;
  const statusCfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PENDING;
  const currentStep = STEP_ORDER[order.orderStatus] ?? -1;
  const isCancelled = order.orderStatus === "CANCELLED";

  const formattedAddress = [
    order.deliveryAddress?.houseNumber,
    order.deliveryAddress?.streetNumber
      ? `St. ${order.deliveryAddress.streetNumber}`
      : null,
    order.deliveryAddress?.village,
    order.deliveryAddress?.commune,
    order.deliveryAddress?.district,
    order.deliveryAddress?.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} size="5xl" className="max-h-[92vh] gap-0 -col">
      <DialogTitle className="sr-only">
        Order Details - {order.orderNumber}
      </DialogTitle>

      
        {/* Header */}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground font-mono truncate">
                  {order.orderNumber}
                </p>
                <CustomButton variant="unstyled" size="unstyled"
                  onClick={() => {
                    navigator.clipboard.writeText(order.orderNumber);
                    showToast.success(
                      Messages.clipboard.addressCopied || "Copied!"
                    );
                  }}
                  className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy order number"
                >
                  <Copy className="h-3 w-3" />
                </CustomButton>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {order.businessName}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 grid grid-cols-1 lg:grid-cols-3 gap-3">

            {/* Left column */}
            <div className="lg:col-span-2 space-y-3">

              {/* Order Progress */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Order Progress</SectionTitle>
                {isCancelled ? (
                  <div className="flex items-center gap-2 px-2 py-2 rounded bg-red-50 border border-red-200">
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-red-700">
                      This order has been cancelled
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start overflow-x-auto px-2 py-2">
                    {ORDER_STEPS.map((step, idx) => {
                      const isDone = currentStep >= STEP_ORDER[step];
                      const isCurrent = currentStep === STEP_ORDER[step];
                      const history = order.statusHistory?.find(
                        (h) => h.statusName === step
                      );
                      return (
                        <div key={step} className="flex items-start flex-shrink-0">
                          <div className="flex flex-col items-center w-20">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ring-2 ring-offset-1 transition-all",
                                isDone
                                  ? "bg-green-100 text-green-700 ring-green-200"
                                  : isCurrent
                                    ? "bg-primary text-primary-foreground ring-primary/40"
                                    : "bg-muted text-muted-foreground ring-muted"
                              )}
                            >
                              {isDone ? <Check className="h-3 w-3" /> : idx + 1}
                            </div>
                            <span className="text-xs font-semibold text-foreground text-center mt-1.5 w-full">
                              {getOrderStatusLabel(step)}
                            </span>
                            {history ? (
                              <span className="text-xs text-muted-foreground text-center block mt-0.5">
                                {new Date(history.changedAt).toLocaleDateString(
                                  [],
                                  { month: "short", day: "numeric" }
                                )}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground/40 text-center block mt-0.5">
                                —
                              </span>
                            )}
                          </div>
                          {idx < ORDER_STEPS.length - 1 && (
                            <div
                              className={cn(
                                "flex-shrink-0 mt-4 w-8 h-0.5 transition-colors",
                                currentStep > STEP_ORDER[step]
                                  ? "bg-green-300"
                                  : "bg-muted"
                              )}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Status history */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
                    {order.statusHistory.map((h, idx) => (
                      <div key={h.id} className="flex items-start gap-2 text-xs">
                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-foreground">
                            {h.statusName}
                          </span>
                          {h.note && (
                            <span className="text-muted-foreground ml-1">
                              — {h.note}
                            </span>
                          )}
                        </div>
                        <span className="text-muted-foreground flex-shrink-0">
                          {dateTimeFormat(h.changedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="rounded border border-border/50 bg-card p-3">
                  <SectionTitle>
                    Order Items ({order.items.length})
                  </SectionTitle>
                  <div className="space-y-2">
                    {order.items.map((item) => {
                      const name =
                        item.product?.name || item.productName || "Unknown";
                      const sizeName =
                        item.product?.sizeName || item.sizeName;
                      const sku = item.product?.sku;
                      const promotionLabel = item.hasPromotion
                        ? item.promotionType === "PERCENTAGE"
                          ? `${item.promotionValue}% OFF`
                          : item.promotionType === "FIXED"
                            ? `${formatCurrency(item.promotionValue ?? 0)} OFF`
                            : "Sale"
                        : null;

                      return (
                        <div
                          key={item.id}
                          className="flex gap-2.5 p-2 rounded border border-border/50 bg-muted/20"
                        >
                          {/* Image */}
                          <div className="relative flex-shrink-0 w-10 h-10 rounded overflow-hidden bg-muted border border-border/50">
                            {item.product?.imageUrl ? (
                              <SmartImage
                                src={item.product.imageUrl}
                                alt={name}
                                fill
                                showSkeleton={false}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            {promotionLabel && (
                              <div
                                className="absolute bottom-0 left-0 right-0 bg-red-500/85 text-white text-center font-bold leading-none py-0.5"
                                style={{ fontSize: "7px" }}
                              >
                                SALE
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1 mb-0.5">
                              <p className="text-xs font-semibold text-foreground leading-tight truncate">
                                {name}
                              </p>
                              {promotionLabel && (
                                <span className="flex-shrink-0 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold leading-none">
                                  {promotionLabel}
                                </span>
                              )}
                            </div>

                            {(sizeName || sku) && (
                              <div className="flex flex-wrap gap-1 mb-1">
                                {sizeName && (
                                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                    {sizeName}
                                  </span>
                                )}
                                {sku && (
                                  <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                    {sku}
                                  </span>
                                )}
                              </div>
                            )}

                            {item.customizations &&
                              item.customizations.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {item.customizations.map((c) => (
                                    <span
                                      key={c.productCustomizationId}
                                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs"
                                    >
                                      +{c.name}
                                      {c.priceAdjustment > 0 && (
                                        <span className="font-medium">
                                          &nbsp;+{formatCurrency(c.priceAdjustment)}
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              )}

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {formatCurrency(item.finalPrice)} ×{" "}
                                {item.quantity}
                              </span>
                              <span className="font-bold text-foreground">
                                {formatCurrency(item.totalPrice)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pricing Summary */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Pricing Summary</SectionTitle>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Subtotal ({order.pricing?.totalItems || 0} items)
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(order.pricing?.subtotal || 0)}
                    </span>
                  </div>

                  {(order.pricing?.customizationTotal ?? 0) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Add-ons / Customizations
                      </span>
                      <span className="font-medium text-blue-600">
                        +{formatCurrency(order.pricing!.customizationTotal)}
                      </span>
                    </div>
                  )}

                  {(order.pricing?.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Discount
                        {order.pricing?.discountType &&
                          ` (${order.pricing.discountType === "percentage" ? "%" : "Fixed"})`}
                      </span>
                      <span className="font-medium text-red-600">
                        -{formatCurrency(order.pricing!.discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium text-foreground">
                      {(order.pricing?.deliveryFee ?? 0) > 0
                        ? formatCurrency(order.pricing!.deliveryFee)
                        : "Free"}
                    </span>
                  </div>

                  {(order.pricing?.taxAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Tax ({order.pricing?.taxPercentage}%)
                      </span>
                      <span className="font-medium text-green-600">
                        +{formatCurrency(order.pricing!.taxAmount)}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 mt-1 border-t border-border/50 flex justify-between">
                    <span className="text-xs font-bold text-foreground">
                      Total
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {formatCurrency(order.pricing?.finalTotal || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-3">

              {/* Order Info */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Order Info</SectionTitle>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <InfoRow
                    label="Date"
                    value={new Date(order.createdAt).toLocaleDateString()}
                  />
                  <InfoRow
                    label="Time"
                    value={new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />
                  <InfoRow
                    label="Payment Method"
                    value={order.payment?.paymentMethod || "-"}
                  />
                  <InfoRow
                    label="Payment Status"
                    value={
                      <span
                        className={cn(
                          "font-semibold",
                          order.payment?.paymentStatus === "PAID"
                            ? "text-green-600"
                            : order.payment?.paymentStatus === "REFUNDED"
                              ? "text-red-600"
                              : "text-amber-600"
                        )}
                      >
                        {order.payment?.paymentStatus || "-"}
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Customer */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Customer</SectionTitle>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                      Name
                    </p>
                    <p className="text-xs font-semibold text-foreground">
                      {order.customerName || "Walk-in Customer"}
                    </p>
                  </div>
                  {order.customerPhone && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                        Phone
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {order.customerPhone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Note */}
              {order.customerNote && (
                <div className="rounded border border-border/50 bg-card p-3">
                  <SectionTitle>Customer Note</SectionTitle>
                  <p className="text-xs text-foreground leading-relaxed">
                    {order.customerNote}
                  </p>
                </div>
              )}

              {/* Delivery Address */}
              {order.deliveryAddress && formattedAddress && (
                <div className="rounded border border-border/50 bg-card p-3">
                  <div className="flex items-start justify-between mb-2.5">
                    <SectionTitle>Delivery Address</SectionTitle>
                    <div className="flex gap-1 flex-shrink-0 -mt-0.5">
                      <CustomButton variant="unstyled" size="unstyled"
                        onClick={() => {
                          const text = order.deliveryAddress?.note
                            ? `${formattedAddress}\n\nNote: ${order.deliveryAddress.note}`
                            : formattedAddress;
                          navigator.clipboard.writeText(text);
                          showToast.success(
                            Messages.clipboard.addressCopied || "Copied!"
                          );
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Copy address"
                      >
                        <Copy className="h-3 w-3" />
                      </CustomButton>
                      {order.deliveryAddress.latitude &&
                        order.deliveryAddress.longitude && (
                          <CustomButton variant="unstyled" size="unstyled"
                            onClick={() =>
                              window.open(
                                `https://www.google.com/maps?q=${order.deliveryAddress.latitude},${order.deliveryAddress.longitude}`,
                                "_blank"
                              )
                            }
                            className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                            title="View on Google Maps"
                          >
                            <MapPin className="h-3 w-3" />
                          </CustomButton>
                        )}
                    </div>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">
                    {formattedAddress}
                  </p>
                  {order.deliveryOption && (
                    <div className="mt-2 pt-2 border-t border-border/40 grid grid-cols-2 gap-2">
                      <InfoRow
                        label="Method"
                        value={order.deliveryOption.name}
                      />
                      <InfoRow
                        label="Fee"
                        value={formatCurrency(order.deliveryOption.price || 0)}
                      />
                    </div>
                  )}
                  {order.deliveryAddress.note && (
                    <div className="mt-2 pt-2 border-t border-border/40">
                      <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                        Delivery Note
                      </p>
                      <p className="text-xs text-foreground">
                        {order.deliveryAddress.note}
                      </p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-3 border-t bg-muted/20 flex items-center justify-end">
          <CustomButton variant="outline" size="sm" onClick={handleClose} className="h-8">
            Close
          </CustomButton>
        </div>
      
    </CustomModal>
  );
}
