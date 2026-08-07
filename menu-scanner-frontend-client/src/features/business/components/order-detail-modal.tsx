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
              <div className="rounded border border-border/50 bg-card p-3">
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

                {/* Status history list */}
                {orderData.statusHistory && orderData.statusHistory.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
                    {orderData.statusHistory.map((h, idx) => (
                      <div
                        key={h.id}
                        className="flex items-start gap-2 text-xs"
                      >
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
                          {h.changedBy && (
                            <span className="text-muted-foreground ml-1">
                              by {h.changedBy.fullName || h.changedBy.firstName}
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
              {orderData.items && orderData.items.length > 0 && (
                <div className="rounded border border-border/50 bg-card p-3">
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
                          className="flex gap-2.5 p-2 rounded border border-border/50 bg-muted/20"
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
                                      {c.priceAdjustment > 0 && (
                                        <span className="font-medium">
                                          &nbsp;+{formatCurrency(c.priceAdjustment)}
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              )}

                            {/* Price × qty → total */}
                            <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-border/40">
                              <div className="flex flex-col gap-0.5">
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
                                  <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                                    <span className="text-muted-foreground line-through">
                                      {formatCurrency(item.currentPrice)}
                                    </span>
                                    <span className="text-red-500 font-bold">
                                      Saved {formatCurrency((item.currentPrice - item.finalPrice) * item.quantity)}
                                    </span>
                                  </div>
                                )}
                              </div>
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
              )}

              {/* Pricing Summary */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>
                  Pricing Summary
                </SectionTitle>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Subtotal ({orderData.pricing?.totalItems || 0} items)
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(orderData.pricing?.subtotal || 0)}
                    </span>
                  </div>

                  {(orderData.pricing?.customizationTotal ?? 0) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Add-ons / Customizations
                      </span>
                      <span className="font-medium text-blue-600">
                        +{formatCurrency(orderData.pricing!.customizationTotal)}
                      </span>
                    </div>
                  )}

                  {(orderData.pricing?.discountAmount ?? 0) > 0 && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Discount
                          {orderData.pricing?.discountType &&
                            ` (${orderData.pricing.discountType === "percentage" ? "%" : "Fixed"})`}
                        </span>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(orderData.pricing!.discountAmount)}
                        </span>
                      </div>
                      {orderData.pricing?.discountReason && (
                        <div className="text-xs text-muted-foreground pl-2 italic">
                          Reason: {orderData.pricing.discountReason}
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="font-medium text-foreground">
                      {(orderData.pricing?.deliveryFee ?? 0) > 0
                        ? formatCurrency(orderData.pricing!.deliveryFee)
                        : "Free"}
                    </span>
                  </div>

                  {(orderData.pricing?.taxAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Tax ({orderData.pricing?.taxPercentage}%)
                      </span>
                      <span className="font-medium text-green-600">
                        +{formatCurrency(orderData.pricing!.taxAmount)}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 mt-1 border-t border-border/50 flex justify-between">
                    <span className="text-xs font-bold text-foreground">
                      Total
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {formatCurrency(orderData.pricing?.finalTotal || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right sidebar ── */}
            <div className="space-y-3">

              {/* Order Info */}
              <div className="rounded border border-border/50 bg-card p-3">
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
                    label="Order Status"
                    value={
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border", statusCfg.badgeBg, statusCfg.border)}>
                        {getOrderStatusLabel(orderData.orderStatus)}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Payment Method"
                    value={orderData.payment?.paymentMethod || "-"}
                  />
                  <InfoRow
                    label="Payment Status"
                    value={
                      <span
                        className={cn(
                          "font-semibold",
                          orderData.payment?.paymentStatus === "PAID"
                            ? "text-green-600"
                            : orderData.payment?.paymentStatus === "REFUNDED"
                              ? "text-red-600"
                              : "text-amber-600"
                        )}
                      >
                        {orderData.payment?.paymentStatus || "-"}
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Customer Info */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>
                  Customer
                </SectionTitle>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                      Name
                    </p>
                    <p className="text-xs font-semibold text-foreground">
                      {orderData.customerName || "Walk-in Customer"}
                    </p>
                  </div>
                  {orderData.customerPhone && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                        Phone
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {orderData.customerPhone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Note */}
              {orderData.customerNote && (
                <div className="rounded border border-border/50 bg-card p-3">
                  <SectionTitle>
                    Customer Note
                  </SectionTitle>
                  <p className="text-xs text-foreground leading-relaxed">
                    {orderData.customerNote}
                  </p>
                </div>
              )}

              {/* Delivery Address */}
              {orderData.deliveryAddress && formattedAddress && (
                <div className="rounded border border-border/50 bg-card p-3">
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

              {/* Business Note */}
              {orderData.businessNote && (
                <div className="rounded border border-amber-200 bg-amber-50 p-3">
                  <SectionTitle>
                    Business Note
                  </SectionTitle>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {orderData.businessNote}
                  </p>
                </div>
              )}

              {/* System Info */}
              <div className="rounded border border-border/50 bg-card p-3">
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
