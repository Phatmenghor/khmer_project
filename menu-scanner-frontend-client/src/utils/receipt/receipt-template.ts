import { OrderResponse } from "@/features/main/store/models/response/order-response";

/**
 * Generate responsive receipt for 80mm thermal printer
 * With padding, responsive font, and flexible layout
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

  const padRight = (str: string, len: number) => str.padEnd(len, " ");
  const padLeft = (str: string, len: number) => str.padStart(len, " ");
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  // Create aligned line with label on left and value on right
  const alignLine = (label: string, value: string) => {
    const totalWidth = 44;
    const valueWidth = value.length;
    const dotCount = totalWidth - label.length - valueWidth;
    const dots = ".".repeat(Math.max(1, dotCount));
    return `${label}${dots}${value}`;
  };

  // Generate items
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
        ? `${productName} ${sizeName}`.substring(0, 18)
        : productName.substring(0, 18);

      let itemHTML = `${padRight(displayName, 18)} ${padLeft(String(item.quantity), 2)} ${padLeft(promoLabel, 7)} ${padLeft(formatPrice(itemTotal), 9)}`;

      if (item.customizations && item.customizations.length > 0) {
        itemHTML += "\n" + item.customizations
          .map((c) => {
            const customName = c.name.substring(0, 16);
            return `  ${padRight(customName, 16)} ${padLeft(formatPrice(c.priceAdjustment || 0), 9)}`;
          })
          .join("\n");
      }

      return itemHTML;
    })
    .join("\n");

  return `
    <div id="receipt-wrapper" style="
      width: 100%;
      max-width: 305px;
      margin: 0 auto;
      background: white;
      padding: 0;
    ">
      <pre style="
        font-family: 'Courier New', monospace;
        font-size: clamp(9px, 2vw, 10px);
        line-height: 1.2;
        width: 100%;
        margin: 0;
        padding: 8px;
        box-sizing: border-box;
        background: white;
        color: black;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
      ">══════════════════════════════════════════
RECEIPT
══════════════════════════════════════════
Order #: ${order.orderNumber}
Date: ${formattedDate} ${formattedTime}
Biz: ${(order.businessName || "Business").substring(0, 32)}
${order.customerName ? `Cust: ${order.customerName.substring(0, 32)}` : ""}
──────────────────────────────────────────
ITEMS
──────────────────────────────────────────
${padRight("NAME", 18)} ${padLeft("QTY", 2)} ${padLeft("DISC", 7)} ${padLeft("TOTAL", 9)}
──────────────────────────────────────────
${itemsHTML}
──────────────────────────────────────────
Payment: ${order.payment?.paymentMethod || "N/A"}
${alignLine("Subtotal", formatPrice(subtotal + customizationTotal))}${discount > 0 ? `\n${alignLine("Discount", `-${formatPrice(discount)}`)}\n${alignLine("After Discount", formatPrice(subtotal + customizationTotal - discount))}` : ""}
${alignLine(`Tax (${order.pricing?.taxPercentage || 0}%)`, `+${formatPrice(tax)}`)}${delivery > 0 ? `\n${alignLine("Delivery Fee", `+${formatPrice(delivery)}`)}` : ""}
══════════════════════════════════════════
${padRight("TOTAL AMOUNT", 35)} ${padLeft(formatPrice(total), 9)}
══════════════════════════════════════════
Thank you for your order!
Please visit again
${formattedDate} ${formattedTime}</pre>
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
