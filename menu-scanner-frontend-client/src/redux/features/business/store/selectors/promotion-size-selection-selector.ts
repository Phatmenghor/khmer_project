import { RootState } from "@/redux/store";

export const selectPromotionSizeSelections = (state: RootState) => {
  return state.promotionSizeSelection.selectedSizes;
};

export const selectSizesForProduct = (productId: string) => (
  state: RootState
) => {
  const sizes = state.promotionSizeSelection.selectedSizes[productId];
  return sizes ? Array.from(sizes) : [];
};

export const selectSelectedSizeCount = (productId: string) => (
  state: RootState
) => {
  const sizes = state.promotionSizeSelection.selectedSizes[productId];
  return sizes ? sizes.size : 0;
};

export const selectIsSizeSelected = (productId: string, sizeId: string) => (
  state: RootState
) => {
  const sizes = state.promotionSizeSelection.selectedSizes[productId];
  return sizes ? sizes.has(sizeId) : false;
};
