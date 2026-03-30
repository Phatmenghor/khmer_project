import { RootState } from "@/redux/store";

// Select all bulk promotion state
export const selectBulkPromotionState = (state: RootState) =>
  state.bulkPromotion;

// Select selected product IDs
export const selectSelectedProductIds = (state: RootState) =>
  state.bulkPromotion.selectedProductIds;

// Select selected product IDs as a Map for easy lookups (for backwards compatibility)
export const selectSelectedProductIdsMap = (state: RootState): Map<string, boolean> => {
  const ids = state.bulkPromotion.selectedProductIds;
  return new Map(ids.map((id) => [id, true]));
};

// Select selected product count
export const selectSelectedProductCount = (state: RootState) =>
  state.bulkPromotion.selectedProductIds.length;

// Select if a specific product is selected
export const selectIsProductSelected = (productId: string) => (state: RootState) =>
  state.bulkPromotion.selectedProductIds.includes(productId);
