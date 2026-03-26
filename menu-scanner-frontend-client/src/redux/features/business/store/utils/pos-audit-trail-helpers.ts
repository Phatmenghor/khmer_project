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
 * Display item audit trail in a readable format
 * Returns a string showing before → after changes
 */
export const displayItemChanges = (item: PosPageCartItem): string => {
  if (!item.hadChangeFromPOS || !item.before || !item.after) {
    return "No changes";
  }

  const changes: string[] = [];

  // Check price change
  if (item.before.currentPrice !== item.after.currentPrice) {
    changes.push(
      `Price: $${item.before.currentPrice} → $${item.after.currentPrice}`
    );
  }

  // Check quantity change
  if (item.before.quantity !== item.after.quantity) {
    changes.push(
      `Quantity: ${item.before.quantity} → ${item.after.quantity}`
    );
  }

  // Check promotion change
  if (
    item.before.promotionType !== item.after.promotionType ||
    item.before.promotionValue !== item.after.promotionValue
  ) {
    const beforePromo = item.before.promotionType
      ? `${item.before.promotionValue}% ${item.before.promotionType}`
      : "None";
    const afterPromo = item.after.promotionType
      ? `${item.after.promotionValue}% ${item.after.promotionType}`
      : "None";
    changes.push(`Promotion: ${beforePromo} → ${afterPromo}`);
  }

  return changes.length > 0 ? changes.join(" | ") : "No changes";
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
