import { OrderResponse } from "@/features/main/store/models/response/order-response";

/**
 * Generate clean text receipt for 80mm thermal printer
 * Optimized for both frontend display and backend generation
 * No images - pure monospace text format
 */
export function generateReceiptHTML(order: OrderResponse): string {
  const date = new Date(order.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const subtotal = order.pricing?.subtotal || 0;
  const discount = order.pricing?.discountAmount || 0;
  const tax = order.pricing?.taxAmount || 0;
  const delivery = order.pricing?.deliveryFee || 0;
  const customizationTotal = order.pricing?.customizationTotal || 0;
  const total = order.pricing?.finalTotal || 0;

  // Helper functions
  const padRight = (str: string, len: number) => str.padEnd(len, " ");
  const padLeft = (str: string, len: number) => str.padStart(len, " ");
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  // Generate items text
  const itemsHTML = order.items
    .map((item) => {
      const productName = item.product?.name || item.productName || "Product";
      const sizeName = item.product?.sizeName || item.sizeName;
      const itemTotal = (item.finalPrice || 0) * item.quantity;

      let promoLabel = "";
      if (item.hasPromotion && item.promotionType) {
        promoLabel = item.promotionType === "PERCENTAGE"
          ? `-${item.promotionValue}%`
          : `-${formatPrice(item.promotionValue || 0)}`;
      }

      const displayName = sizeName
        ? `${productName} ${sizeName}`.substring(0, 20)
        : productName.substring(0, 20);

      let itemHTML = `<div class="item-row">${padRight(displayName, 20)} ${padLeft(String(item.quantity), 2)} ${padLeft(promoLabel, 8)} ${padLeft(formatPrice(itemTotal), 9)}</div>`;

      if (item.customizations && item.customizations.length > 0) {
        itemHTML += item.customizations
          .map((c) => {
            const customName = c.name.substring(0, 18);
            return `<div class="custom-row">  └─ ${padRight(customName, 18)} ${padLeft(formatPrice(c.priceAdjustment || 0), 9)}</div>`;
          })
          .join("");
      }

      return itemHTML;
    })
    .join("");

  return `
    <div id="receipt-container" style="
      font-family: 'Courier New', monospace;
      width: 305px;
      padding: 8px;
      background: white;
      color: black;
      font-size: 11px;
      line-height: 1.4;
    ">
      <style>
        #receipt-container {
          margin: 0;
          padding: 8px;
          background: white;
          color: black;
          white-space: pre;
        }
        .header { text-align: center; font-weight: bold; font-size: 13px; margin-bottom: 8px; }
        .divider { text-align: center; letter-spacing: -2px; margin: 4px 0; }
        .info-section { margin-bottom: 8px; font-size: 10px; }
        .info-line { margin-bottom: 2px; }
        .section-title { font-weight: bold; margin-bottom: 4px; border-bottom: 1px solid #000; padding-bottom: 2px; }
        .items-section { margin-bottom: 8px; }
        .item-row { font-family: 'Courier New', monospace; font-size: 10px; margin-bottom: 1px; }
        .custom-row { font-family: 'Courier New', monospace; font-size: 9px; color: #333; margin-bottom: 1px; }
        .summary-section { margin-bottom: 8px; font-size: 10px; }
        .summary-line { display: flex; justify-content: space-between; margin-bottom: 2px; }
        .summary-label { flex: 1; }
        .summary-value { text-align: right; font-weight: bold; min-width: 80px; }
        .discount-line { background: #f0f0f0; padding: 1px 2px; color: #d32f2f; }
        .total-section { background: #f5f5f5; padding: 4px; text-align: right; font-weight: bold; margin-bottom: 8px; border: 1px solid #000; }
        .total-amount { font-size: 14px; margin-top: 2px; }
        .footer { text-align: center; font-size: 9px; margin-top: 8px; border-top: 1px solid #000; padding-top: 4px; }
      </style>

      <div class="header">RECEIPT</div>
      <div class="divider">════════════════════════</div>

      <div class="info-section">
        <div class="info-line">Order #: ${order.orderNumber}</div>
        <div class="info-line">Date: ${formattedDate} ${formattedTime}</div>
        <div class="info-line">Business: ${(order.businessName || "Business").substring(0, 28)}</div>
        ${order.customerName ? `<div class="info-line">Customer: ${order.customerName.substring(0, 26)}</div>` : ""}
      </div>

      <div class="divider">────────────────────────</div>

      <div class="section-title">ITEMS</div>
      <div style="font-size: 9px; margin-bottom: 4px;">
${padRight("NAME", 20)} ${padLeft("QTY", 2)} ${padLeft("DISC", 8)} ${padLeft("TOTAL", 9)}
      </div>
      <div class="divider">────────────────────────</div>

      <div class="items-section">
        ${itemsHTML}
      </div>

      <div class="divider">════════════════════════</div>

      <div class="section-title">ORDER SUMMARY</div>

      <div class="summary-section">
        <div class="summary-line">
          <span class="summary-label">Payment:</span>
          <span class="summary-value">${order.payment?.paymentMethod || "N/A"}</span>
        </div>

        <div class="summary-line" style="margin-top: 4px;">
          <span class="summary-label">Subtotal w/ Add-ons</span>
          <span class="summary-value">${formatPrice(subtotal + customizationTotal)}</span>
        </div>

        ${
          discount > 0
            ? `
        <div class="summary-line discount-line">
          <span class="summary-label">Discount</span>
          <span class="summary-value">-${formatPrice(discount)}</span>
        </div>
        <div class="summary-line">
          <span class="summary-label">Subtotal After Discount</span>
          <span class="summary-value">${formatPrice(subtotal + customizationTotal - discount)}</span>
        </div>
        `
            : ""
        }

        ${tax > 0 ? `<div class="summary-line"><span class="summary-label">Tax (${order.pricing?.taxPercentage || 0}%)</span><span class="summary-value">+${formatPrice(tax)}</span></div>` : ""}

        ${delivery > 0 ? `<div class="summary-line"><span class="summary-label">Delivery Fee</span><span class="summary-value">+${formatPrice(delivery)}</span></div>` : ""}
      </div>

      <div class="divider">════════════════════════</div>

      <div class="total-section">
        TOTAL AMOUNT
        <div class="total-amount">${formatPrice(total)}</div>
      </div>

      <div class="footer">
        <div>Thank you for your order!</div>
        <div style="margin-top: 4px;">Please visit again</div>
        <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #ccc; font-size: 8px; color: #666;">
          ${formattedDate} ${formattedTime}
        </div>
      </div>

    </div>
  `;
}

/**
 * Receipt configuration
 */
export const RECEIPT_STYLES = {
  paperWidth: "80mm",
  width: 305,
  font: "Courier New, monospace",
  fontSize: "11px",
};
