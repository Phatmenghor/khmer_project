"use client";

import { CustomButton } from "@/components/shared/button/custom-button";
import { SmartImage } from "@/components/shared/image/smart-image";
import { CustomImagePreview } from "@/components/shared/image/custom-image-preview";
import { CustomModal } from "./custom-modal";
import { useEffect, useState } from "react";
import { DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch } from "@/store";
import { fetchOrderDetailsService } from "@/features/main/store/thunks/my-orders-thunks";
import { Loading } from "@/components/shared/common/loading";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { formatCurrency } from "@/utils/common/currency-format";
import { formatAddress, getProductImageUrl } from "@/utils/common/common";
import { getPromotionLabel } from "@/utils/common/promotion-format";
import { dateTimeFormat, dateFormatLocal, formatDayMonth } from "@/utils/date/date-time-format";
import { getOrderStatusLabel, ORDER_STATUS_BADGE_CONFIG } from "@/enums/order-status.enum";

import { cn } from "@/lib/utils";
import { Copy, MapPin, Package, Check, XCircle } from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
import { Messages } from "@/constants/messages";
import { SectionTitle, InfoRow } from "./detail-section";

const ORDER_STEPS = ["PENDING", "CONFIRMED", "COMPLETED"];
const STEP_ORDER: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  COMPLETED: 2,
};

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
  const statusCfg = ORDER_STATUS_BADGE_CONFIG[order.orderStatus] || ORDER_STATUS_BADGE_CONFIG.PENDING;
  const currentStep = STEP_ORDER[order.orderStatus] ?? -1;
  const isCancelled = order.orderStatus === "CANCELLED";

  const formattedAddress = formatAddress(order.deliveryAddress);

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
              <div className="rounded border border-border bg-card p-3">
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
                      const isDone = currentStep > STEP_ORDER[step];
                      const isCurrent = currentStep === STEP_ORDER[step];
                      const isStepCompleted = isDone || (step === "COMPLETED" && isCurrent);
                      const history = order.statusHistory?.find(
                        (h) => h.statusName === step
                      );
                      return (
                        <div key={step} className="flex items-start flex-shrink-0">
                          <div className="flex flex-col items-center w-20">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ring-2 ring-offset-1 transition-all",
                                isStepCompleted
                                  ? "bg-emerald-500 text-white ring-emerald-500/30"
                                  : isCurrent
                                    ? "bg-emerald-500 text-white ring-emerald-500/30"
                                    : "bg-muted text-muted-foreground ring-muted"
                              )}
                            >
                              <span>{idx + 1}</span>
                            </div>
                            <span className="text-xs font-semibold text-foreground text-center mt-1.5 w-full">
                              {getOrderStatusLabel(step)}
                            </span>
                            {history ? (
                              <span className="text-xs text-muted-foreground text-center block mt-0.5">
                                {formatDayMonth(history.changedAt)}
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
                                isDone
                                  ? "bg-emerald-500"
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
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                    {order.statusHistory.map((h, idx) => {
                      const cleanNote = h.note
                        ? Array.from(
                            new Set(
                              h.note
                                .split("|")
                                .map((s) => s.trim())
                                .filter((s) => s && s !== "Created via POS System" && !s.startsWith("Discount Applied:"))
                            )
                          ).join(" | ")
                        : "";

                      const actorName = h.changedBy
                        ? h.changedBy.fullName || h.changedBy.firstName
                        : null;

                      return (
                        <div key={h.id || idx} className="flex items-start gap-2.5 text-xs py-0.5">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-black mt-0.5">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0 leading-relaxed flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-foreground">
                              {h.statusName}
                            </span>
                            {cleanNote && (
                              <span className="text-muted-foreground">
                                — {cleanNote}
                              </span>
                            )}
                            {actorName && (
                              <span className="inline-flex items-center text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 whitespace-nowrap">
                                by {actorName}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground font-medium flex-shrink-0">
                            {dateTimeFormat(h.changedAt)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="rounded border border-border bg-card p-3">
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
                      const promotionLabel = getPromotionLabel(
                        item.hasPromotion,
                        item.promotionType,
                        item.promotionValue
                      );

                      return (
                        <div
                          key={item.id}
                          className="flex gap-2.5 p-2 rounded border border-border bg-muted/40"
                        >
                          <CustomImagePreview
                            src={getProductImageUrl(item.product?.imageUrl)}
                            alt={name}
                            fallbackText={name}
                            className="h-10 w-10 rounded-[8px]"
                          />

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
                                          {item.customizations.map((c: any) => (
                                            <span
                                              key={c.productCustomizationId || c.id}
                                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-xs"
                                            >
                                              +{c.name}
                                              <span className="font-medium">
                                                &nbsp;+{formatCurrency(c.priceAdjustment ?? 0)}
                                              </span>
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
              <div className="rounded border border-border bg-card p-3">
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
              <div className="rounded border border-border bg-card p-3">
                <SectionTitle>Order Info</SectionTitle>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <InfoRow
                    label="Date"
                    value={dateFormatLocal(order.createdAt)}
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
              <div className="rounded border border-border bg-card p-3">
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
                <div className="rounded border border-border bg-card p-3">
                  <SectionTitle>Customer Note</SectionTitle>
                  <p className="text-xs text-foreground leading-relaxed">
                    {order.customerNote}
                  </p>
                </div>
              )}

              {/* Delivery Address */}
              {order.deliveryAddress && formattedAddress && (
                <div className="rounded border border-border bg-card p-3">
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
