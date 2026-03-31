import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PromotionSizeSelectionState {
  // productId -> Set of selected sizeIds
  selectedSizes: Record<string, Set<string>>;
}

const initialState: PromotionSizeSelectionState = {
  selectedSizes: {},
};

export const promotionSizeSelectionSlice = createSlice({
  name: "promotionSizeSelection",
  initialState,
  reducers: {
    // Toggle a size for a product
    toggleSizeForProduct: (
      state,
      action: PayloadAction<{ productId: string; sizeId: string }>
    ) => {
      const { productId, sizeId } = action.payload;
      if (!state.selectedSizes[productId]) {
        state.selectedSizes[productId] = new Set();
      }
      if (state.selectedSizes[productId].has(sizeId)) {
        state.selectedSizes[productId].delete(sizeId);
      } else {
        state.selectedSizes[productId].add(sizeId);
      }
    },

    // Select all sizes for a product
    selectAllSizesForProduct: (
      state,
      action: PayloadAction<{ productId: string; sizeIds: string[] }>
    ) => {
      const { productId, sizeIds } = action.payload;
      state.selectedSizes[productId] = new Set(sizeIds);
    },

    // Clear all sizes for a product
    clearSizesForProduct: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      delete state.selectedSizes[productId];
    },

    // Clear all size selections
    clearAllSizeSelections: (state) => {
      state.selectedSizes = {};
    },
  },
});

export const {
  toggleSizeForProduct,
  selectAllSizesForProduct,
  clearSizesForProduct,
  clearAllSizeSelections,
} = promotionSizeSelectionSlice.actions;

export default promotionSizeSelectionSlice.reducer;
