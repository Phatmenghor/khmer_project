


import { PosPageCartItem } from "@/features/business/store/models/type/pos-page-type";


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


export function getQuantityForCombo(
  mapKey: string,
  sizeId: string,
  hasCustomizations: boolean,
  quantitiesMap: Map<string, number>
): number {
  const exactMatch = quantitiesMap.get(mapKey);

  const sizeOnlyMatch = !hasCustomizations ? quantitiesMap.get(sizeId) : undefined;
  return exactMatch ?? sizeOnlyMatch ?? 0;
}


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


export function calculateItemTotal(finalPrice: number, quantity: number): number {
  return Math.max(0, finalPrice * quantity);
}
