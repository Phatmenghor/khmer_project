import { OrderResponse } from "@/features/main/store/models/response/order-response";

/**
 * Generate responsive receipt for 80mm thermal printer
 * Uses flexible CSS layout instead of character counting
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

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  // Generate items rows
  const itemsRows = order.items
    .map((item) => {
      const productName = item.product?.name || item.productName || "Product";
      const sizeName = item.product?.sizeName || item.sizeName;
      const itemTotal = (item.finalPrice || 0) * item.quantity;

      let discount = "0%";
      if (item.hasPromotion && item.promotionType) {
        discount = item.promotionType === "PERCENTAGE"
          ? `${item.promotionValue}%`
          : `${(item.promotionValue || 0).toFixed(2)}`;
      }

      const displayName = sizeName
        ? `${productName} ${sizeName}`
        : productName;

      const customizationRows = item.customizations?.length > 0
        ? item.customizations.map((c) => {
            const truncated = c.name.length > 38 ? c.name.slice(0, 38) + "..." : c.name;
            const price = (c.priceAdjustment || 0).toFixed(2);
            return `
        <tr class="custom-row">
          <td colspan="4" style="padding: 1px 0 1px 12px; font-size: 0.78em; color: #666; white-space: nowrap; line-height: 1.1;">${truncated}</td>
          <td style="text-align: right; padding: 1px 4px 1px 0; font-size: 0.78em; color: #666; white-space: nowrap; line-height: 1.1;">${price}</td>
        </tr>`;
          }).join("")
        : "";

      return `
        <tr style="height: 20px; line-height: 1;">
          <td style="max-width: 50%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-left: 0;">${displayName}</td>
          <td style="text-align: right; padding: 0 4px; white-space: nowrap;">${(item.finalPrice || 0).toFixed(2)}</td>
          <td style="text-align: center; padding: 0 4px;">${item.quantity}</td>
          <td style="text-align: right; padding: 0 4px; white-space: nowrap;">${discount}</td>
          <td style="text-align: right; padding-right: 4px; white-space: nowrap;">${itemTotal.toFixed(2)}</td>
        </tr>${customizationRows}`;
    })
    .join("");

  const summaryRows = `
        <tr style="border: none; height: 14px;">
          <td colspan="4" style="text-align: left; border: none; padding: 1px 0;">Subtotal</td>
          <td style="text-align: right; padding-right: 4px; border: none; padding-top: 1px; padding-bottom: 1px;">${formatPrice(subtotal + customizationTotal)}</td>
        </tr>
        ${discount > 0 ? `
        <tr style="border: none; height: 14px;">
          <td colspan="4" style="text-align: left; border: none; padding: 1px 0;">Discount</td>
          <td style="text-align: right; padding-right: 4px; border: none; padding-top: 1px; padding-bottom: 1px;">${formatPrice(discount)}</td>
        </tr>
        <tr style="border: none; height: 14px;">
          <td colspan="4" style="text-align: left; border: none; padding: 1px 0;">After Discount</td>
          <td style="text-align: right; padding-right: 4px; border: none; padding-top: 1px; padding-bottom: 1px;">${formatPrice(subtotal + customizationTotal - discount)}</td>
        </tr>` : ""}
        <tr style="border: none; height: 14px;">
          <td colspan="4" style="text-align: left; border: none; padding: 1px 0;">Tax (${order.pricing?.taxPercentage || 0}%)</td>
          <td style="text-align: right; padding-right: 4px; border: none; padding-top: 1px; padding-bottom: 1px;">${formatPrice(tax)}</td>
        </tr>
        ${delivery > 0 ? `
        <tr style="border: none; height: 14px;">
          <td colspan="4" style="text-align: left; border: none; padding: 1px 0;">Delivery Fee</td>
          <td style="text-align: right; padding-right: 4px; border: none; padding-top: 1px; padding-bottom: 1px;">${formatPrice(delivery)}</td>
        </tr>` : ""}
        <tr style="border: none; height: 14px;">
          <td style="text-align: left; border: none; padding: 1px 0;">Payment</td>
          <td colspan="4" style="text-align: right; padding-right: 4px; border: none; padding-top: 1px; padding-bottom: 1px;">${order.payment?.paymentMethod || "N/A"}</td>
        </tr>
        <tr style="border-top: 2px solid #000; border-bottom: 2px solid #000; font-weight: bold; height: 24px;">
          <td colspan="4" style="text-align: left; padding-left: 0;">TOTAL AMOUNT</td>
          <td style="text-align: right; padding-right: 4px;">${formatPrice(total)}</td>
        </tr>`;

  return `
    <div id="receipt-wrapper" style="
      width: 100%;
      max-width: 305px;
      margin: 0 auto;
      background: white;
      padding: 8px;
      box-sizing: border-box;
      font-family: 'Courier New', monospace;
      font-size: clamp(9px, 2vw, 10px);
      line-height: 1.3;
      color: black;
    ">
      <style>
        #receipt-wrapper table tr { border: none !important; border-top: none !important; border-bottom: none !important; }
        #receipt-wrapper table td { border: none !important; }
        #receipt-wrapper table th { border: none !important; }
        #receipt-wrapper .custom-row td { padding-top: 1px !important; padding-bottom: 1px !important; line-height: 1.1 !important; }
      </style>
      <div style="border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 8px 0; text-align: center; font-weight: bold; font-size: 1.2em; margin-bottom: 8px;">
        RECEIPT
      </div>

      <div style="margin-bottom: 12px; font-size: 0.95em;">
        <div>Order ID: #${order.orderNumber}</div>
        <div>Date: ${formattedDate} ${formattedTime}</div>
        <div>Shop: ${(order.businessName || "Business").substring(0, 32)}</div>
      </div>

      <div style="border-bottom: 1px solid #000; padding: 4px 0; margin: 4px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">
          <thead>
            <tr style="border-bottom: 1px solid #000; height: 24px; background-color: #f0f0f0;">
              <th style="text-align: left; padding: 0; background-color: #f0f0f0; font-weight: bold; font-size: 0.9em;">NAME</th>
              <th style="text-align: right; padding: 0 4px; width: 15%; background-color: #f0f0f0; font-weight: bold; font-size: 0.9em;">PRICE</th>
              <th style="text-align: center; padding: 0 4px; width: 12%; background-color: #f0f0f0; font-weight: bold; font-size: 0.9em;">QTY</th>
              <th style="text-align: right; padding: 0 4px; width: 15%; background-color: #f0f0f0; font-weight: bold; font-size: 0.9em;">DISC</th>
              <th style="text-align: right; padding-right: 4px; width: 18%; background-color: #f0f0f0; font-weight: bold; font-size: 0.9em;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 0.85em; border: none;">
        <tbody>
          ${summaryRows}
        </tbody>
      </table>

      <div style="text-align: center; font-size: 0.9em; line-height: 1.6; border-top: 2px solid #000; padding-top: 8px;">
        <div>Thank you for your order!</div>
        <div>Please visit again</div>
        <div>${formattedDate} ${formattedTime}</div>
      </div>
    </div>
  `;
}

/**
 * Receipt configuration
 */
export const RECEIPT_STYLES = {
  paperWidth: "80mm",
  width: "100%",
  maxWidth: 305,
  font: "Courier New, monospace",
  fontSize: "clamp(9px, 2vw, 10px)",
  padding: "8px",
};
