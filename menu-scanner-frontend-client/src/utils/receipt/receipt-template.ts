import { OrderResponse } from "@/features/main/store/models/response/order-response";

/**
 * Generate professional receipt HTML from order data
 * Used for PDF download on admin orders pages
 * Easy to customize - modify this template for consistent styling across app
 */
export function generateReceiptHTML(order: OrderResponse): string {
  // Format date and time
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

  // Extract pricing details
  const subtotal = order.pricing?.subtotal || 0;
  const discount = order.pricing?.discountAmount || 0;
  const tax = order.pricing?.taxAmount || 0;
  const delivery = order.pricing?.deliveryFee || 0;
  const customizationTotal = order.pricing?.customizationTotal || 0;
  const total = order.pricing?.finalTotal || 0;

  // Generate items HTML
  const itemsHTML = order.items
    .map((item, idx) => {
      const itemTotal = (item.finalPrice || 0) * item.quantity;
      const productName = item.product?.name || item.productName || "Product";
      const sizeName = item.product?.sizeName || item.sizeName || null;
      const hasPromo = item.hasPromotion && item.promotionType;
      const promoLabel = hasPromo
        ? item.promotionType === "PERCENTAGE"
          ? `${item.promotionValue}% OFF`
          : `$${item.promotionValue} OFF`
        : null;

      return `
        <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #ccc;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="flex: 1; font-weight: bold;">${idx + 1}. ${productName}${sizeName ? " (Size: " + sizeName + ")" : ""}</span>
            <span style="width: 40px; text-align: center;">${item.quantity}</span>
            <span style="width: 50px; text-align: right;">$${item.finalPrice?.toFixed(2) || "0.00"}</span>
            <span style="width: 60px; text-align: right; font-weight: bold;">$${itemTotal.toFixed(2)}</span>
          </div>
          ${promoLabel ? `<div style="color: #27ae60; font-weight: bold; font-size: 10px; margin-left: 8px;">✓ PROMOTION: ${promoLabel}</div>` : ""}
          ${
            item.customizations && item.customizations.length > 0
              ? `
              <div style="margin-left: 16px; font-size: 10px; color: #666;">
                ${item.customizations
                  .map(
                    (c) =>
                      `<div>• ${c.name}: +$${c.priceAdjustment?.toFixed(2) || "0.00"}</div>`
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

  // Generate promotions summary
  const promotionalItems = order.items.filter(
    (i) => i.hasPromotion && i.promotionType
  );
  const promoSummary =
    promotionalItems.length > 0
      ? `
    <div style="background: #f0fdf4; border-left: 3px solid #22c55e; padding: 8px; margin: 8px 0; font-size: 11px;">
      <div style="font-weight: bold; color: #16a34a; margin-bottom: 6px;">🎉 PROMOTIONS APPLIED</div>
      ${promotionalItems
        .map((item) => {
          const prodName = item.product?.name || item.productName || "Product";
          const promoText =
            item.promotionType === "PERCENTAGE"
              ? `-${item.promotionValue}%`
              : `-$${item.promotionValue}`;
          return `<div style="display: flex; justify-content: space-between; color: #16a34a;"><span>${prodName}</span><span style="font-weight: bold;">${promoText}</span></div>`;
        })
        .join("")}
    </div>
  `
      : "";

  // Return complete HTML template
  return `
    <div style="width: 100%; max-width: 900px; background: white; font-family: monospace; font-size: 12px;">
      <!-- Header -->
      <div style="text-align: center; border-bottom: 3px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
        <div style="font-weight: bold; font-size: 16px; letter-spacing: 2px;">RECEIPT</div>
        <div style="font-size: 10px; color: #666; margin-top: 4px;">Professional Receipt Document</div>
      </div>

      <!-- Order Info -->
      <div style="text-align: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #666;">
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${order.businessName || "Business"}</div>
        <div style="font-size: 11px;">Order #: <strong>${order.orderNumber}</strong></div>
        <div style="font-size: 11px;">Date: ${formattedDate} • ${formattedTime}</div>
        ${order.customerName ? `<div style="font-size: 11px;">Customer: ${order.customerName}</div>` : ""}
      </div>

      <!-- Items Section -->
      <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #666;">
        <div style="text-align: center; font-weight: bold; margin-bottom: 8px;">ITEMS (${order.items.length})</div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11px; margin-bottom: 4px; padding-bottom: 4px; border-bottom: 2px solid #000;">
          <span style="flex: 1;">DESCRIPTION</span>
          <span style="width: 40px; text-align: center;">QTY</span>
          <span style="width: 50px; text-align: right;">PRICE</span>
          <span style="width: 60px; text-align: right;">TOTAL</span>
        </div>
        ${itemsHTML}
      </div>

      <!-- Promotions -->
      ${promoSummary}

      <!-- Pricing Summary -->
      <div style="margin-bottom: 12px; padding: 8px; background: #f9f9f9; border: 1px solid #ddd;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Subtotal</span>
          <span style="font-weight: bold;">$${subtotal.toFixed(2)}</span>
        </div>
        ${
          customizationTotal > 0
            ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Add-ons</span>
            <span style="font-weight: bold;">+$${customizationTotal.toFixed(2)}</span>
          </div>
        `
            : ""
        }
        ${
          discount > 0
            ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px; background: #ffe0e0; padding: 4px;">
            <span style="color: #d32f2f; font-weight: bold;">Discount</span>
            <span style="color: #d32f2f; font-weight: bold;">-$${discount.toFixed(2)}</span>
          </div>
        `
            : ""
        }
        ${
          tax > 0
            ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Tax</span>
            <span style="font-weight: bold;">+$${tax.toFixed(2)}</span>
          </div>
        `
            : ""
        }
        ${
          delivery > 0
            ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Delivery Fee</span>
            <span style="font-weight: bold;">+$${delivery.toFixed(2)}</span>
          </div>
        `
            : ""
        }
      </div>

      <!-- Total -->
      <div style="background: #000; color: white; padding: 12px; text-align: center; margin-bottom: 12px; font-weight: bold;">
        <div style="font-size: 11px; margin-bottom: 4px;">FINAL AMOUNT DUE</div>
        <div style="font-size: 18px;">TOTAL: $${total.toFixed(2)}</div>
      </div>

      <!-- Payment -->
      <div style="margin-bottom: 12px; padding: 8px; border: 1px solid #666;">
        <div style="font-weight: bold;">Payment Method: ${order.payment?.paymentMethod || "N/A"}</div>
        <div style="font-size: 11px;">Status: ${order.payment?.paymentStatus || "N/A"}</div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 8px; border-top: 3px solid #000;">
        <div style="font-weight: bold; margin-bottom: 4px;">✓ Thank You For Your Order!</div>
        <div style="font-size: 10px; color: #666;">Please keep this receipt for your records</div>
        <div style="font-size: 9px; color: #999; margin-top: 4px;">Generated: ${formattedDate} at ${formattedTime}</div>
      </div>
    </div>
  `;
}

/**
 * Customize receipt template styling
 * Modify these values to change receipt appearance globally
 */
export const RECEIPT_STYLES = {
  // Colors
  colors: {
    primary: "#000",
    promotion: "#27ae60",
    discount: "#d32f2f",
    background: "#f9f9f9",
    border: "#ccc",
    text: "#333",
  },

  // Fonts
  fonts: {
    family: "monospace",
    sizeBase: "12px",
    sizeLarge: "16px",
    sizeSmall: "10px",
  },

  // Spacing
  spacing: {
    margin: "12px",
    padding: "8px",
    borderWidth: "3px",
  },

  // Borders
  borders: {
    header: "3px solid #000",
    section: "1px solid #666",
    item: "1px solid #ccc",
  },
};
