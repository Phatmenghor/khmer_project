"use client";

import { formatCurrency } from "@/utils/common/currency-format";
import { OrderResponse } from "@/features/main/store/models/response/order-response";

interface OrderReceiptProps {
  order: OrderResponse;
}

const FONT = "'Courier New', 'Courier', monospace";

export function OrderReceipt({ order }: OrderReceiptProps) {
  if (!order) return null;

  const dt = order.createdAt ? new Date(order.createdAt) : null;
  const dateStr = dt ? dt.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }) : "N/A";
  const timeStr = dt ? dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "N/A";

  const p = order.pricing;
  const s: React.CSSProperties = { fontFamily: FONT, fontSize: "12px", lineHeight: "1.5" };

  return (
    <div style={{ ...s, width: "100%", maxWidth: "380px", margin: "0 auto", background: "#fff", padding: "16px 12px", color: "#111" }}>
      <style>{`@media print { body { margin:0 } }`}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div style={{ fontWeight: 700, fontSize: "15px", letterSpacing: "2px", marginBottom: "2px" }}>
          {(order.businessName || "").toUpperCase()}
        </div>
        <div style={{ fontSize: "11px", color: "#555" }}>POS Receipt</div>
      </div>

      {/* Order info */}
      <div style={{ borderTop: "2px solid #111", borderBottom: "1px dashed #999", padding: "6px 0", marginBottom: "8px", fontSize: "11px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Order#</span><span style={{ fontWeight: 700 }}>{order.orderNumber}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Date</span><span>{dateStr}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Time</span><span>{timeStr}</span>
        </div>
        {order.customerName && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Customer</span><span>{order.customerName}</span>
          </div>
        )}
        {order.customerPhone && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Phone</span><span>{order.customerPhone}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Status</span><span style={{ fontWeight: 600 }}>{order.orderStatus}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Payment</span><span>{order.payment?.paymentMethod || "—"} · {order.payment?.paymentStatus || "Pending"}</span>
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
        {(order.items || []).map((item, i) => {
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
                  {i + 1}. {item.product?.name || "Product"}
                </span>
                <span style={{ textAlign: "center" }}>{item.quantity}</span>
                <span style={{ textAlign: "right" }}>{formatCurrency(item.finalPrice)}</span>
                <span style={{ textAlign: "right", fontWeight: 700 }}>{formatCurrency(itemTotal)}</span>
              </div>

              {/* Size */}
              {item.product?.sizeName && (
                <div style={{ fontSize: "10px", color: "#555", paddingLeft: "12px" }}>
                  Size: {item.product.sizeName}
                </div>
              )}

              {/* Customizations */}
              {item.customizations && item.customizations.length > 0 && (
                <div style={{ paddingLeft: "12px" }}>
                  {item.customizations.map((c, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#555" }}>
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
        <Row label="Subtotal" value={formatCurrency(p?.subtotal ?? 0)} />
        {(p?.customizationTotal ?? 0) > 0 && (
          <Row label="Add-ons" value={`+${formatCurrency(p!.customizationTotal)}`} />
        )}
        {(p?.discountAmount ?? 0) > 0 && (
          <Row label="Discount" value={`-${formatCurrency(p!.discountAmount)}`} valueStyle={{ color: "#dc2626" }} />
        )}
        {(p?.taxAmount ?? 0) > 0 && (
          <Row label={`Tax (${p?.taxPercentage ?? 0}%)`} value={`+${formatCurrency(p!.taxAmount)}`} />
        )}
        {(p?.deliveryFee ?? 0) > 0 && (
          <Row label="Delivery" value={`+${formatCurrency(p!.deliveryFee)}`} />
        )}
      </div>

      {/* Total */}
      <div style={{ borderTop: "2px solid #111", borderBottom: "2px solid #111", margin: "6px 0", padding: "6px 0", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "14px" }}>
        <span>TOTAL AMOUNT</span>
        <span>{formatCurrency(p?.finalTotal ?? 0)}</span>
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
