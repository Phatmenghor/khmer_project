import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PromotionSizeSelectionState {

  selectedSizes: Record<string, string[]>;
}

const initialState: PromotionSizeSelectionState = {
  selectedSizes: {},
};

export const promotionSizeSelectionSlice = createSlice({
  name: "promotionSizeSelection",
  initialState,
  reducers: {

    toggleSizeForProduct: (
      state,
      action: PayloadAction<{ productId: string; sizeId: string }>
    ) => {
      const { productId, sizeId } = action.payload;
      if (!state.selectedSizes[productId]) {
        state.selectedSizes[productId] = [];
      }
      const index = state.selectedSizes[productId].indexOf(sizeId);
      if (index > -1) {
        state.selectedSizes[productId].splice(index, 1);
      } else {
        state.selectedSizes[productId].push(sizeId);
      }
    },


    selectAllSizesForProduct: (
      state,
      action: PayloadAction<{ productId: string; sizeIds: string[] }>
    ) => {
      const { productId, sizeIds } = action.payload;
      state.selectedSizes[productId] = [...sizeIds];
    },


    clearSizesForProduct: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      delete state.selectedSizes[productId];
    },


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
