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
  hasPromotion?: boolean | string;
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

  businessLogo?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;

  deliveryOption?: {
    name: string;
    price: number;
  };

  source?: string;
  customerNote?: string;
  businessNote?: string;

  wifiName?: string;
  wifiPassword?: string;
}

const FONT = "'Courier New', 'Courier', monospace";

function formatAmount(n: number): string {
  if (n % 1 === 0) return String(n);
  return n.toFixed(2);
}

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
  businessLogo,
  businessAddress,
  businessPhone,
  businessEmail,
  deliveryOption,
  source,
  customerNote,
  businessNote,
  wifiName,
  wifiPassword,
}: ReceiptProps) {
  const dt = date ? new Date(date) : new Date();
  const dateStr = dt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const timeStr = dt
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());

  const shortOrderNumber = orderNumber ? orderNumber.split("-").pop() : "";

  const s: React.CSSProperties = {
    fontFamily: FONT,
    fontSize: "8px",
    lineHeight: "1.4",
  };

  return (
    <div
      style={{
        ...s,
        width: "100%",
        maxWidth: "none",
        margin: "0 auto",
        background: "#fff",
        padding: "16px 10px",
        color: "#111",
      }}
    >
      <style>{`@media print { body { margin:0 } }`}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "6px" }}>
        {businessLogo && (
          <img
            src={businessLogo}
            alt={businessName}
            style={{
              width: "48px",
              height: "48px",
              objectFit: "contain",
              borderRadius: "50%",
              border: "1px solid #eee",
              marginBottom: "8px",
              display: "inline-block",
            }}
          />
        )}
        <div
          style={{
            fontWeight: 800,
            fontSize: "14px",
            letterSpacing: "1px",
            marginBottom: "2px",
            color: "#000",
          }}
        >
          {businessName.toUpperCase()}
        </div>
        
        {/* Extra Store Info */}
        {(businessAddress || businessPhone || businessEmail) && (
          <div style={{ fontSize: "8px", color: "#555", marginTop: "4px", lineHeight: "1.3" }}>
            {businessAddress && <div style={{ wordBreak: "break-word" }}>{businessAddress}</div>}
            {(businessPhone || businessEmail) && (
              <div>
                {businessPhone && <span>Tel: {businessPhone}</span>}
                {businessPhone && businessEmail && <span style={{ margin: "0 4px" }}>|</span>}
                {businessEmail && <span>Email: {businessEmail}</span>}
              </div>
            )}
          </div>
        )}
        
        {shortOrderNumber && (
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#000", margin: "2px 0 0 0", lineHeight: "1.1", letterSpacing: "1px" }}>
            {shortOrderNumber}
          </div>
        )}
        <div style={{ fontSize: "9px", fontWeight: 700, color: "#111", marginTop: "2px" }}>
          POS RECEIPT
        </div>
      </div>

      {/* Order info */}
      <div
        style={{
          borderTop: "2px solid #000",
          borderBottom: "1px dashed #000",
          padding: "6px 0",
          marginBottom: "10px",
          fontSize: "9px",
          lineHeight: "1.4",
        }}
      >
        <InfoRow label="TRANS ID" value={orderNumber} bold />
        <InfoRow label="DATE/TIME" value={`${dateStr} ${timeStr}`} />
        {customerName && <InfoRow label="CUSTOMER" value={customerName} />}
        {customerPhone && <InfoRow label="CONTACT" value={customerPhone} />}
        {source && <InfoRow label="SOURCE" value={source.replace("_", " ").toUpperCase()} />}
        {orderStatus && <InfoRow label="STATUS" value={orderStatus.toUpperCase()} bold />}
      </div>

      {/* Column headers + Items in one table for perfect column alignment */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "8px",
          marginBottom: "8px",
          border: "none",
        }}
      >
        <colgroup>
          <col style={{ width: "auto" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "20%" }} />
        </colgroup>
        <thead>
          <tr style={{ borderBottom: "1px solid #111", fontWeight: 700 }}>
            <td
              style={{
                padding: "0",
                paddingBottom: "3px",
                border: "none",
                fontSize: "13px",
              }}
            >
              ITEM
            </td>
            <td
              style={{
                textAlign: "right",
                whiteSpace: "nowrap",
                padding: "0",
                paddingLeft: "4px",
                paddingBottom: "3px",
                border: "none",
                fontSize: "13px",
              }}
            >
              QTY
            </td>
            <td
              style={{
                textAlign: "right",
                whiteSpace: "nowrap",
                padding: "0",
                paddingLeft: "4px",
                paddingBottom: "3px",
                border: "none",
                fontSize: "13px",
              }}
            >
              PRICE
            </td>
            <td
              style={{
                textAlign: "right",
                whiteSpace: "nowrap",
                padding: "0",
                paddingLeft: "4px",
                paddingBottom: "3px",
                border: "none",
                fontSize: "13px",
              }}
            >
              DISC
            </td>
            <td
              style={{
                textAlign: "right",
                whiteSpace: "nowrap",
                padding: "0",
                paddingLeft: "4px",
                paddingBottom: "3px",
                border: "none",
                fontSize: "13px",
              }}
            >
              TOTAL
            </td>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <ItemRow key={item.id} item={item} index={i} />
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div
        style={{
          borderTop: "1px dashed #999",
          fontSize: "8px",
          paddingTop: "4px",
        }}
      >
        <SummaryRow label="Subtotal" value={formatCurrency(pricing.subtotal)} />
        {(pricing.customizationTotal ?? 0) > 0 && (
          <SummaryRow
            label="Add-ons"
            value={`+${formatCurrency(pricing.customizationTotal!)}`}
          />
        )}
        {(pricing.discountAmount ?? 0) > 0 && (
          <SummaryRow
            label="Discount"
            value={`-${formatCurrency(pricing.discountAmount!)}`}
            color="#dc2626"
          />
        )}
        {pricing.taxPercentage !== undefined && pricing.taxPercentage !== null && (
          <SummaryRow
            label={`Tax (${pricing.taxPercentage}%)`}
            value={`+${formatCurrency(pricing.taxAmount ?? 0)}`}
          />
        )}
        {(deliveryOption || (pricing.deliveryFee ?? 0) > 0) && (
          <SummaryRow
            label={deliveryOption?.name ? `Delivery (${deliveryOption.name})` : "Delivery"}
            value={`+${formatCurrency(pricing.deliveryFee ?? deliveryOption?.price ?? 0)}`}
          />
        )}
        {paymentMethod && <SummaryRow label="Payment Mode" value={paymentMethod} />}
        {paymentStatus && <SummaryRow label="Payment Status" value={paymentStatus.toUpperCase()} />}
      </div>

      {/* Total */}
      <div
        style={{
          borderTop: "2px solid #111",
          borderBottom: "2px solid #111",
          margin: "4px 0",
          padding: "4px 0",
          display: "flex",
          justifyContent: "space-between",
          fontWeight: 700,
          fontSize: "14px",
        }}
      >
        <span>TOTAL AMOUNT</span>
        <span>{formatCurrency(pricing.finalTotal)}</span>
      </div>

      {/* Notes */}
      {(customerNote || businessNote) && (
        <div
          style={{
            fontSize: "8px",
            color: "#444",
            borderTop: "1px dashed #ddd",
            marginTop: "6px",
            paddingTop: "6px",
            lineHeight: "1.4",
            textAlign: "left",
          }}
        >
          {customerNote && <div><span style={{ fontWeight: 700 }}>Note:</span> {customerNote}</div>}
          {businessNote && <div><span style={{ fontWeight: 700 }}>Remarks:</span> {businessNote}</div>}
        </div>
      )}

      {/* WiFi Info */}
      {(wifiName || wifiPassword) && (
        <div
          style={{
            borderTop: "1px dashed #ddd",
            marginTop: "6px",
            paddingTop: "6px",
            textAlign: "center",
            fontSize: "8px",
            color: "#444",
            lineHeight: "1.4",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "9px", letterSpacing: "0.5px", color: "#111" }}>WI-FI DETAILS</div>
          {wifiName && <div>SSID: <span style={{ fontWeight: 600 }}>{wifiName}</span></div>}
          {wifiPassword && <div>Password: <span style={{ fontWeight: 600 }}>{wifiPassword}</span></div>}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          fontSize: "7px",
          color: "#555",
          paddingTop: "6px",
        }}
      >
        <div>Thank you for your order!</div>
        <div>Please visit again</div>
      </div>
    </div>
  );
}

/* ── sub-components ──────────────────────────────────────────────────────── */

function ItemRow({ item, index }: { item: ReceiptItem; index: number }) {
  const discLabel =
    item.hasPromotion && item.promotionType
      ? item.promotionType === "PERCENTAGE"
        ? `${item.promotionValue}%`
        : formatCurrency(item.promotionValue ?? 0)
      : "-";

  const sizeDisplay =
    item.sizeName &&
    item.sizeName !== "undefined" &&
    item.sizeName !== "null"
      ? item.sizeName
      : "";

  let originalPrice = item.finalPrice;
  if (item.hasPromotion && item.promotionType && item.promotionValue) {
    if (item.promotionType === "PERCENTAGE" && item.promotionValue < 100) {
      originalPrice = item.finalPrice / (1 - item.promotionValue / 100);
    } else if (item.promotionType === "FIXED_AMOUNT") {
      originalPrice = item.finalPrice + item.promotionValue;
    }
  }
  const showOriginalPrice = item.hasPromotion && originalPrice > item.finalPrice;

  return (
    <>
      <tr style={{ verticalAlign: "top" }}>
        <td
          style={{
            wordBreak: "break-word",
            padding: "2px 0",
            paddingRight: "4px",
            fontWeight: 500,
            border: "none",
            fontSize: "11px",
          }}
        >
          {`${index + 1}.${item.name}${sizeDisplay ? ` (${sizeDisplay})` : ""}`}
        </td>
        <td
          style={{
            textAlign: "right",
            whiteSpace: "nowrap",
            padding: "2px 0",
            paddingLeft: "4px",
            border: "none",
            fontSize: "11px",
          }}
        >
          {item.quantity}
        </td>
        <td
          style={{
            textAlign: "right",
            whiteSpace: "nowrap",
            padding: "2px 0",
            paddingLeft: "4px",
            border: "none",
            fontSize: "11px",
          }}
        >
          {formatCurrency(originalPrice)}
        </td>
        <td
          style={{
            textAlign: "right",
            whiteSpace: "nowrap",
            padding: "2px 0",
            paddingLeft: "4px",
            border: "none",
            fontSize: "11px",
          }}
        >
          {discLabel}
        </td>
        <td
          style={{
            textAlign: "right",
            whiteSpace: "nowrap",
            padding: "2px 0",
            paddingLeft: "4px",
            fontWeight: 600,
            border: "none",
            fontSize: "11px",
          }}
        >
          {formatCurrency(item.totalPrice)}
        </td>
      </tr>

      {item.customizations?.map((c) => (
        <tr key={c.id} style={{ lineHeight: "0.6" }}>
          <td
            style={{
              fontSize: "8px",
              color: "#777",
              padding: "0",
              border: "none",
            }}
          >
            + {c.name}
          </td>
          <td
            colSpan={4}
            style={{
              fontSize: "8px",
              color: "#777",
              textAlign: "right",
              padding: "0 0 0 0",
              border: "none",
            }}
          >
            {(c.priceAdjustment ?? 0) > 0
              ? `+${formatCurrency(c.priceAdjustment)}`
              : ""}
          </td>
        </tr>
      ))}
    </>
  );
}

function InfoRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "11px",
      }}
    >
      <span>{label}</span>
      <span style={bold ? { fontWeight: 700 } : undefined}>{value}</span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "10px",
        marginBottom: "2px",
      }}
    >
      <span style={{ color: "#444" }}>{label}</span>
      <span style={{ fontWeight: 600, ...(color ? { color } : {}) }}>
        {value}
      </span>
    </div>
  );
}

/* ── mapper helpers (used by thin wrappers) ──────────────────────────────── */

export function orderResponseToReceiptProps(
  order: import("@/features/main/store/models/response/order-response").OrderResponse,
): ReceiptProps {
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
    deliveryOption: order.deliveryOption ? {
      name: order.deliveryOption.name,
      price: order.deliveryOption.price,
    } : undefined,
    source: order.source || undefined,
    customerNote: order.customerNote || undefined,
    businessNote: order.businessNote || undefined,
  };
}
