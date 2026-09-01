import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BulkPromotionState {
  selectedProductIds: string[];
}

const initialState: BulkPromotionState = {
  selectedProductIds: [],
};

export const bulkPromotionSlice = createSlice({
  name: "bulkPromotion",
  initialState,
  reducers: {

    setSelectedProducts: (state, action: PayloadAction<string[]>) => {
      state.selectedProductIds = action.payload;
    },


    addSelectedProduct: (state, action: PayloadAction<string>) => {
      if (!state.selectedProductIds.includes(action.payload)) {
        state.selectedProductIds.push(action.payload);
      }
    },


    removeSelectedProduct: (state, action: PayloadAction<string>) => {
      state.selectedProductIds = state.selectedProductIds.filter(
        (id) => id !== action.payload
      );
    },


    clearSelectedProducts: (state) => {
      state.selectedProductIds = [];
    },


    toggleSelectedProduct: (state, action: PayloadAction<string>) => {
      const index = state.selectedProductIds.indexOf(action.payload);
      if (index > -1) {
        state.selectedProductIds.splice(index, 1);
      } else {
        state.selectedProductIds.push(action.payload);
      }
    },


    addMultipleSelectedProducts: (state, action: PayloadAction<string[]>) => {
      const newIds = action.payload.filter(
        (id) => !state.selectedProductIds.includes(id)
      );
      state.selectedProductIds.push(...newIds);
    },


    removeMultipleSelectedProducts: (state, action: PayloadAction<string[]>) => {
      const idsToRemove = new Set(action.payload);
      state.selectedProductIds = state.selectedProductIds.filter(
        (id) => !idsToRemove.has(id)
      );
    },
  },
});

export const {
  setSelectedProducts,
  addSelectedProduct,
  removeSelectedProduct,
  clearSelectedProducts,
  toggleSelectedProduct,
  addMultipleSelectedProducts,
  removeMultipleSelectedProducts,
} = bulkPromotionSlice.actions;

export default bulkPromotionSlice.reducer;
