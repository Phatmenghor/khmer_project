/**
 * Customization and quantity utilities for cart and modal operations
 */

import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";

/**
 * Build a consistent map key from size ID and customization IDs
 * This is used for quantity lookups where the key must match across cart and modal
 */
export function buildCustomizationMapKey(
  sizeId: string | null,
  customizationIds?: string[] | Set<string>
): string {
  const customArray = customizationIds
    ? Array.from(customizationIds).sort()
    : [];
  const customKey = customArray.length > 0
    ? `-${customArray.join("-")}`
    : "";
  return `${sizeId || "__no_size__"}${customKey}`;
}

/**
 * Build a quantity map from cart items for a specific product
 * Returns Map<mapKey, quantity> where mapKey is sizeId + customizations
 */
export function buildQuantityMap(
  cartItems: PosPageCartItem[],
  productId: string
): Map<string, number> {
  const quantityMap = new Map<string, number>();
  cartItems
    .filter((item) => item.productId === productId)
    .forEach((item) => {
      const sizeId = item.productSizeId || "__no_size__";
      const customIds = item.customizations?.map(c => c.productCustomizationId);
      const mapKey = buildCustomizationMapKey(sizeId, customIds);
      quantityMap.set(mapKey, item.quantity);
    });
  return quantityMap;
}

/**
 * Lookup quantity for a size+customization combo
 * Only falls back to size-only match if NO customizations are selected
 */
export function getQuantityForCombo(
  mapKey: string,
  sizeId: string,
  hasCustomizations: boolean,
  quantitiesMap: Map<string, number>
): number {
  const exactMatch = quantitiesMap.get(mapKey);
  // Only use size-only fallback if there are no customizations
  const sizeOnlyMatch = !hasCustomizations ? quantitiesMap.get(sizeId) : undefined;
  return exactMatch ?? sizeOnlyMatch ?? 0;
}

/**
 * Apply an order-level discount to a total
 */
export function applyDiscount(
  baseTotal: number,
  discount: { type: "fixed" | "percentage"; value: number } | null
): number {
  if (!discount) return baseTotal;
  if (discount.type === "fixed") {
    return Math.max(0, baseTotal - discount.value);
  } else {
    return baseTotal * (1 - (discount.value / 100));
  }
}

/**
 * Calculate total price for an item
 */
export function calculateItemTotal(finalPrice: number, quantity: number): number {
  return Math.max(0, finalPrice * quantity);
}
