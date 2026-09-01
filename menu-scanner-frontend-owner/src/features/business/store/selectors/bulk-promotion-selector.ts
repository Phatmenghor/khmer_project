import { RootState } from "@/store";


export const selectBulkPromotionState = (state: RootState) =>
  state.bulkPromotion;


export const selectSelectedProductIds = (state: RootState) =>
  state.bulkPromotion.selectedProductIds;


export const selectSelectedProductIdsMap = (state: RootState): Map<string, boolean> => {
  const ids = state.bulkPromotion.selectedProductIds;
  return new Map(ids.map((id) => [id, true]));
};


export const selectSelectedProductCount = (state: RootState) =>
  state.bulkPromotion.selectedProductIds.length;


export const selectIsProductSelected = (productId: string) => (state: RootState) =>
  state.bulkPromotion.selectedProductIds.includes(productId);
