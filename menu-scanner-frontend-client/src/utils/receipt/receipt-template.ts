import { OrderResponse } from "@/features/main/store/models/response/order-response";

export function generateReceiptHTML(order: OrderResponse): string {
  const dt = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateStr = dt.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
  const timeStr = dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const p = order.pricing;
  const fmt = (v: number) => `$${(v ?? 0).toFixed(2)}`;

  const itemsHTML = (order.items || []).map((item, i) => {
    const name = item.product?.name || item.productName || "Product";
    const size = item.product?.sizeName || item.sizeName || "";
    const itemTotal = (item.finalPrice ?? 0) * item.quantity;

    const sizeRow = size
      ? `<div style="padding-left:12px;font-size:10px;color:#555;">Size: ${size}</div>`
      : "";

    const customRows = (item.customizations || []).map((c) => {
      const price = (c.priceAdjustment ?? 0) > 0 ? `<span style="float:right">+${fmt(c.priceAdjustment)}</span>` : "";
      return `<div style="padding-left:12px;font-size:10px;color:#555;overflow:hidden;">+ ${c.name}${price}</div>`;
    }).join("");

    const promoRow = item.hasPromotion && item.promotionType
      ? `<div style="padding-left:12px;font-size:10px;color:#16a34a;font-weight:600;">✓ Promo: ${item.promotionType === "PERCENTAGE" ? `${item.promotionValue}% OFF` : `-${fmt(item.promotionValue ?? 0)}`}</div>`
      : "";

    return `
      <div style="border-bottom:1px dashed #ccc;padding-bottom:4px;margin-bottom:4px;">
        <div style="display:grid;grid-template-columns:1fr 28px 60px 56px;gap:0 4px;font-size:12px;">
          <span style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${i + 1}. ${name}</span>
          <span style="text-align:center;">${item.quantity}</span>
          <span style="text-align:right;">${fmt(item.finalPrice ?? 0)}</span>
          <span style="text-align:right;font-weight:700;">${fmt(itemTotal)}</span>
        </div>
        ${sizeRow}${customRows}${promoRow}
      </div>`;
  }).join("");

  const summaryRows = [
    ["Subtotal", fmt(p?.subtotal ?? 0)],
    ...(( p?.customizationTotal ?? 0) > 0 ? [["Add-ons", `+${fmt(p!.customizationTotal)}`]] : []),
    ...((p?.discountAmount ?? 0) > 0 ? [["Discount", `-${fmt(p!.discountAmount)}`, "#dc2626"]] : []),
    ...((p?.taxAmount ?? 0) > 0 ? [[`Tax (${p?.taxPercentage ?? 0}%)`, `+${fmt(p!.taxAmount)}`]] : []),
    ...((p?.deliveryFee ?? 0) > 0 ? [["Delivery", `+${fmt(p!.deliveryFee)}`]] : []),
    ["Payment", order.payment?.paymentMethod || "—"],
  ].map(([label, value, color]) =>
    `<div style="display:flex;justify-content:space-between;margin-bottom:2px;">
      <span style="color:#444;">${label}</span>
      <span style="font-weight:600;${color ? `color:${color};` : ""}">${value}</span>
    </div>`
  ).join("");

  const customerInfo = order.customerName
    ? `<div style="display:flex;justify-content:space-between;"><span>Customer</span><span>${order.customerName}</span></div>
       ${order.customerPhone ? `<div style="display:flex;justify-content:space-between;"><span>Phone</span><span>${order.customerPhone}</span></div>` : ""}`
    : "";

  return `
    <div style="width:100%;max-width:305px;margin:0 auto;background:#fff;padding:16px 12px;box-sizing:border-box;font-family:'Courier New',monospace;font-size:12px;line-height:1.5;color:#111;">

      <!-- Header -->
      <div style="text-align:center;margin-bottom:8px;">
        <div style="font-weight:700;font-size:15px;letter-spacing:2px;margin-bottom:2px;">${(order.businessName || "").toUpperCase()}</div>
        <div style="font-size:11px;color:#555;">POS Receipt</div>
      </div>

      <!-- Order info -->
      <div style="border-top:2px solid #111;border-bottom:1px dashed #999;padding:6px 0;margin-bottom:8px;font-size:11px;">
        <div style="display:flex;justify-content:space-between;"><span>Order#</span><span style="font-weight:700;">${order.orderNumber}</span></div>
        <div style="display:flex;justify-content:space-between;"><span>Date</span><span>${dateStr}</span></div>
        <div style="display:flex;justify-content:space-between;"><span>Time</span><span>${timeStr}</span></div>
        ${customerInfo}
        <div style="display:flex;justify-content:space-between;"><span>Status</span><span style="font-weight:600;">${order.orderStatus || ""}</span></div>
        <div style="display:flex;justify-content:space-between;"><span>Payment</span><span>${order.payment?.paymentMethod || "—"} · ${order.payment?.paymentStatus || "Pending"}</span></div>
      </div>

      <!-- Column headers -->
      <div style="display:grid;grid-template-columns:1fr 28px 60px 56px;gap:0 4px;font-weight:700;font-size:11px;border-bottom:1px solid #111;padding-bottom:4px;margin-bottom:4px;">
        <span>ITEM</span>
        <span style="text-align:center;">QTY</span>
        <span style="text-align:right;">PRICE</span>
        <span style="text-align:right;">TOTAL</span>
      </div>

      <!-- Items -->
      <div style="margin-bottom:8px;">${itemsHTML}</div>

      <!-- Summary -->
      <div style="border-top:1px dashed #999;padding-top:6px;font-size:12px;">${summaryRows}</div>

      <!-- Total -->
      <div style="border-top:2px solid #111;border-bottom:2px solid #111;margin:6px 0;padding:6px 0;display:flex;justify-content:space-between;font-weight:700;font-size:14px;">
        <span>TOTAL AMOUNT</span>
        <span>${fmt(p?.finalTotal ?? 0)}</span>
      </div>

      <!-- Footer -->
      <div style="text-align:center;font-size:11px;color:#555;padding-top:8px;">
        <div>Thank you for your order!</div>
        <div>Please visit again</div>
        <div style="margin-top:4px;">${dateStr} ${timeStr}</div>
      </div>
    </div>`;
}

export const RECEIPT_STYLES = {
  paperWidth: "80mm",
  width: "100%",
  maxWidth: 305,
  font: "'Courier New', monospace",
  fontSize: "12px",
  padding: "16px 12px",
};
