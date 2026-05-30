import { OrderResponse } from "@/features/main/store/models/response/order-response";

/**
 * Generate clean monospace receipt HTML from order data
 * Used for PDF download on admin orders pages and POS receipts
 * Simple text-based design suitable for thermal printers
 */
export function generateReceiptHTML(order: OrderResponse): string {
  // Format date and time
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

  // Extract pricing details
  const subtotal = order.pricing?.subtotal || 0;
  const discount = order.pricing?.discountAmount || 0;
  const tax = order.pricing?.taxAmount || 0;
  const delivery = order.pricing?.deliveryFee || 0;
  const customizationTotal = order.pricing?.customizationTotal || 0;
  const total = order.pricing?.finalTotal || 0;

  // Helper function to pad strings
  const padRight = (str: string, length: number) => str.padEnd(length, " ");
  const padLeft = (str: string, length: number) => str.padStart(length, " ");
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  // Generate items text
  const itemsText = order.items
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

      const displayName = sizeName ? `${productName} ${sizeName}` : productName;
      const line = `${padRight(displayName, 20)} ${padLeft(String(item.quantity), 3)} ${padLeft(promoLabel, 10)} ${padLeft(formatPrice(itemTotal), 10)}`;

      let customizationLines = "";
      if (item.customizations && item.customizations.length > 0) {
        customizationLines = item.customizations
          .map((c) => `  └─ ${padRight(c.name, 18)} ${padLeft(formatPrice(c.priceAdjustment || 0), 10)}`)
          .join("\n");
      }

      return [line, customizationLines].filter(Boolean).join("\n");
    })
    .join("\n");

  // Header line
  const headerLine = "════════════════════════════════════════════════════";
  const dividerLine = "────────────────────────────────────────────────────";

  // Return complete text receipt
  return `
    <pre style="font-family: monospace; font-size: 12px; line-height: 1.4; padding: 20px; white-space: pre-wrap; word-wrap: break-word; background: white; color: black;">
${headerLine}
                    RECEIPT
${headerLine}

Order #: ${order.orderNumber}
Date: ${formattedDate} • ${formattedTime}
Business: ${order.businessName || "Business"}
${order.customerName ? `Customer: ${order.customerName}` : ""}

${dividerLine}
ITEMS
${dividerLine}
${padRight("NAME", 20)} ${padLeft("QTY", 3)} ${padLeft("DISCOUNT", 10)} ${padLeft("TOTAL", 10)}
${dividerLine}
${itemsText}

${headerLine}
ORDER SUMMARY
${headerLine}

${padRight("Payment Method", 35)} ${order.payment?.paymentMethod || "N/A"}

${padRight("Subtotal w/ Add-ons", 35)} ${padLeft(formatPrice(subtotal + customizationTotal), 10)}
${discount > 0 ? `${padRight("Discount (Promotions)", 35)} ${padLeft(`-${formatPrice(discount)}`, 10)}\n${padRight("Subtotal After Discount", 35)} ${padLeft(formatPrice(subtotal + customizationTotal - discount), 10)}` : ""}

${tax > 0 ? `${padRight(`Tax (${order.pricing?.taxPercentage || 0}%)`, 35)} ${padLeft(`+${formatPrice(tax)}`, 10)}` : ""}
${delivery > 0 ? `${padRight("Delivery Fee", 35)} ${padLeft(`+${formatPrice(delivery)}`, 10)}` : ""}

${headerLine}
${padRight("TOTAL AMOUNT", 35)} ${padLeft(formatPrice(total), 10)}
${headerLine}

    Thank you for your order!
      Please visit again

${headerLine}
    </pre>
  `;
}

/**
 * Customize receipt template styling
 * Modify these values to change receipt appearance globally
 */
export const RECEIPT_STYLES = {
  // Monospace receipt configuration
  font: "monospace",
  fontSize: "12px",
  lineHeight: "1.4",
  backgroundColor: "white",
  textColor: "black",
};
