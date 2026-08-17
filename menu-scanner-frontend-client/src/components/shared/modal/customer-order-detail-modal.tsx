"use client";

import React, { useEffect, useState, useCallback, Fragment } from "react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomImagePreview } from "@/components/shared/image/custom-image-preview";
import { CustomModal } from "./custom-modal";
import { DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch } from "@/store";
import { fetchOrderDetailsService, cancelOrderService } from "@/features/main/store/thunks/my-orders-thunks";
import { Loading } from "@/components/shared/common/loading";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { formatCurrency } from "@/utils/common/currency-format";
import { formatAddress, getProductImageUrl } from "@/utils/common/common";
import { getPromotionLabel } from "@/utils/common/promotion-format";
import { dateTimeFormat, dateFormatLocal, formatDayMonth } from "@/utils/date/date-time-format";
import { getOrderStatusLabel, ORDER_STATUS_BADGE_CONFIG } from "@/enums/order-status.enum";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";

import { cn } from "@/lib/utils";
import {
  Copy,
  MapPin,
  XCircle,
  Download,
  Clock,
  CreditCard,
  Building2,
  FileText,
  Check,
  Ban,
  ExternalLink,
} from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
import { Messages } from "@/constants/messages";
import { useDownloadReceipt } from "@/hooks/use-download-receipt";

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
  onOrderCancelled?: () => void;
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
  onOrderCancelled,
}: CustomerOrderDetailModalProps) {
  const dispatch = useAppDispatch();
  const { handleDownloadReceipt, downloadingOrderId } = useDownloadReceipt();

  const [state, setState] = useState<OrderDetailState>({
    order: null,
    loading: false,
    error: null,
  });
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!orderId || !isOpen) return;
    const load = async () => {
      try {
        setState({ order: null, loading: true, error: null });
        const result = await dispatch(fetchOrderDetailsService(orderId)).unwrap();
        setState({ order: result, loading: false, error: null });
      } catch (err: unknown) {
        setState({
          order: null,
          loading: false,
          error: (err as { message?: string })?.message || "Failed to load order details",
        });
      }
    };
    load();
  }, [orderId, isOpen, dispatch]);

  const handleClose = useCallback(() => {
    setState({ order: null, loading: false, error: null });
    onClose();
  }, [onClose]);

  const handleCancel = useCallback(async () => {
    if (!state.order || state.order.orderStatus !== "PENDING") {
      showToast.error("Only pending orders can be cancelled.");
      return;
    }
    try {
      setIsCancelling(true);
      await dispatch(cancelOrderService(state.order.id)).unwrap();
      showToast.success(Messages.orders.cancelled || "Order cancelled successfully!");
      if (onOrderCancelled) onOrderCancelled();
      handleClose();
    } catch (err: unknown) {
      showToast.error((err as { message?: string })?.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  }, [state.order, dispatch, onOrderCancelled, handleClose]);

  if (state.loading) {
    return (
      <CustomModal isOpen={isOpen} onClose={handleClose} size="5xl">
        <DialogTitle className="sr-only">Order Details Loading</DialogTitle>
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </CustomModal>
    );
  }

  if (!state.order) {
    return (
      <CustomModal isOpen={isOpen} onClose={handleClose} size="5xl">
        <DialogTitle className="sr-only">Order Details</DialogTitle>
        <div className="flex items-center justify-center h-64 flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            {state.error ? `Error: ${state.error}` : "No order data available"}
          </p>
          <CustomButton variant="outline" size="sm" onClick={handleClose}>
            Close
          </CustomButton>
        </div>
      </CustomModal>
    );
  }

  const order = state.order;
  const statusCfg = ORDER_STATUS_BADGE_CONFIG[order.orderStatus] || ORDER_STATUS_BADGE_CONFIG.PENDING;
  const currentStep = STEP_ORDER[order.orderStatus] ?? (order.orderStatus === "COMPLETED" ? 2 : -1);
  const isCancelled = order.orderStatus === "CANCELLED";
  const isPending = order.orderStatus === "PENDING";
  const isDownloading = downloadingOrderId === order.id;

  const formattedAddress = formatAddress(order.deliveryAddress);
  const mapsUrl =
    (order.deliveryAddress as any)?.googleMapsUrl ||
    (order.deliveryAddress?.latitude && order.deliveryAddress?.longitude
      ? `https://www.google.com/maps/search/${order.deliveryAddress.latitude},${order.deliveryAddress.longitude}`
      : null);

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} size="5xl" className="p-0 overflow-hidden flex flex-col">
      <DialogTitle className="sr-only">
        Order Details - {order.orderNumber}
      </DialogTitle>

      {/* ── CLEAN HEADER (Follows Admin Style) ── */}
      <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0 flex items-center justify-between gap-3 pr-12">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground font-mono truncate">
                {order.orderNumber}
              </p>
              <CustomButton
                variant="unstyled"
                size="unstyled"
                onClick={() => {
                  navigator.clipboard.writeText(order.orderNumber);
                  showToast.success(Messages.clipboard.addressCopied || "Order number copied!");
                }}
                className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Copy order number"
              >
                <Copy className="h-3 w-3" />
              </CustomButton>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {order.businessName || "Store"} • Customer Order
            </p>
          </div>
        </div>
      </div>

      {/* ── BODY (Scrollable Layout) ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* ── Left Column (2 Cols): Timeline, Items, Pricing, Status History ── */}
          <div className="lg:col-span-2 space-y-3">
            {/* Status Timeline */}
            <div className="rounded-[18px] border border-border/80 bg-card p-3.5 shadow-2xs">
              <SectionTitle>Order Progress</SectionTitle>
              {isCancelled ? (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
                  <XCircle className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-semibold">
                    This order has been cancelled
                  </span>
                </div>
              ) : (
                <div className="py-4 overflow-x-auto pb-10">
                  <div className="flex items-center justify-between w-full max-w-xl mx-auto px-4 py-2">
                    {ORDER_STEPS.map((step, idx) => {
                      const isDone = currentStep > STEP_ORDER[step];
                      const isCurrent = currentStep === STEP_ORDER[step];
                      const history = order.statusHistory?.find((h) => h.statusName === step);
                      const isStepCompleted = isDone || (step === "COMPLETED" && isCurrent);

                      return (
                        <Fragment key={step}>
                          {/* Step Column */}
                          <div className="flex flex-col items-center relative z-10">
                            <div
                              className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                isStepCompleted
                                  ? "bg-emerald-500 text-white shadow-xs ring-4 ring-emerald-500/10 dark:ring-emerald-500/20"
                                  : isCurrent
                                  ? "bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-500/20"
                                  : "bg-muted text-muted-foreground/60 border border-border/70"
                              )}
                            >
                              {isStepCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : <span>{idx + 1}</span>}
                            </div>
                            <div className="text-center mt-2 w-28 absolute top-9 left-1/2 -translate-x-1/2">
                              <span className="text-[11px] font-black text-foreground block leading-tight">
                                {getOrderStatusLabel(step)}
                              </span>
                              {history ? (
                                <span className="text-[10px] text-muted-foreground font-semibold block mt-0.5">
                                  {formatDayMonth(history.changedAt)}
                                </span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground/40 font-semibold block mt-0.5">
                                  —
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Connector Line */}
                          {idx < ORDER_STEPS.length - 1 && (
                            <div className="flex-1 h-[3px] mx-2 -translate-y-4 rounded-full overflow-hidden bg-muted">
                              <div
                                className={cn(
                                  "h-full transition-all duration-300",
                                  isDone ? "bg-emerald-500 w-full" : "w-0"
                                )}
                              />
                            </div>
                          )}
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="rounded-[18px] border border-border/80 bg-card p-3.5 shadow-2xs">
                <SectionTitle>Order Items ({order.items.length})</SectionTitle>
                <div className="space-y-2">
                  {order.items.map((item) => {
                    const name = item.product?.name || item.productName || "Product Item";
                    const sizeName = item.product?.sizeName || item.sizeName;
                    const sku = item.product?.sku;
                    const barcode = item.product?.barcode;
                    const promotionLabel = getPromotionLabel(
                      item.hasPromotion,
                      item.promotionType,
                      item.promotionValue
                    );

                    return (
                      <div
                        key={item.id}
                        className="flex gap-2.5 p-2.5 rounded-[14px] border border-border/70 bg-muted/40"
                      >
                        {/* Product Image */}
                        <CustomImagePreview
                          src={getProductImageUrl(item.product?.imageUrl)}
                          alt={name}
                          fallbackText={name}
                          className="h-10 w-10 rounded-[8px]"
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1 mb-0.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="text-xs font-semibold text-foreground leading-tight truncate">
                                {name}
                              </p>
                              {item.quantity > 1 && (
                                <span className="flex-shrink-0 px-2 py-0.5 bg-amber-500 text-white dark:bg-amber-600 rounded-full text-[10px] font-black">
                                  Qty: {item.quantity}
                                </span>
                              )}
                            </div>
                            {promotionLabel && (
                              <span className="flex-shrink-0 px-1.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded text-xs font-bold leading-none">
                                {promotionLabel}
                              </span>
                            )}
                          </div>

                          {/* Size / SKU / Barcode Chips */}
                          {(sizeName || sku || barcode) && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {sizeName && (
                                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  {sizeName}
                                </span>
                              )}
                              {sku && (
                                <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded" title="SKU">
                                  SKU: {sku}
                                </span>
                              )}
                              {barcode && (
                                <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded" title="Barcode">
                                  Barcode: {barcode}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Customizations */}
                          {item.customizations && item.customizations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {item.customizations.map((c: any) => (
                                <span
                                  key={c.productCustomizationId || c.id}
                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-100 dark:border-blue-900 rounded text-xs"
                                >
                                  +{c.name}
                                  <span className="font-medium">
                                    &nbsp;+{formatCurrency(c.priceAdjustment ?? 0)}
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Price Breakdown */}
                          <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-border/40">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="text-muted-foreground font-semibold">
                                {formatCurrency(item.finalPrice)} ×{" "}
                                <span
                                  className={cn(
                                    "font-bold",
                                    item.quantity > 1 ? "text-amber-600 dark:text-amber-400 font-extrabold text-[13px]" : "text-foreground"
                                  )}
                                >
                                  {item.quantity}
                                </span>
                              </span>
                              {item.hasPromotion && item.currentPrice && item.currentPrice > item.finalPrice && (
                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="text-muted-foreground line-through">
                                    {formatCurrency(item.currentPrice)}
                                  </span>
                                  <span className="text-red-500 font-bold bg-red-500/10 px-1 py-0.2 rounded border border-red-500/20">
                                    Saved {formatCurrency((item.currentPrice - item.finalPrice) * item.quantity)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className="font-extrabold text-foreground shrink-0">
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
            <div className="rounded-[18px] border border-border/80 bg-card p-3.5 shadow-2xs">
              <SectionTitle>Pricing Summary</SectionTitle>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">
                    Subtotal ({order.pricing?.totalItems || 0} items)
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(order.pricing?.subtotal || 0)}
                  </span>
                </div>

                {(order.pricing?.customizationTotal ?? 0) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">
                      Add-ons / Customizations
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      +{formatCurrency(order.pricing!.customizationTotal)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">
                    Delivery {order.deliveryOption?.name ? `(${order.deliveryOption.name})` : ""}
                  </span>
                  <span className="font-semibold text-foreground">
                    {(order.pricing?.deliveryFee ?? 0) > 0
                      ? `+${formatCurrency(order.pricing!.deliveryFee)}`
                      : "Free"}
                  </span>
                </div>

                {(order.pricing?.taxAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">
                      Tax ({order.pricing?.taxPercentage}%)
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(order.pricing!.taxAmount)}
                    </span>
                  </div>
                )}

                {order.payment?.paymentMethod && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Payment Mode</span>
                    <span className="font-semibold text-foreground">{order.payment.paymentMethod}</span>
                  </div>
                )}

                {order.payment?.paymentStatus && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Payment Status</span>
                    <span
                      className={cn(
                        "font-bold",
                        order.payment.paymentStatus === "PAID"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : order.payment.paymentStatus === "REFUNDED"
                          ? "text-red-600"
                          : "text-amber-600"
                      )}
                    >
                      {order.payment.paymentStatus}
                    </span>
                  </div>
                )}

                {(order.pricing?.discountAmount ?? 0) > 0 && (
                  <div className="rounded-[6px] border border-red-500/25 bg-red-500/5 px-2.5 py-1.5 space-y-1 my-1">
                    <div className="flex justify-between text-xs items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-red-600 dark:text-red-400 font-bold">Discount</span>
                        {order.pricing?.discountType && (
                          <span className="text-[9px] font-extrabold uppercase bg-red-500/15 text-red-600 dark:text-red-400 px-1.5 py-0.2 rounded-full border border-red-500/25">
                            {order.pricing.discountType === "PERCENTAGE" || order.pricing.discountType === "percentage" ? "%" : "Fixed"}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-red-600 dark:text-red-400">
                        -{formatCurrency(order.pricing!.discountAmount)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2 mt-1 border-t border-border flex justify-between items-center">
                  <span className="text-xs font-black text-foreground uppercase tracking-wide">
                    Total Amount
                  </span>
                  <span className="text-base font-black text-primary">
                    {formatCurrency(order.pricing?.finalTotal || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status History Card (From API) */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="rounded-[18px] border border-border/80 bg-card p-3.5 shadow-2xs">
                <SectionTitle>Status History</SectionTitle>
                <div className="space-y-1.5 mt-2">
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
                      <div
                        key={h.id || idx}
                        className="flex items-start gap-2.5 text-xs py-1 border-b border-border/30 last:border-0"
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-black mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0 leading-relaxed flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-foreground">
                            {getOrderStatusLabel(h.statusName)}
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
              </div>
            )}
          </div>

          {/* ── Right Column (1 Col): Order Info, Delivery Address, Remarks ── */}
          <div className="space-y-3">
            {/* Order Info */}
            <div className="rounded-[18px] border border-border/80 bg-card p-3.5 shadow-2xs">
              <SectionTitle>Order Info</SectionTitle>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                <InfoRow label="Date" value={dateFormatLocal(order.createdAt)} />
                <InfoRow
                  label="Time"
                  value={new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
                <InfoRow label="Type" value="Customer Order" />
                <InfoRow label="Store" value={order.businessName || "-"} />
                <InfoRow label="Customer" value={order.customerName || "Customer"} />
                {order.customerPhone && (
                  <InfoRow label="Phone" value={order.customerPhone} />
                )}
              </div>
            </div>

            {/* Delivery Address */}
            {order.deliveryAddress && (
              <div className="rounded-[18px] border border-border/80 bg-card p-3.5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <SectionTitle className="my-0">Delivery Address</SectionTitle>
                  {mapsUrl && (
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(mapsUrl, "_blank")}
                      className="h-6 px-2 text-[10px] font-bold rounded text-primary hover:bg-primary/10 gap-1"
                    >
                      <MapPin className="h-3 w-3" /> Map
                    </CustomButton>
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-medium text-foreground leading-relaxed">
                    {formattedAddress}
                  </p>
                </div>

                {order.deliveryOption && (
                  <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <InfoRow label="Option" value={order.deliveryOption.name || "-"} />
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
                    <p className="text-xs text-foreground italic">
                      "{order.deliveryAddress.note}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Special Instructions / Notes */}
            {order.customerNote && (
              <div className="rounded border border-border bg-card p-3 space-y-1.5">
                <SectionTitle>Special Instructions</SectionTitle>
                <p className="text-xs text-foreground leading-relaxed italic bg-muted/30 p-2 rounded border border-border/40">
                  "{order.customerNote}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FOOTER: All Buttons Grouped On The Right ── */}
      <div className="flex-shrink-0 px-4 py-3 border-t bg-muted/20 flex items-center justify-end gap-2">
        {isPending && (
          <CustomButton
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            disabled={isCancelling}
            isLoading={isCancelling}
            icon={<Ban className="h-3.5 w-3.5" />}
            className="h-8 rounded-lg text-xs font-bold"
          >
            {isCancelling ? "Cancelling..." : "Cancel Order"}
          </CustomButton>
        )}

        <CustomButton
          variant="outline"
          size="sm"
          onClick={() => handleDownloadReceipt(order)}
          disabled={isDownloading}
          isLoading={isDownloading}
          icon={<Download className="h-3.5 w-3.5" />}
          className="h-8 rounded-lg text-xs font-bold"
        >
          {isDownloading ? "Downloading..." : "Download Receipt"}
        </CustomButton>
      </div>
    </CustomModal>
  );
}
