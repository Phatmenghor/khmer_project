import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BulkPromotionState {
  selectedProductIds: string[]; // List of selected product IDs
}

const initialState: BulkPromotionState = {
  selectedProductIds: [],
};

export const bulkPromotionSlice = createSlice({
  name: "bulkPromotion",
  initialState,
  reducers: {
    // Set all selected products (used when loading from localStorage)
    setSelectedProducts: (state, action: PayloadAction<string[]>) => {
      state.selectedProductIds = action.payload;
    },

    // Add a product to selection
    addSelectedProduct: (state, action: PayloadAction<string>) => {
      if (!state.selectedProductIds.includes(action.payload)) {
        state.selectedProductIds.push(action.payload);
      }
    },

    // Remove a product from selection
    removeSelectedProduct: (state, action: PayloadAction<string>) => {
      state.selectedProductIds = state.selectedProductIds.filter(
        (id) => id !== action.payload
      );
    },

    // Clear all selections
    clearSelectedProducts: (state) => {
      state.selectedProductIds = [];
    },

    // Toggle product selection
    toggleSelectedProduct: (state, action: PayloadAction<string>) => {
      const index = state.selectedProductIds.indexOf(action.payload);
      if (index > -1) {
        state.selectedProductIds.splice(index, 1);
      } else {
        state.selectedProductIds.push(action.payload);
      }
    },

    // Add multiple products
    addMultipleSelectedProducts: (state, action: PayloadAction<string[]>) => {
      const newIds = action.payload.filter(
        (id) => !state.selectedProductIds.includes(id)
      );
      state.selectedProductIds.push(...newIds);
    },

    // Remove multiple products
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
