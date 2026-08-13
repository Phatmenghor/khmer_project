"use client";

import React, { useEffect, useState, useCallback } from "react";
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
import { dateTimeFormat, formatDayMonth } from "@/utils/date/date-time-format";
import { getOrderStatusLabel, ORDER_STATUS_BADGE_CONFIG } from "@/enums/order-status.enum";

import { cn } from "@/lib/utils";
import {
  Copy,
  MapPin,
  Package,
  XCircle,
  Download,
  RotateCcw,
  Clock,
  CreditCard,
  Building2,
  FileText,
  Check,
  ShieldCheck,
} from "lucide-react";
import { showToast } from "@/components/shared/common/show-toast";
import { Messages } from "@/constants/messages";
import { Badge } from "@/components/ui/badge";
import { useDownloadReceipt } from "@/hooks/use-download-receipt";
import { addLocalCartItem } from "@/features/main/store/slice/cart-slice";

const ORDER_STEPS = ["PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED"];
const STEP_ORDER: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  READY: 3,
  COMPLETED: 4,
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

  const handleReorder = useCallback(() => {
    if (!state.order?.items || state.order.items.length === 0) return;
    let addedCount = 0;
    for (const item of state.order.items) {
      const prodId = item.product?.id;
      if (prodId) {
        const imgUrl = typeof item.product?.imageUrl === "string"
          ? item.product.imageUrl
          : (item.product?.imageUrl?.sm || "");

        dispatch(
          addLocalCartItem({
            productId: prodId,
            productSizeId: item.product?.sizeId || null,
            quantity: item.quantity || 1,
            productName: item.productName || item.product?.name || "Product",
            productImageUrl: imgUrl,
            sizeName: item.sizeName || item.product?.sizeName || null,
            finalPrice: item.finalPrice || 0,
            currentPrice: item.currentPrice || item.finalPrice || 0,
            customizations: (item.customizations || []).map((c) => ({
              id: c.productCustomizationId || `cust_${Date.now()}`,
              productCustomizationId: c.productCustomizationId,
              name: c.name,
              priceAdjustment: c.priceAdjustment,
            })),
          })
        );
        addedCount++;
      }
    }
    if (addedCount > 0) {
      showToast.success(`Added ${addedCount} items back to your cart!`);
    } else {
      showToast.info("Items added to cart.");
    }
  }, [dispatch, state.order]);

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
      <CustomModal isOpen={isOpen} onClose={handleClose} size="5xl" className="max-h-[92vh] rounded-[24px]">
        <DialogTitle className="sr-only">Order Details Loading</DialogTitle>
        <div className="flex items-center justify-center h-72">
          <Loading />
        </div>
      </CustomModal>
    );
  }

  if (!state.order) {
    return (
      <CustomModal isOpen={isOpen} onClose={handleClose} size="5xl" className="max-h-[92vh] rounded-[24px]">
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
  const currentStep = STEP_ORDER[order.orderStatus] ?? (order.orderStatus === "COMPLETED" ? 4 : -1);
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
    <CustomModal isOpen={isOpen} onClose={handleClose} size="5xl" className="max-h-[92vh] p-0 overflow-hidden rounded-[24px] flex flex-col">
      <DialogTitle className="sr-only">
        Order Details - {order.orderNumber}
      </DialogTitle>

      {/* ── ENHANCED HEADER ── */}
      <div className="shrink-0 px-5 py-4 bg-card border-b border-border/60 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-extrabold text-foreground font-mono truncate">
                {order.orderNumber}
              </span>
              <CustomButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(order.orderNumber);
                  showToast.success(Messages.clipboard.addressCopied || "Order number copied!");
                }}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                title="Copy order number"
              >
                <Copy className="h-3.5 w-3.5" />
              </CustomButton>
              <Badge className={cn("text-xs font-extrabold px-2.5 py-0.5 rounded-xl border shadow-2xs", statusCfg.badgeBg, statusCfg.border)}>
                {getOrderStatusLabel(order.orderStatus)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{order.businessName || "Restaurant Store"}</span>
              <span>•</span>
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{dateTimeFormat(order.createdAt)}</span>
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <CustomButton
            variant="outline"
            size="sm"
            onClick={() => handleDownloadReceipt(order)}
            disabled={isDownloading}
            className="h-9 px-3 rounded-xl gap-1.5 text-xs font-bold border-border/80 hover:border-primary hover:text-primary transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Receipt</span>
          </CustomButton>
          <CustomButton
            variant="outline"
            size="sm"
            onClick={handleReorder}
            className="h-9 px-3 rounded-xl gap-1.5 text-xs font-bold border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reorder</span>
          </CustomButton>
        </div>
      </div>

      {/* ── MODAL BODY ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-muted/20">
        {/* ── STEP TRACKER TIMELINE ── */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" /> Order Timeline & Status
            </span>
            <span className="text-xs font-extrabold text-primary">
              {getOrderStatusLabel(order.orderStatus)}
            </span>
          </div>

          {isCancelled ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
              <XCircle className="h-5 w-5 shrink-0" />
              <div className="text-xs font-semibold">
                This order was cancelled. {order.customerNote ? `Reason: ${order.customerNote}` : ""}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between overflow-x-auto py-2 px-1 gap-2">
              {ORDER_STEPS.map((step, idx) => {
                const isDone = currentStep > idx;
                const isCurrent = currentStep === idx;
                const isPassed = isDone || isCurrent;
                const history = order.statusHistory?.find((h) => h.statusName === step);

                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center min-w-[70px] text-center">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 shadow-xs",
                          isPassed
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-105"
                            : "bg-muted text-muted-foreground border border-border/80"
                        )}
                      >
                        {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : idx + 1}
                      </div>
                      <span className={cn("text-[11px] font-bold mt-2 truncate max-w-[85px]", isCurrent ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground")}>
                        {getOrderStatusLabel(step)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                        {history ? formatDayMonth(history.changedAt) : "—"}
                      </span>
                    </div>

                    {idx < ORDER_STEPS.length - 1 && (
                      <div className={cn("flex-1 h-1 rounded-full min-w-[20px] transition-colors duration-300 -mt-5", isDone ? "bg-primary" : "bg-muted")} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* ── GRID DETAILS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* LEFT 2 COLUMNS: ITEMS & PRICING */}
          <div className="lg:col-span-2 space-y-4">
            {/* ORDER ITEMS LIST */}
            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-primary" /> Order Items ({order.items?.length || 0})
                </span>
              </div>

              <div className="space-y-2.5">
                {order.items?.map((item) => {
                  const name = item.product?.name || item.productName || "Product Item";
                  const sizeName = item.product?.sizeName || item.sizeName;
                  const sku = item.product?.sku;
                  const promotionLabel = getPromotionLabel(item.hasPromotion, item.promotionType, item.promotionValue);

                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <CustomImagePreview
                        src={getProductImageUrl(item.product?.imageUrl)}
                        alt={name}
                        fallbackText={name}
                        className="h-12 w-12 rounded-xl shrink-0 border border-border/60"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-extrabold text-foreground truncate">
                            {name}
                          </p>
                          {promotionLabel && (
                            <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-bold px-1.5 py-0 shrink-0">
                              {promotionLabel}
                            </Badge>
                          )}
                        </div>

                        {(sizeName || sku) && (
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {sizeName && (
                              <span className="text-[10px] font-semibold bg-background px-2 py-0.5 rounded-md border border-border/60 text-muted-foreground">
                                Size: {sizeName}
                              </span>
                            )}
                            {sku && (
                              <span className="text-[10px] font-mono text-muted-foreground bg-background px-1.5 py-0.5 rounded-md border border-border/60">
                                {sku}
                              </span>
                            )}
                          </div>
                        )}

                        {item.customizations && item.customizations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.customizations.map((c: any) => (
                              <span key={c.productCustomizationId || c.id} className="text-[10px] font-medium px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-md">
                                +{c.name} ({formatCurrency(c.priceAdjustment ?? 0)})
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs mt-2 pt-1 border-t border-border/40">
                          <span className="text-muted-foreground font-medium">
                            {formatCurrency(item.finalPrice)} × {item.quantity}
                          </span>
                          <span className="font-extrabold text-foreground">
                            {formatCurrency(item.totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PRICING BREAKDOWN */}
            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                <CreditCard className="h-4 w-4 text-primary" /> Payment & Price Summary
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({order.pricing?.totalItems || 0} items)</span>
                  <span className="font-semibold text-foreground">{formatCurrency(order.pricing?.subtotal || 0)}</span>
                </div>

                {(order.pricing?.customizationTotal ?? 0) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Add-ons / Customizations</span>
                    <span className="font-semibold text-primary">+{formatCurrency(order.pricing!.customizationTotal)}</span>
                  </div>
                )}

                {(order.pricing?.discountAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount {order.pricing?.discountType ? `(${order.pricing.discountType})` : ""}</span>
                    <span className="font-semibold text-rose-600">-{formatCurrency(order.pricing!.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-foreground">
                    {(order.pricing?.deliveryFee ?? 0) > 0 ? formatCurrency(order.pricing!.deliveryFee) : "Free"}
                  </span>
                </div>

                {(order.pricing?.taxAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax ({order.pricing?.taxPercentage}%)</span>
                    <span className="font-semibold text-emerald-600">+{formatCurrency(order.pricing!.taxAmount)}</span>
                  </div>
                )}

                <div className="pt-2.5 mt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-foreground uppercase tracking-wide">Grand Total</span>
                  <span className="text-base font-black text-primary">{formatCurrency(order.pricing?.finalTotal || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: DELIVERY ADDRESS & ORDER METADATA */}
          <div className="space-y-4">
            {/* DELIVERY ADDRESS */}
            {order.deliveryAddress && (
              <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" /> Delivery Address
                  </span>
                  {mapsUrl && (
                    <CustomButton
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(mapsUrl, "_blank")}
                      className="h-6 px-2 text-[10px] font-bold rounded-lg text-primary hover:bg-primary/10 gap-1"
                    >
                      <MapPin className="h-3 w-3" /> Map
                    </CustomButton>
                  )}
                </div>

                <p className="text-xs font-semibold text-foreground leading-relaxed">
                  {formattedAddress}
                </p>

                {order.deliveryOption && (
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Option: <strong className="text-foreground">{order.deliveryOption.name}</strong></span>
                    <span>Fee: <strong className="text-foreground">{formatCurrency(order.deliveryOption.price || 0)}</strong></span>
                  </div>
                )}

                {order.deliveryAddress.note && (
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 text-xs italic text-muted-foreground">
                    "{order.deliveryAddress.note}"
                  </div>
                )}
              </div>
            )}

            {/* ORDER INFO & PAYMENT */}
            <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" /> Order Details
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-bold text-foreground">{order.payment?.paymentMethod || "Cash"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", order.payment?.paymentStatus === "PAID" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20")}>
                    {order.payment?.paymentStatus || "UNPAID"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer Phone</span>
                  <span className="font-semibold text-foreground">{order.customerPhone || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* CUSTOMER NOTE */}
            {order.customerNote && (
              <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Note</span>
                <p className="text-xs text-foreground leading-relaxed italic bg-muted/30 p-2.5 rounded-xl border border-border/40">
                  "{order.customerNote}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL FOOTER ── */}
      <div className="shrink-0 px-5 py-3.5 bg-card border-t border-border/60 flex items-center justify-between gap-3 shadow-xs">
        <div>
          {isPending && (
            <CustomButton
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              disabled={isCancelling}
              className="h-9 px-4 rounded-xl text-xs font-bold shadow-xs"
            >
              {isCancelling ? "Cancelling..." : "Cancel Order"}
            </CustomButton>
          )}
        </div>

        <div className="flex items-center gap-2">
          <CustomButton variant="outline" size="sm" onClick={handleClose} className="h-9 px-5 rounded-xl text-xs font-semibold">
            Close
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
}
