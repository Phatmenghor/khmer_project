/**
 * Product Stock Management - Redux Slice
 * Manages Product Stock state: data, loading, errors, filters, operations
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductManagementState } from "../models/type/product-type";
import { fetchAllProductStockAdminService } from "../thunks/stock-thunks";
import { ProductStatus } from "@/constants/status/status";

/**
 * Initial state
 */
const initialState: ProductManagementState = {
  data: null,
  selectedProduct: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    pageNo: 1,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isFetchingDetail: false,
    isResettingPromotion: false,
    isResettingAll: false,
    isResettingBulk: false,
  },
};

/**
 * Stock slice
 */
const stockSlice = createSlice({
  name: "stocks",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },

    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },

    selectProductStatus: (state, action: PayloadAction<ProductStatus>) => {
      state.filters.status = action.payload;
      state.filters.pageNo = 1;
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    resetState: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProductStockAdminService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProductStockAdminService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllProductStockAdminService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });
  },
});

export const {
  setSearchFilter,
  selectProductStatus,
  setPageNo,
  clearError,
  clearSelectedProduct,
  resetFilters,
  resetState,
} = stockSlice.actions;

export default stockSlice.reducer;
