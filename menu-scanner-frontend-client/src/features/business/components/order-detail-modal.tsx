"use client";

import { Messages } from "@/constants/messages";
import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectOrderAdminIsFetchingDetail,
  selectSelectedOrder,
  selectOrderAdminDetailError,
} from "../store/selectors/order-admin-selector";
import { fetchOrderByIdAdminService } from "../store/thunks/order-admin-thunks";
import { clearSelectedOrder } from "../store/slice/order-admin-slice";
import { formatCurrency } from "@/utils/common/currency-format";
import { getOrderStatusLabel } from "@/enums/order-status.enum";
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

interface OrderDetailModalProps {
  orderId?: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOrder?: () => void;
}

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

  useEffect(() => {
    if (!orderId || !isOpen) return;
    dispatch(fetchOrderByIdAdminService(orderId));
  }, [orderId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedOrder());
    onClose();
  };

  const handleDownloadReceipt = async () => {
    if (!orderData?.id || !orderData?.items) return;
    try {
      const element = document.createElement("div");
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.width = "80mm";
      element.style.height = "auto";
      element.style.fontFamily = "monospace";
      element.style.fontSize = "11px";
      element.style.backgroundColor = "#fff";
      element.style.padding = "4mm";

      const date = new Date(orderData.createdAt);
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const formattedTime = date
        .toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());

      const subtotal = orderData.pricing?.subtotal || 0;
      const discount = orderData.pricing?.discountAmount || 0;
      const subtotalAfterDiscount = subtotal - discount;
      const tax = orderData.pricing?.taxAmount || 0;
      const delivery = orderData.pricing?.deliveryFee || 0;
      const total = orderData.pricing?.finalTotal || 0;

      const itemsHTML = orderData.items
        .map((item) => {
          const itemTotal = (item.finalPrice || 0) * item.quantity;
          return `
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:11px;">
            <span style="flex:1;">${item.productName || item.product?.name}</span>
            <span style="width:16px;text-align:center;">${item.quantity}</span>
            <span style="width:50px;text-align:right;">$${itemTotal.toFixed(2)}</span>
          </div>
        `;
        })
        .join("");

      element.innerHTML = `
        <div style="width:80mm;background:white;">
          <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:4px;margin-bottom:6px;">
            <div style="font-weight:bold;font-size:13px;letter-spacing:1px;">RECEIPT</div>
          </div>
          <div style="text-align:center;font-size:10px;margin-bottom:6px;border-bottom:1px solid #666;padding-bottom:4px;">
            <div>Order #: ${orderData.orderNumber}</div>
            <div>Date: ${formattedDate} • ${formattedTime}</div>
            <div style="font-weight:bold;">${orderData.businessName || "Restaurant"}</div>
          </div>
          <div style="margin-bottom:6px;border-bottom:1px solid #666;padding-bottom:4px;">
            <div style="text-align:center;font-weight:bold;font-size:10px;border-bottom:1px solid #666;padding-bottom:2px;margin-bottom:4px;">ITEMS</div>
            <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:10px;margin-bottom:2px;">
              <span style="flex:1;">NAME</span>
              <span style="width:16px;text-align:center;">QTY</span>
              <span style="width:50px;text-align:right;">TOTAL</span>
            </div>
            <div style="border-bottom:1px solid #ccc;margin-bottom:2px;"></div>
            ${itemsHTML}
          </div>
          <div style="margin-bottom:6px;border-bottom:2px solid #000;padding-bottom:6px;">
            <div style="font-size:10px;line-height:1.6;">
              <div style="display:flex;justify-content:space-between;"><span>Subtotal</span><span style="font-weight:bold;">$${subtotal.toFixed(2)}</span></div>
              ${discount > 0 ? `<div style="display:flex;justify-content:space-between;color:#d32f2f;"><span>Discount</span><span style="font-weight:bold;">-$${discount.toFixed(2)}</span></div><div style="display:flex;justify-content:space-between;"><span>After Discount</span><span style="font-weight:bold;">$${subtotalAfterDiscount.toFixed(2)}</span></div>` : ""}
              <div style="display:flex;justify-content:space-between;"><span>Tax</span><span style="font-weight:bold;">+$${tax.toFixed(2)}</span></div>
              <div style="display:flex;justify-content:space-between;"><span>Delivery</span><span style="font-weight:bold;">${delivery > 0 ? `+$${delivery.toFixed(2)}` : "Free"}</span></div>
              <div style="border-top:1px solid #666;padding-top:3px;margin-top:3px;display:flex;justify-content:space-between;font-weight:bold;font-size:11px;"><span>TOTAL</span><span>$${total.toFixed(2)}</span></div>
            </div>
          </div>
          <div style="text-align:center;font-size:10px;padding-top:4px;">
            <div>Thank you for your order!</div>
          </div>
        </div>
      `;

      document.body.appendChild(element);

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all(
        [import("html2canvas"), import("jspdf")]
      );

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 250],
      });

      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * 80) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, 80, imgHeight);
      pdf.save(`receipt-${orderData.orderNumber}.pdf`);
      document.body.removeChild(element);
      showToast.success("Receipt downloaded successfully");
    } catch {
      showToast.error("Failed to generate receipt");
    }
  };

  if (isFetchingDetail) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Order Details Loading</DialogTitle>
        <DialogContent className="w-full sm:max-w-5xl max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!orderData) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Order Details</DialogTitle>
        <DialogContent className="w-full sm:max-w-5xl max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden">
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
        </DialogContent>
      </Dialog>
    );
  }

  const statusCfg =
    STATUS_CONFIG[orderData.orderStatus] || STATUS_CONFIG.PENDING;
  const currentStep = STEP_ORDER[orderData.orderStatus] ?? -1;
  const isCancelled = orderData.orderStatus === "CANCELLED";

  const formattedAddress = [
    orderData.deliveryAddress?.houseNumber,
    orderData.deliveryAddress?.streetNumber
      ? `St. ${orderData.deliveryAddress.streetNumber}`
      : null,
    orderData.deliveryAddress?.village,
    orderData.deliveryAddress?.commune,
    orderData.deliveryAddress?.district,
    orderData.deliveryAddress?.province,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">
        Order Details - {orderData.orderNumber}
      </DialogTitle>

      <DialogContent className="w-full sm:max-w-5xl max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0 flex items-center justify-between gap-3">
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
                  <div className="flex items-start overflow-x-auto px-2 py-2">
                    {ORDER_STEPS.map((step, idx) => {
                      const isDone = currentStep >= STEP_ORDER[step];
                      const isCurrent = currentStep === STEP_ORDER[step];
                      const history = orderData.statusHistory?.find(
                        (h) => h.statusName === step
                      );
                      return (
                        <div key={step} className="flex items-start flex-shrink-0">
                          {/* Step column */}
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
                                {new Date(history.changedAt).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground/40 text-center block mt-0.5">
                                —
                              </span>
                            )}
                          </div>

                          {/* Connector between steps */}
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
                              <div className="absolute bottom-0 left-0 right-0 bg-red-500/85 text-white text-center font-bold leading-none py-0.5" style={{ fontSize: "7px" }}>
                                SALE
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Name + promotion badge */}
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

                            {/* Size / SKU chips */}
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
                  <InfoRow label="Date" value={new Date(orderData.createdAt).toLocaleDateString()} />
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
            onClick={handleDownloadReceipt}
            className="gap-1.5 h-8"
          >
            <Download className="h-3 w-3" />
            Download Receipt
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
      </DialogContent>
    </Dialog>
  );
}
