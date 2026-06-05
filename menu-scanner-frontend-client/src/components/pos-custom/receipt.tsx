"use client";

import { formatCurrency } from "@/utils/common/currency-format";
import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";

interface ReceiptProps {
  orderNumber: string;
  date: Date;
  businessName: string;
  items: PosPageCartItem[];
  subtotalWithAddons: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: string;
}

const DASH = "--------------------------------";
const FONT = "'Courier New', 'Courier', monospace";

export function Receipt({
  orderNumber,
  date,
  businessName,
  items,
  subtotalWithAddons,
  discountAmount,
  subtotalAfterDiscount,
  taxAmount,
  deliveryFee,
  totalAmount,
  paymentMethod,
}: ReceiptProps) {
  const dt = new Date(date);
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

      <div style={{ borderTop: "2px solid #111", borderBottom: "1px dashed #999", padding: "6px 0", marginBottom: "8px", fontSize: "11px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Order#</span><span style={{ fontWeight: 700 }}>{orderNumber}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Date</span><span>{dateStr}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Time</span><span>{timeStr}</span>
        </div>
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
        {items.map((item, i) => {
          const itemTotal = item.finalPrice * item.quantity;
          const promoLabel = item.hasPromotion
            ? item.promotionType === "PERCENTAGE"
              ? `${item.promotionValue}% OFF`
              : `-${formatCurrency(item.promotionValue)}`
            : null;

          return (
            <div key={item.id} style={{ borderBottom: "1px dashed #ccc", paddingBottom: "4px", marginBottom: "4px" }}>
              {/* Main row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 64px 64px", gap: "0 4px", fontSize: "12px" }}>
                <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {i + 1}. {item.productName}
                </span>
                <span style={{ textAlign: "center" }}>{item.quantity}</span>
                <span style={{ textAlign: "right" }}>{formatCurrency(item.finalPrice)}</span>
                <span style={{ textAlign: "right", fontWeight: 700 }}>{formatCurrency(itemTotal)}</span>
              </div>

              {/* Size */}
              {item.sizeName && (
                <div style={{ fontSize: "10px", color: "#555", paddingLeft: "12px" }}>
                  Size: {item.sizeName}
                </div>
              )}

              {/* Customizations */}
              {item.customizations && item.customizations.length > 0 && (
                <div style={{ paddingLeft: "12px" }}>
                  {item.customizations.map((c) => (
                    <div key={c.productCustomizationId} style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#555" }}>
                      <span>+ {c.name}</span>
                      {(c.priceAdjustment ?? 0) > 0 && <span>+{formatCurrency(c.priceAdjustment)}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Promotion */}
              {promoLabel && (
                <div style={{ fontSize: "10px", color: "#16a34a", paddingLeft: "12px", fontWeight: 600 }}>
                  ✓ Promo: {promoLabel}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{ borderTop: "1px dashed #999", paddingTop: "6px", fontSize: "12px" }}>
        <Row label="Subtotal" value={formatCurrency(subtotalWithAddons)} />
        {discountAmount > 0 && (
          <>
            <Row label="Discount" value={`-${formatCurrency(discountAmount)}`} valueStyle={{ color: "#dc2626" }} />
            <Row label="After Discount" value={formatCurrency(subtotalAfterDiscount)} />
          </>
        )}
        {taxAmount > 0 && <Row label="Tax" value={`+${formatCurrency(taxAmount)}`} />}
        {deliveryFee > 0 && <Row label="Delivery" value={`+${formatCurrency(deliveryFee)}`} />}
        <Row label="Payment" value={paymentMethod} />
      </div>

      {/* Total */}
      <div style={{ borderTop: "2px solid #111", borderBottom: "2px solid #111", margin: "6px 0", padding: "6px 0", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "14px" }}>
        <span>TOTAL AMOUNT</span>
        <span>{formatCurrency(totalAmount)}</span>
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

function Row({ label, value, valueStyle }: { label: string; value: string; valueStyle?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
      <span style={{ color: "#444" }}>{label}</span>
      <span style={{ fontWeight: 600, ...valueStyle }}>{value}</span>
    </div>
  );
}
