"use client";

import { Messages } from "@/constants/messages";
import { useEffect, Fragment } from "react";
import { dateTimeFormat, dateFormatLocal, formatDayMonth } from "@/utils/date/date-time-format";
import { DialogTitle } from "@/components/ui/dialog";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectOrderAdminIsFetchingDetail,
  selectSelectedOrder,
  selectOrderAdminDetailError,
} from "../store/selectors/order-admin-selector";
import { fetchOrderByIdAdminService } from "../store/thunks/order-admin-thunks";
import { clearSelectedOrder } from "../store/slice/order-admin-slice";
import { formatCurrency } from "@/utils/common/currency-format";
import { formatAddress, getProductImageUrl } from "@/utils/common/common";
import { getPromotionLabel } from "@/utils/common/promotion-format";
import { getOrderStatusLabel, ORDER_STATUS_BADGE_CONFIG } from "@/enums/order-status.enum";
import { useDownloadReceipt } from "@/hooks/use-download-receipt";
import { Loading } from "@/components/shared/common/loading";
import { showToast } from "@/components/shared/common/show-toast";
import { CustomButton } from "@/components/shared/button/custom-button";
import {
  Download,
  Edit,
  Copy,
  MapPin,
  Package,
  Check,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/shared/image/smart-image";
import { CustomImagePreview } from "@/components/shared/image/custom-image-preview";

const ORDER_STEPS = ["PENDING", "CONFIRMED", "COMPLETED"];

const STEP_ORDER: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  COMPLETED: 2,
};

import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";

interface OrderDetailModalProps {
  orderId?: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOrder?: () => void;
}

export function OrderDetailModal({
  orderId,
  isOpen,
  onClose,
  onUpdateOrder,
}: OrderDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectOrderAdminIsFetchingDetail);
  const orderData = useAppSelector(selectSelectedOrder);
  const detailError = useAppSelector(selectOrderAdminDetailError);

  const { handleDownloadReceipt, downloadingOrderId } = useDownloadReceipt();

  useEffect(() => {
    if (!orderId || !isOpen) return;
    dispatch(fetchOrderByIdAdminService(orderId));
  }, [orderId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedOrder());
    onClose();
  };

  if (isFetchingDetail) {
    return (
      <CustomModal isOpen={isOpen} onClose={handleClose} size="5xl">
        <DialogTitle className="sr-only">Order Details Loading</DialogTitle>
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </CustomModal>
    );
  }

  if (!orderData) {
    return (
      <CustomModal isOpen={isOpen} onClose={handleClose} size="5xl">
        <DialogTitle className="sr-only">Order Details</DialogTitle>
        <div className="flex items-center justify-center h-64 flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            {detailError ? `Error: ${detailError}` : "No order data available"}
          </p>
          {detailError && (
            <p className="text-xs text-muted-foreground">
              The order may have been deleted or you may not have permission.
            </p>
          )}
        </div>
      </CustomModal>
    );
  }

  const statusCfg =
    ORDER_STATUS_BADGE_CONFIG[orderData.orderStatus] || ORDER_STATUS_BADGE_CONFIG.PENDING;
  const currentStep = STEP_ORDER[orderData.orderStatus] ?? -1;
  const isCancelled = orderData.orderStatus === "CANCELLED";

  const formattedAddress = formatAddress(orderData.deliveryAddress);

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} size="5xl">
      <DialogTitle className="sr-only">
        Order Details - {orderData.orderNumber}
      </DialogTitle>
        {/* ── Header ── */}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0 flex items-center justify-between gap-3 pr-12">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground font-mono truncate">
                  {orderData.orderNumber}
                </p>
                <CustomButton variant="unstyled" size="unstyled"
                  onClick={() => {
                    navigator.clipboard.writeText(orderData.orderNumber);
                    showToast.success(Messages.clipboard.addressCopied || "Copied!");
                  }}
                  className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy order number"
                >
                  <Copy className="h-3 w-3" />
                </CustomButton>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {orderData.businessName} •{" "}
                {orderData.source === "PUBLIC" ? "Customer Order" : "POS Order"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 grid grid-cols-1 lg:grid-cols-3 gap-3">

            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-3">

              {/* Status Timeline */}
              <div className="rounded border border-border bg-card p-3">
                <SectionTitle>
                  Order Progress
                </SectionTitle>
                {isCancelled ? (
                  <div className="flex items-center gap-2 px-2 py-2 rounded bg-red-50 border border-red-200">
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-red-700">
                      This order has been cancelled
                    </span>
                  </div>
                ) : (
                  <div className="py-4 overflow-x-auto pb-10">
                    <div className="flex items-center justify-between w-full max-w-xl mx-auto px-4 py-2">
                      {ORDER_STEPS.map((step, idx) => {
                        const isDone = currentStep > STEP_ORDER[step];
                        const isCurrent = currentStep === STEP_ORDER[step];
                        const history = orderData.statusHistory?.find(
                          (h) => h.statusName === step
                        );
                        const isStepCompleted = isDone || (step === "COMPLETED" && isCurrent);
                        return (
                          <Fragment key={step}>
                            {/* Step column */}
                            <div className="flex flex-col items-center relative z-10">
                              <div
                                className={cn(
                                  "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold",
                                  isStepCompleted
                                    ? "bg-emerald-500 text-white shadow-xs ring-4 ring-emerald-500/10 dark:ring-emerald-500/20"
                                    : isCurrent
                                      ? "bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-500/20"
                                      : "bg-muted text-muted-foreground/60 border border-border/70"
                                )}
                              >
                                <span>{idx + 1}</span>
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

                            {/* Connector line */}
                            {idx < ORDER_STEPS.length - 1 && (
                              <div className="flex-1 h-[3px] mx-2 -translate-y-4 rounded-full overflow-hidden bg-muted">
                                <div
                                  className={cn(
                                    "h-full",
                                    isDone
                                      ? "bg-emerald-500 w-full"
                                      : "w-0"
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
              {orderData.items && orderData.items.length > 0 && (
                <div className="rounded border border-border bg-card p-3 shadow-2xs">
                  <SectionTitle>
                    Order Items ({orderData.items.length})
                  </SectionTitle>
                  <div className="space-y-2">
                    {orderData.items.map((item) => {
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

                      const barcode = item.product?.barcode;

                      return (
                        <div
                          key={item.id}
                          className="flex gap-2.5 p-2 rounded border border-border bg-muted/40"
                        >
                          {/* Image */}
                          <CustomImagePreview
                            src={getProductImageUrl(item.product?.imageUrl)}
                            alt={name}
                            fallbackText={name}
                            className="h-10 w-10 rounded-[8px]"
                          />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Name + promotion badge */}
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
                                <span className="flex-shrink-0 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold leading-none">
                                  {promotionLabel}
                                </span>
                              )}
                            </div>

                            {/* Size / SKU / Barcode chips */}
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

                            {/* Customizations as inline chips */}
                            {item.customizations &&
                              item.customizations.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {item.customizations.map((c) => (
                                    <span
                                      key={c.productCustomizationId}
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

                            {/* Price × qty → total */}
                            <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-border/40">
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <span className="text-muted-foreground font-semibold">
                                  {formatCurrency(item.finalPrice)} ×{" "}
                                  <span className={cn(
                                    "font-bold",
                                    item.quantity > 1 ? "text-amber-600 dark:text-amber-400 font-extrabold text-[13px]" : "text-foreground"
                                  )}>
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
              <div className="rounded border border-border bg-card p-3">
                <SectionTitle>
                  Pricing Summary
                </SectionTitle>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">
                      Subtotal ({orderData.pricing?.totalItems || 0} items)
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(orderData.pricing?.subtotal || 0)}
                    </span>
                  </div>

                  {(orderData.pricing?.customizationTotal ?? 0) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-medium">
                        Add-ons / Customizations
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        +{formatCurrency(orderData.pricing!.customizationTotal)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">
                      Delivery {orderData.deliveryOption?.name ? `(${orderData.deliveryOption.name})` : ""}
                    </span>
                    <span className="font-semibold text-foreground">
                      {(orderData.pricing?.deliveryFee ?? 0) > 0
                        ? `+${formatCurrency(orderData.pricing!.deliveryFee)}`
                        : "Free"}
                    </span>
                  </div>

                  {(orderData.pricing?.taxAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-medium">
                        Tax ({orderData.pricing?.taxPercentage}%)
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(orderData.pricing!.taxAmount)}
                      </span>
                    </div>
                  )}

                  {orderData.payment?.paymentMethod && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Payment Mode</span>
                      <span className="font-semibold text-foreground">{orderData.payment.paymentMethod}</span>
                    </div>
                  )}

                  {orderData.payment?.paymentStatus && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Payment Status</span>
                      <span className={cn(
                        "font-bold",
                        orderData.payment.paymentStatus === "PAID"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : orderData.payment.paymentStatus === "REFUNDED"
                            ? "text-red-600"
                            : "text-amber-600"
                      )}>
                        {orderData.payment.paymentStatus}
                      </span>
                    </div>
                  )}

                  {(orderData.pricing?.discountAmount ?? 0) > 0 && (
                    <div className="rounded-[6px] border border-red-500/25 bg-red-500/5 px-2.5 py-1.5 space-y-1 my-1">
                      <div className="flex justify-between text-xs items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="text-red-600 dark:text-red-400 font-bold">Discount</span>
                          {orderData.pricing?.discountType && (
                            <span className="text-[9px] font-extrabold uppercase bg-red-500/15 text-red-600 dark:text-red-400 px-1.5 py-0.2 rounded-full border border-red-500/25">
                              {orderData.pricing.discountType === "PERCENTAGE" || orderData.pricing.discountType === "percentage" ? "%" : "Fixed"}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-red-600 dark:text-red-400">
                          -{formatCurrency(orderData.pricing!.discountAmount)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 mt-1 border-t border-border flex justify-between items-center">
                    <span className="text-xs font-black text-foreground uppercase tracking-wide">
                      Total Amount
                    </span>
                    <span className="text-base font-black text-primary">
                      {formatCurrency(orderData.pricing?.finalTotal || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Profit & Financial Analysis */}
              <div className="rounded border border-border/60 bg-muted/20 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <SectionTitle className="my-0">Order Financial Breakdown</SectionTitle>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Realized Revenue
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">Item Subtotal ({orderData.pricing?.totalItems || 0} items)</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(orderData.pricing?.subtotal || 0)}
                    </span>
                  </div>
                  {(orderData.pricing?.customizationTotal ?? 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Add-ons & Customizations</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        +{formatCurrency(orderData.pricing!.customizationTotal)}
                      </span>
                    </div>
                  )}
                  {(orderData.pricing?.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-red-600 dark:text-red-400 font-medium">
                      <span>Total Discounts Subtracted</span>
                      <span>-{formatCurrency(orderData.pricing!.discountAmount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border/40 flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">Final Collected Amount</span>
                    <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(orderData.pricing?.finalTotal || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status History Card */}
              {orderData.statusHistory && orderData.statusHistory.length > 0 && (
                <div className="rounded border border-border bg-card p-3">
                  <SectionTitle>
                    Status History
                  </SectionTitle>
                  <div className="space-y-1.5 mt-2">
                    {orderData.statusHistory.map((h, idx) => {
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
                </div>
              )}
            </div>

            {/* ── Right sidebar ── */}
            <div className="space-y-3">

              {/* Order Info */}
              <div className="rounded border border-border bg-card p-3">
                <SectionTitle>
                  Order Info
                </SectionTitle>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <InfoRow label="Date" value={dateFormatLocal(orderData.createdAt)} />
                  <InfoRow
                    label="Time"
                    value={new Date(orderData.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  />
                  <InfoRow
                    label="Type"
                    value={
                      orderData.source === "PUBLIC"
                        ? "Customer (Public)"
                        : "Business (POS)"
                    }
                  />
                  <InfoRow
                    label="Business"
                    value={orderData.businessName || "-"}
                  />
                  <InfoRow
                    label="Customer"
                    value={orderData.customerName || "Walk-in Customer"}
                  />
                  {orderData.customerPhone && (
                    <InfoRow
                      label="Phone"
                      value={orderData.customerPhone}
                    />
                  )}
                  <InfoRow
                    label="Order Status"
                    value={
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border", statusCfg.badgeBg, statusCfg.border)}>
                        {getOrderStatusLabel(orderData.orderStatus)}
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Delivery Address */}
              {orderData.deliveryAddress && formattedAddress && (
                <div className="rounded border border-border bg-card p-3">
                  <div className="flex items-start justify-between mb-2.5">
                    <SectionTitle>
                      Delivery Address
                    </SectionTitle>
                    <div className="flex gap-1 flex-shrink-0 -mt-0.5">
                      <CustomButton variant="unstyled" size="unstyled"
                        onClick={() => {
                          const text = orderData.deliveryAddress?.note
                            ? `${formattedAddress}\n\nNote: ${orderData.deliveryAddress.note}`
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
                      {orderData.deliveryAddress.latitude &&
                        orderData.deliveryAddress.longitude && (
                          <CustomButton variant="unstyled" size="unstyled"
                            onClick={() =>
                              window.open(
                                `https://www.google.com/maps?q=${orderData.deliveryAddress.latitude},${orderData.deliveryAddress.longitude}`,
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
                  {orderData.deliveryOption && (
                    <div className="mt-2 pt-2 border-t border-border/40 grid grid-cols-2 gap-2">
                      <InfoRow
                        label="Method"
                        value={orderData.deliveryOption.name}
                      />
                      <InfoRow
                        label="Fee"
                        value={formatCurrency(
                          orderData.deliveryOption.price || 0
                        )}
                      />
                    </div>
                  )}
                  {orderData.deliveryAddress.note && (
                    <div className="mt-2 pt-2 border-t border-border/40">
                      <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                        Delivery Note
                      </p>
                      <p className="text-xs text-foreground">
                        {orderData.deliveryAddress.note}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Remarks */}
              {(() => {
                const raw = orderData.businessNote || "";
                const parts = raw
                  .split("|")
                  .map((p) => p.trim())
                  .filter((p) => p && !p.startsWith("Discount Applied:"));
                if (parts.length === 0) return null;
                return (
                  <div className="rounded border border-border bg-card p-3 space-y-1.5">
                    <SectionTitle>
                      Remarks
                    </SectionTitle>
                    <ul className="space-y-1 text-xs text-foreground font-medium">
                      {parts.map((part, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-primary font-bold text-xs select-none">•</span>
                          <span>{part}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

              {/* System Info */}
              <div className="rounded border border-border bg-card p-3">
                <SectionTitle>System Info</SectionTitle>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <InfoRow label="Created By" value={orderData.createdBy || "-"} />
                  <InfoRow
                    label="Created At"
                    value={dateTimeFormat(orderData.createdAt)}
                  />
                  <InfoRow label="Updated By" value={orderData.updatedBy || "-"} />
                  <InfoRow
                    label="Last Updated"
                    value={dateTimeFormat(orderData.updatedAt)}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-4 py-3 border-t bg-muted/20 flex items-center justify-end gap-2">
          <CustomButton
            variant="outline"
            size="sm"
            onClick={() => handleDownloadReceipt(orderData)}
            disabled={downloadingOrderId === orderData.id}
            isLoading={downloadingOrderId === orderData.id}
            icon={<Download className="h-3 w-3" />}
            className="h-8"
          >
            {downloadingOrderId === orderData.id ? "Downloading..." : "Download Receipt"}
          </CustomButton>

          {onUpdateOrder && (
            <CustomButton
              variant="default"
              size="sm"
              onClick={onUpdateOrder}
              className="gap-1.5 h-8"
            >
              <Edit className="h-3 w-3" />
              Update Status
            </CustomButton>
          )}
        </div>
      </CustomModal>
  );
}
