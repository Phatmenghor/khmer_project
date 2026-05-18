


import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductManagementState } from "../models/type/product-type";
import { fetchAllProductStockAdminService, updateStockStatusService } from "../thunks/stock-thunks";
import { ProductStatus } from "@/constants/status/status";


const initialState: ProductManagementState = {
  data: null,
  selectedProduct: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    pageNo: 1,
    status: ProductStatus.ALL,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isUpdatingStatus: false,
    isDeleting: false,
    isFetchingDetail: false,
    isResettingPromotion: false,
    isResettingAll: false,
    isResettingBulk: false,
  },
};


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
      state.filters = {
        search: "",
        pageNo: 1,
        status: ProductStatus.ALL,
      };
    },

    resetState: () => {
      return initialState;
    },


    updateStockStatusOptimistic: (state, action: PayloadAction<{ productId: string; newStatus: "ENABLED" | "DISABLED" }>) => {
      if (state.data?.content) {
        const product = state.data.content.find((p: any) => p.id === action.payload.productId);
        if (product) {
          product.stockStatus = action.payload.newStatus;
        }
      }
    },


    revertStockStatusOptimistic: (state, action: PayloadAction<{ productId: string; previousStatus: "ENABLED" | "DISABLED" }>) => {
      if (state.data?.content) {
        const product = state.data.content.find((p: any) => p.id === action.payload.productId);
        if (product) {
          product.stockStatus = action.payload.previousStatus;
        }
      }
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
      })

      .addCase(updateStockStatusService.pending, (state) => {
        state.operations.isUpdatingStatus = true;
        state.error = null;
      })
      .addCase(updateStockStatusService.fulfilled, (state, action) => {
        state.operations.isUpdatingStatus = false;

        if (state.data?.content) {
          const updatedProduct = action.payload;
          const index = state.data.content.findIndex((p: any) => p.id === updatedProduct.id);
          if (index !== -1) {
            state.data.content[index] = updatedProduct;
          }
        }
      })
      .addCase(updateStockStatusService.rejected, (state, action) => {
        state.operations.isUpdatingStatus = false;
        state.error = action.payload as string;
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
  updateStockStatusOptimistic,
  revertStockStatusOptimistic,
} = stockSlice.actions;

export default stockSlice.reducer;
