import { OrderResponse } from "@/features/main/store/models/response/order-response";

/**
 * Generate clean monospace receipt HTML optimized for 80mm thermal printer
 * Used for PDF download on admin orders pages and POS receipts
 * Standard thermal printer format with proper line wrapping
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

  // 80mm thermal printer width = ~42 characters in monospace
  const LINE_WIDTH = 42;

  // Helper functions for 80mm thermal format
  const padRight = (str: string, length: number) => str.padEnd(length, " ");
  const padLeft = (str: string, length: number) => str.padStart(length, " ");
  const centerText = (str: string, width: number) => {
    const padding = Math.floor((width - str.length) / 2);
    return " ".repeat(padding) + str;
  };
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const dividerLine = "─".repeat(LINE_WIDTH);
  const headerLine = "═".repeat(LINE_WIDTH);

  // Generate items text for thermal printer
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

      // Format item name to fit 80mm (accounting for qty and price columns)
      const maxNameLength = 18;
      const displayName = sizeName
        ? `${productName} ${sizeName}`.substring(0, maxNameLength)
        : productName.substring(0, maxNameLength);

      const qtyStr = String(item.quantity);
      const totalStr = formatPrice(itemTotal);

      const line = `${padRight(displayName, maxNameLength)} ${padLeft(qtyStr, 2)} ${padLeft(promoLabel, 8)} ${padLeft(totalStr, 9)}`;

      let customizationLines = "";
      if (item.customizations && item.customizations.length > 0) {
        customizationLines = item.customizations
          .map((c) => {
            const customName = c.name.substring(0, 20);
            return `  └─ ${padRight(customName, 20)} ${padLeft(formatPrice(c.priceAdjustment || 0), 9)}`;
          })
          .join("\n");
      }

      return [line, customizationLines].filter(Boolean).join("\n");
    })
    .join("\n");

  // Summary line helper
  const summaryLine = (label: string, value: string) => {
    const labelPart = padRight(label, LINE_WIDTH - value.length);
    return labelPart + value;
  };

  // Return complete text receipt optimized for 80mm
  return `
    <pre style="font-family: monospace; font-size: 11px; line-height: 1.3; padding: 0; white-space: pre-wrap; word-wrap: break-word; background: white; color: black; max-width: 300px;">
${centerText("RECEIPT", LINE_WIDTH)}
${headerLine}

Order #: ${order.orderNumber}
Date: ${formattedDate} ${formattedTime}
${padRight("Business:", 10)} ${(order.businessName || "Business").substring(0, 30)}
${order.customerName ? `${padRight("Customer:", 10)} ${order.customerName.substring(0, 30)}` : ""}

${dividerLine}
ITEMS
${dividerLine}
${padRight("NAME", 18)} ${padLeft("QTY", 2)} ${padLeft("DISC", 8)} ${padLeft("TOTAL", 9)}
${dividerLine}
${itemsText}

${headerLine}
ORDER SUMMARY
${headerLine}

Payment: ${order.payment?.paymentMethod || "N/A"}

${summaryLine("Subtotal w/ Add-ons", padLeft(formatPrice(subtotal + customizationTotal), 9))}
${discount > 0 ? `${summaryLine("Discount (Promotions)", padLeft(`-${formatPrice(discount)}`, 9))}` : ""}
${discount > 0 ? `${summaryLine("Subtotal After Discount", padLeft(formatPrice(subtotal + customizationTotal - discount), 9))}` : ""}
${tax > 0 ? `${summaryLine(`Tax (${order.pricing?.taxPercentage || 0}%)`, padLeft(`+${formatPrice(tax)}`, 9))}` : ""}
${delivery > 0 ? `${summaryLine("Delivery Fee", padLeft(`+${formatPrice(delivery)}`, 9))}` : ""}

${headerLine}
${summaryLine("TOTAL AMOUNT", padLeft(formatPrice(total), 9))}
${headerLine}

${centerText("Thank you for your order!", LINE_WIDTH)}
${centerText("Please visit again", LINE_WIDTH)}

${headerLine}
    </pre>
  `;
}

/**
 * Receipt configuration for 80mm thermal printer
 * Optimize line width and formatting for thermal output
 */
export const RECEIPT_STYLES = {
  // Thermal printer settings
  paperWidth: "80mm",
  characterWidth: 42,
  font: "monospace",
  fontSize: "11px",
  lineHeight: "1.3",
  backgroundColor: "white",
  textColor: "black",
};
