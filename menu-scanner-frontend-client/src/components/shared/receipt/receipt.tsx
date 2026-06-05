"use client";

import { formatCurrency } from "@/utils/common/currency-format";

/* ── shared types ────────────────────────────────────────────────────────── */

export interface ReceiptCustomization {
  id: string;
  name: string;
  priceAdjustment: number;
}

export interface ReceiptItem {
  id: string;
  name: string;
  sizeName?: string | null;
  finalPrice: number;
  quantity: number;
  totalPrice: number;
  hasPromotion?: boolean;
  promotionType?: string | null;
  promotionValue?: number | null;
  customizations?: ReceiptCustomization[];
}

export interface ReceiptPricing {
  subtotal: number;
  customizationTotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  taxPercentage?: number;
  deliveryFee?: number;
  finalTotal: number;
}

export interface ReceiptProps {
  businessName: string;
  orderNumber: string;
  date: Date | string;
  items: ReceiptItem[];
  pricing: ReceiptPricing;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  customerName?: string;
  customerPhone?: string;
}

const FONT = "'Courier New', 'Courier', monospace";

/* ── component ───────────────────────────────────────────────────────────── */

export function Receipt({
  businessName,
  orderNumber,
  date,
  items,
  pricing,
  paymentMethod,
  paymentStatus,
  orderStatus,
  customerName,
  customerPhone,
}: ReceiptProps) {
  const dt = date ? new Date(date) : new Date();
  const dateStr = dt.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
  const timeStr = dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const s: React.CSSProperties = { fontFamily: FONT, fontSize: "12px", lineHeight: "1.5" };

  return (
    <div style={{ ...s, width: "100%", maxWidth: "380px", margin: "0 auto", background: "#fff", padding: "16px 12px", color: "#111" }}>
      <style>{`@media print { body { margin:0 } }`}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div style={{ fontWeight: 700, fontSize: "15px", letterSpacing: "2px", marginBottom: "2px" }}>
          {businessName.toUpperCase()}
        </div>
        <div style={{ fontSize: "11px", color: "#555" }}>POS Receipt</div>
      </div>

      {/* Order info */}
      <div style={{ borderTop: "2px solid #111", borderBottom: "1px dashed #999", padding: "6px 0", marginBottom: "8px", fontSize: "11px" }}>
        <InfoRow label="Order#" value={orderNumber} bold />
        <InfoRow label="Date" value={dateStr} />
        <InfoRow label="Time" value={timeStr} />
        {customerName && <InfoRow label="Customer" value={customerName} />}
        {customerPhone && <InfoRow label="Phone" value={customerPhone} />}
        {orderStatus && <InfoRow label="Status" value={orderStatus} bold />}
        {(paymentMethod || paymentStatus) && (
          <InfoRow label="Payment" value={[paymentMethod, paymentStatus].filter(Boolean).join(" · ")} />
        )}
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 64px 64px", gap: "0 4px", fontWeight: 700, fontSize: "11px", borderBottom: "1px solid #111", paddingBottom: "4px", marginBottom: "4px" }}>
        <span>ITEM</span>
        <span style={{ textAlign: "center" }}>QTY</span>
        <span style={{ textAlign: "right" }}>PRICE</span>
        <span style={{ textAlign: "right" }}>TOTAL</span>
      </div>

      {/* Items */}
      <div style={{ marginBottom: "8px" }}>
        {items.map((item, i) => (
          <ItemRow key={item.id} item={item} index={i} />
        ))}
      </div>

      {/* Summary */}
      <div style={{ borderTop: "1px dashed #999", paddingTop: "6px", fontSize: "12px" }}>
        <SummaryRow label="Subtotal" value={formatCurrency(pricing.subtotal)} />
        {(pricing.customizationTotal ?? 0) > 0 && (
          <SummaryRow label="Add-ons" value={`+${formatCurrency(pricing.customizationTotal!)}`} />
        )}
        {(pricing.discountAmount ?? 0) > 0 && (
          <SummaryRow label="Discount" value={`-${formatCurrency(pricing.discountAmount!)}`} color="#dc2626" />
        )}
        {(pricing.taxAmount ?? 0) > 0 && (
          <SummaryRow label={`Tax (${pricing.taxPercentage ?? 0}%)`} value={`+${formatCurrency(pricing.taxAmount!)}`} />
        )}
        {(pricing.deliveryFee ?? 0) > 0 && (
          <SummaryRow label="Delivery" value={`+${formatCurrency(pricing.deliveryFee!)}`} />
        )}
        {paymentMethod && <SummaryRow label="Payment" value={paymentMethod} />}
      </div>

      {/* Total */}
      <div style={{ borderTop: "2px solid #111", borderBottom: "2px solid #111", margin: "6px 0", padding: "6px 0", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "14px" }}>
        <span>TOTAL AMOUNT</span>
        <span>{formatCurrency(pricing.finalTotal)}</span>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: "11px", color: "#555", paddingTop: "8px" }}>
        <div>Thank you for your order!</div>
        <div>Please visit again</div>
        <div style={{ marginTop: "4px" }}>{dateStr} {timeStr}</div>
      </div>
    </div>
  );
}

/* ── sub-components ──────────────────────────────────────────────────────── */

function ItemRow({ item, index }: { item: ReceiptItem; index: number }) {
  const promoLabel = item.hasPromotion && item.promotionType
    ? item.promotionType === "PERCENTAGE"
      ? `${item.promotionValue}% OFF`
      : `-${formatCurrency(item.promotionValue ?? 0)}`
    : null;

  return (
    <div style={{ borderBottom: "1px dashed #ccc", paddingBottom: "4px", marginBottom: "4px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 64px 64px", gap: "0 4px", fontSize: "12px" }}>
        <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {index + 1}. {item.name}
        </span>
        <span style={{ textAlign: "center" }}>{item.quantity}</span>
        <span style={{ textAlign: "right" }}>{formatCurrency(item.finalPrice)}</span>
        <span style={{ textAlign: "right", fontWeight: 700 }}>{formatCurrency(item.totalPrice)}</span>
      </div>
      {item.sizeName && (
        <div style={{ fontSize: "10px", color: "#555", paddingLeft: "12px" }}>Size: {item.sizeName}</div>
      )}
      {item.customizations?.map((c) => (
        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#555", paddingLeft: "12px" }}>
          <span>+ {c.name}</span>
          {(c.priceAdjustment ?? 0) > 0 && <span>+{formatCurrency(c.priceAdjustment)}</span>}
        </div>
      ))}
      {promoLabel && (
        <div style={{ fontSize: "10px", color: "#16a34a", paddingLeft: "12px", fontWeight: 600 }}>
          ✓ Promo: {promoLabel}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{label}</span>
      <span style={bold ? { fontWeight: 700 } : undefined}>{value}</span>
    </div>
  );
}

function SummaryRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
      <span style={{ color: "#444" }}>{label}</span>
      <span style={{ fontWeight: 600, ...(color ? { color } : {}) }}>{value}</span>
    </div>
  );
}

/* ── mapper helpers (used by thin wrappers) ──────────────────────────────── */

export function orderResponseToReceiptProps(order: import("@/features/main/store/models/response/order-response").OrderResponse): ReceiptProps {
  return {
    businessName: order.businessName || "",
    orderNumber: order.orderNumber || "",
    date: order.createdAt ? new Date(order.createdAt) : new Date(),
    items: (order.items || []).map((item) => ({
      id: item.id,
      name: item.product?.name || item.productName || "Product",
      sizeName: item.product?.sizeName || item.sizeName,
      finalPrice: item.finalPrice ?? 0,
      quantity: item.quantity,
      totalPrice: (item.finalPrice ?? 0) * item.quantity,
      hasPromotion: item.hasPromotion,
      promotionType: item.promotionType,
      promotionValue: item.promotionValue,
      customizations: (item.customizations || []).map((c, idx) => ({
        id: String(idx),
        name: c.name,
        priceAdjustment: c.priceAdjustment ?? 0,
      })),
    })),
    pricing: {
      subtotal: order.pricing?.subtotal ?? 0,
      customizationTotal: order.pricing?.customizationTotal ?? 0,
      discountAmount: order.pricing?.discountAmount ?? 0,
      taxAmount: order.pricing?.taxAmount ?? 0,
      taxPercentage: order.pricing?.taxPercentage ?? 0,
      deliveryFee: order.pricing?.deliveryFee ?? 0,
      finalTotal: order.pricing?.finalTotal ?? 0,
    },
    paymentMethod: order.payment?.paymentMethod,
    paymentStatus: order.payment?.paymentStatus,
    orderStatus: order.orderStatus,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
  };
}
