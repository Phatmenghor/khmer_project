/**
 * POS Audit Trail Helpers
 * Utilities for converting between cart state and before/after snapshots
 */

import {
  ItemPricingSnapshot,
  PosPageCartItem,
  OrderPricingSnapshot,
  OrderPricingWithAuditTrail,
} from "../models/type/pos-page-type";

/**
 * Create an item pricing snapshot from current item state
 */
export const createItemSnapshot = (item: PosPageCartItem): ItemPricingSnapshot => {
  // Use the 'after' snapshot if available (for API responses)
  // Otherwise create from current item state
  if (item.after) {
    return { ...item.after };
  }

  // Fallback: create from individual fields
  return {
    currentPrice: item.before?.currentPrice || 0,
    finalPrice: item.before?.finalPrice || 0,
    hasActivePromotion: item.before?.hasActivePromotion || false,
    quantity: item.before?.quantity || 0,
    totalBeforeDiscount: item.before?.totalBeforeDiscount || 0,
    discountAmount: item.before?.discountAmount || 0,
    totalPrice: item.before?.totalPrice || 0,
    promotionType: item.before?.promotionType || null,
    promotionValue: item.before?.promotionValue || null,
    promotionFromDate: item.before?.promotionFromDate || null,
    promotionToDate: item.before?.promotionToDate || null,
  };
};

/**
 * Check if an item has changes (admin override or promotion modification)
 */
export const itemHasChanges = (item: PosPageCartItem): boolean => {
  if (!item.before || !item.after) return false;

  return (
    item.before.currentPrice !== item.after.currentPrice ||
    item.before.finalPrice !== item.after.finalPrice ||
    item.before.quantity !== item.after.quantity ||
    item.before.hasActivePromotion !== item.after.hasActivePromotion ||
    item.before.promotionType !== item.after.promotionType ||
    item.before.promotionValue !== item.after.promotionValue
  );
};

/**
 * Create an order pricing snapshot
 */
export const createOrderPricingSnapshot = (
  totalItems: number,
  subtotalBeforeDiscount: number,
  subtotal: number,
  totalDiscount: number,
  deliveryFee: number,
  taxAmount: number,
  finalTotal: number
): OrderPricingSnapshot => {
  return {
    totalItems,
    subtotalBeforeDiscount,
    subtotal,
    totalDiscount,
    deliveryFee,
    taxAmount,
    finalTotal,
  };
};

/**
 * Display item audit trail in a readable format with detailed metadata
 */
export const displayItemChanges = (item: PosPageCartItem): string => {
  if (!item.hadChangeFromPOS) {
    return "No changes";
  }

  if (!item.auditMetadata) {
    return "Changes detected but no details available";
  }

  const meta = item.auditMetadata;
  const parts: string[] = [];

  // Change type
  parts.push(`${meta.changeType}`);

  // Discount details (if applicable)
  if (meta.discountType && meta.discountValue !== undefined) {
    const discountStr =
      meta.discountType === "PERCENTAGE"
        ? `${meta.discountValue}%`
        : `$${meta.discountValue.toFixed(2)}`;
    parts.push(`Discount: ${discountStr}`);
  }

  // Price change
  parts.push(
    `$${meta.originalPrice.toFixed(2)} → $${meta.updatedPrice.toFixed(2)}`
  );

  // Reason
  parts.push(`Reason: ${meta.reason}`);

  return parts.join(" | ");
};

/**
 * Get detailed item audit metadata for display
 */
export const getItemAuditDetails = (
  item: PosPageCartItem
): {
  changeType: string;
  discountType: string | null;
  discountValue: number | null;
  originalPrice: number;
  updatedPrice: number;
  amountSaved: number;
  reason: string;
} | null => {
  if (!item.hadChangeFromPOS || !item.auditMetadata) {
    return null;
  }

  const meta = item.auditMetadata;
  const amountSaved = meta.originalPrice - meta.updatedPrice;

  return {
    changeType: meta.changeType,
    discountType: meta.discountType || null,
    discountValue: meta.discountValue || null,
    originalPrice: meta.originalPrice,
    updatedPrice: meta.updatedPrice,
    amountSaved: Math.max(0, amountSaved),
    reason: meta.reason,
  };
};

/**
 * Display order total audit trail in a readable format
 */
export const displayOrderPricingChanges = (
  pricing: OrderPricingWithAuditTrail
): string => {
  if (!pricing.hadOrderLevelChangeFromPOS) {
    return "No order-level changes";
  }

  const before = pricing.before.finalTotal;
  const after = pricing.after.finalTotal;
  const discount = before - after;

  return `Before: $${before.toFixed(2)} → After: $${after.toFixed(
    2
  )} (Saved: $${discount.toFixed(2)}) | Reason: ${
    pricing.orderLevelChangeReason || "N/A"
  }`;
};

/**
 * Calculate total savings from all changes (items + order-level)
 */
export const calculateTotalSavings = (
  items: PosPageCartItem[],
  pricing: OrderPricingWithAuditTrail | null
): number => {
  let totalSavings = 0;

  // Item-level savings
  items.forEach((item) => {
    if (item.hadChangeFromPOS && item.before && item.after) {
      const itemSavings =
        item.before.totalPrice - item.after.totalPrice;
      totalSavings += Math.max(0, itemSavings);
    }
  });

  // Order-level savings
  if (pricing && pricing.hadOrderLevelChangeFromPOS) {
    const orderSavings =
      pricing.before.finalTotal - pricing.after.finalTotal;
    totalSavings += Math.max(0, orderSavings);
  }

  return totalSavings;
};
