import { OrderResponse } from "@/features/main/store/models/response/order-response";

/**
 * Generate receipt HTML optimized for 80mm thermal printer
 * Includes product images and download as PNG
 * Width: 80mm (305px at 96 DPI)
 * Height: Dynamic based on content
 */
export function generateReceiptHTML(order: OrderResponse): string {
  const date = new Date(order.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
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

  const itemsHTML = order.items
    .map((item) => {
      const productName = item.product?.name || item.productName || "Product";
      const sizeName = item.product?.sizeName || item.sizeName;
      const itemTotal = (item.finalPrice || 0) * item.quantity;
      const imageUrl = item.product?.imageUrl || item.productImageUrl;

      let promoLabel = "";
      if (item.hasPromotion && item.promotionType) {
        promoLabel = item.promotionType === "PERCENTAGE"
          ? `-${item.promotionValue}%`
          : `-$${item.promotionValue?.toFixed(2)}`;
      }

      const displayName = sizeName ? `${productName} ${sizeName}` : productName;

      return `
        <div class="receipt-item">
          <div class="item-header">
            <span class="item-name">${displayName.substring(0, 24)}</span>
            <span class="item-qty">${item.quantity}</span>
            <span class="item-promo">${promoLabel}</span>
            <span class="item-total">$${itemTotal.toFixed(2)}</span>
          </div>
          ${imageUrl ? `<div class="item-image"><img src="${imageUrl}" alt="${productName}" /></div>` : ""}
          ${
            item.customizations && item.customizations.length > 0
              ? `
            <div class="customizations">
              ${item.customizations
                .map(
                  (c) =>
                    `<div class="custom-item">└─ ${c.name.substring(0, 20)} <span>+$${c.priceAdjustment?.toFixed(2)}</span></div>`
                )
                .join("")}
            </div>
          `
              : ""
          }
        </div>
      `;
    })
    .join("");

  return `
    <div id="receipt-container" style="
      width: 305px;
      margin: 0 auto;
      padding: 0;
      background: white;
      color: black;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      line-height: 1.3;
      white-space: pre-wrap;
      word-wrap: break-word;
    ">
      <style>
        #receipt-container {
          background: white;
          color: black;
        }
        .receipt-header {
          text-align: center;
          font-weight: bold;
          font-size: 14px;
          padding: 8px 0;
          border-bottom: 2px solid #000;
          margin-bottom: 8px;
        }
        .receipt-info {
          font-size: 11px;
          padding: 0 8px;
          margin-bottom: 8px;
          border-bottom: 1px solid #666;
        }
        .receipt-info-line {
          margin-bottom: 4px;
        }
        .receipt-divider {
          text-align: center;
          font-size: 10px;
          color: #333;
          margin: 8px 0;
        }
        .receipt-section-title {
          font-weight: bold;
          padding: 8px;
          border-bottom: 1px solid #666;
          margin-bottom: 4px;
        }
        .receipt-items {
          padding: 0 8px;
          margin-bottom: 8px;
        }
        .receipt-item {
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid #ddd;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          margin-bottom: 2px;
        }
        .item-name {
          flex: 1;
          font-weight: bold;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .item-qty {
          width: 24px;
          text-align: center;
          margin-left: 4px;
        }
        .item-promo {
          width: 45px;
          text-align: right;
          color: #27ae60;
          font-weight: bold;
          margin-left: 4px;
        }
        .item-total {
          width: 60px;
          text-align: right;
          font-weight: bold;
          margin-left: 4px;
        }
        .item-image {
          width: 50px;
          height: 50px;
          margin: 4px 0;
          border: 1px solid #ddd;
          overflow: hidden;
        }
        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .customizations {
          margin-left: 8px;
          font-size: 9px;
          color: #666;
        }
        .custom-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        .custom-item span {
          margin-left: 4px;
          font-weight: bold;
        }
        .receipt-summary {
          padding: 0 8px;
          margin-bottom: 8px;
        }
        .summary-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 10px;
        }
        .summary-label {
          flex: 1;
        }
        .summary-value {
          width: 80px;
          text-align: right;
          font-weight: bold;
        }
        .summary-line.discount {
          background: #ffe0e0;
          padding: 2px 4px;
          color: #d32f2f;
        }
        .receipt-total {
          padding: 8px;
          background: #000;
          color: white;
          text-align: center;
          font-weight: bold;
          margin-bottom: 8px;
          border: 2px solid #000;
        }
        .total-amount {
          font-size: 16px;
        }
        .receipt-footer {
          text-align: center;
          padding: 0 8px;
          border-top: 2px solid #000;
          font-size: 10px;
        }
        .footer-text {
          margin: 4px 0;
        }
      </style>

      <!-- Header -->
      <div class="receipt-header">RECEIPT</div>

      <!-- Order Info -->
      <div class="receipt-info">
        <div class="receipt-info-line">Order #: ${order.orderNumber}</div>
        <div class="receipt-info-line">Date: ${formattedDate} ${formattedTime}</div>
        <div class="receipt-info-line">Business: ${order.businessName || "Business"}</div>
        ${order.customerName ? `<div class="receipt-info-line">Customer: ${order.customerName}</div>` : ""}
      </div>

      <div class="receipt-divider">────────────────────────</div>

      <!-- Items Section -->
      <div class="receipt-section-title">ITEMS</div>
      <div class="receipt-items">
        ${itemsHTML}
      </div>

      <div class="receipt-divider">════════════════════════</div>

      <!-- Summary Section -->
      <div class="receipt-section-title">ORDER SUMMARY</div>
      <div class="receipt-summary">
        <div class="summary-line">
          <span class="summary-label">Payment:</span>
          <span class="summary-value">${order.payment?.paymentMethod || "N/A"}</span>
        </div>
        <div class="summary-line" style="margin-top: 4px;">
          <span class="summary-label">Subtotal w/ Add-ons</span>
          <span class="summary-value">$${(subtotal + customizationTotal).toFixed(2)}</span>
        </div>
        ${
          discount > 0
            ? `
          <div class="summary-line discount">
            <span class="summary-label">Discount (Promotions)</span>
            <span class="summary-value">-$${discount.toFixed(2)}</span>
          </div>
          <div class="summary-line">
            <span class="summary-label">Subtotal After Discount</span>
            <span class="summary-value">$${(subtotal + customizationTotal - discount).toFixed(2)}</span>
          </div>
        `
            : ""
        }
        ${tax > 0 ? `<div class="summary-line"><span class="summary-label">Tax (${order.pricing?.taxPercentage || 0}%)</span><span class="summary-value">+$${tax.toFixed(2)}</span></div>` : ""}
        ${delivery > 0 ? `<div class="summary-line"><span class="summary-label">Delivery Fee</span><span class="summary-value">+$${delivery.toFixed(2)}</span></div>` : ""}
      </div>

      <!-- Total -->
      <div class="receipt-total">
        <div>TOTAL AMOUNT</div>
        <div class="total-amount">$${total.toFixed(2)}</div>
      </div>

      <!-- Footer -->
      <div class="receipt-footer">
        <div class="footer-text">Thank you for your order!</div>
        <div class="footer-text">Please visit again</div>
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #666;">
          <div class="footer-text" style="font-size: 9px; color: #666;">Generated: ${formattedDate} ${formattedTime}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Receipt configuration for 80mm thermal printer
 */
export const RECEIPT_STYLES = {
  paperWidth: "80mm",
  canvasWidth: 305,
  font: "Courier New, monospace",
  fontSize: "11px",
  backgroundColor: "#ffffff",
  textColor: "#000000",
};
