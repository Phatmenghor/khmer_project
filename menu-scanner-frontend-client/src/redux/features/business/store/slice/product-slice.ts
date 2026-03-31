/**
 * Product Management - Redux Slice
 * Manages Product state: data, loading, errors, filters, operations
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductManagementState } from "../models/type/product-type";
import {
  createProductService,
  deleteProductService,
  fetchAllProductAdminService,
  fetchAllProductService,
  fetchProductByIdService,
  updateProductService,
} from "../thunks/product-thunks";
import { ProductStatus } from "@/constants/status/status";
import { selectCategories } from "@/redux/features/master-data/store/selectors/categories-selector";

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
  },
};

/**
 * Product slice
 */
const productSlice = createSlice({
  name: "products",
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

    // Bulk selection actions
    toggleProductSelection: (state, action: PayloadAction<string>) => {
      // Toggle isSelected field for a specific product
      if (state.data) {
        state.data.content = state.data.content.map((product) =>
          product.id === action.payload
            ? { ...product, isSelected: !product.isSelected }
            : product
        );
      }
    },

    selectAllProducts: (state) => {
      // Select all products on current page
      if (state.data) {
        state.data.content = state.data.content.map((product) => ({
          ...product,
          isSelected: true,
        }));
      }
    },

    deselectAllProducts: (state) => {
      // Deselect all products on current page
      if (state.data) {
        state.data.content = state.data.content.map((product) => ({
          ...product,
          isSelected: false,
        }));
      }
    },

    clearProductSelections: (state) => {
      // Clear all selections across all pages
      if (state.data) {
        state.data.content = state.data.content.map((product) => ({
          ...product,
          isSelected: false,
        }));
      }
    },

    updateProductOptimistic: (state, action: PayloadAction<any>) => {
      // Update product in the list optimistically
      if (state.data) {
        state.data.content = state.data.content.map((product) =>
          product.id === action.payload.id ? { ...product, ...action.payload } : product
        );
      }
    },

    resetProductPromotionOptimistic: (state, action: PayloadAction<string>) => {
      // Reset promotion fields for a product and all sizes optimistically
      if (state.data) {
        state.data.content = state.data.content.map((product) => {
          if (product.id === action.payload) {
            // Reset product-level promotion
            const updated = {
              ...product,
              hasPromotion: false,
              displayPromotionType: null,
              displayPromotionValue: null,
              displayPrice: product.price,
              displayOriginPrice: product.price,
            };

            // Reset all size promotions and recalculate display prices
            if (updated.sizes && updated.sizes.length > 0) {
              updated.sizes = updated.sizes.map((size: any) => ({
                ...size,
                promotionType: null,
                promotionValue: null,
                promotionFromDate: null,
                promotionToDate: null,
                finalPrice: size.price,
                hasPromotion: false,
              }));
            }

            return updated;
          }
          return product;
        });
      }
    },

    resetAllPromotionsOptimistic: (state) => {
      // Reset ALL promotions optimistically
      if (state.data) {
        state.data.content = state.data.content.map((product) => {
          const updated = {
            ...product,
            hasPromotion: false,
            displayPromotionType: null,
            displayPromotionValue: null,
            displayPrice: product.price,
            displayOriginPrice: product.price,
          };

          // Reset all size promotions
          if (updated.sizes && updated.sizes.length > 0) {
            updated.sizes = updated.sizes.map((size: any) => ({
              ...size,
              promotionType: null,
              promotionValue: null,
              promotionFromDate: null,
              promotionToDate: null,
              finalPrice: size.price,
              hasPromotion: false,
            }));
          }

          return updated;
        });
      }
    },

    resetTablePromotionsOptimistic: (state, action: PayloadAction<string[]>) => {
      // Reset promotions for selected products optimistically
      if (state.data) {
        const selectedIds = new Set(action.payload);
        state.data.content = state.data.content.map((product) => {
          if (selectedIds.has(product.id)) {
            const updated = {
              ...product,
              hasPromotion: false,
              displayPromotionType: null,
              displayPromotionValue: null,
              displayPrice: product.price,
              displayOriginPrice: product.price,
            };

            // Reset all size promotions
            if (updated.sizes && updated.sizes.length > 0) {
              updated.sizes = updated.sizes.map((size: any) => ({
                ...size,
                promotionType: null,
                promotionValue: null,
                promotionFromDate: null,
                promotionToDate: null,
                finalPrice: size.price,
                hasPromotion: false,
              }));
            }

            return updated;
          }
          return product;
        });
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllProductAdminService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProductAdminService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllProductAdminService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchAllProductService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProductService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllProductService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchProductByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedProduct = null;
      })
      .addCase(fetchProductByIdService.fulfilled, (state, action) => {
        state.selectedProduct = action.payload;
        state.operations.isFetchingDetail = false;

        // Also update in list if exists (for consistency)
        if (state.data?.content) {
          const index = state.data.content.findIndex(
            (user) => user.id === action.payload.id
          );
          if (index !== -1) {
            state.data.content[index] = action.payload;
          }
        }
      })
      .addCase(fetchProductByIdService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isFetchingDetail = false;
      });

    builder
      .addCase(createProductService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createProductService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
        }
        state.operations.isCreating = false;
      })
      .addCase(createProductService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isCreating = false;
      });

    builder
      .addCase(updateProductService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProductService.fulfilled, (state, action) => {
        state.selectedProduct = action.payload;
        state.operations.isUpdating = false;

        // Update in list
        if (state.data) {
          state.data.content = state.data.content.map((user) =>
            user.id === action.payload.id ? action.payload : user
          );
        }
      })
      .addCase(updateProductService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deleteProductService.pending, (state) => {
        state.operations.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteProductService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = state.data.content.filter(
            (user) => user.id !== action.payload
          );
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
          state.data.last = state.data.pageNo >= state.data.totalPages;
          state.data.hasNext = !state.data.last;
          state.data.hasPrevious = state.data.pageNo > 1;
        }
        state.operations.isDeleting = false;
      })
      .addCase(deleteProductService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isDeleting = false;
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
  updateProductOptimistic,
  resetProductPromotionOptimistic,
  resetAllPromotionsOptimistic,
  resetTablePromotionsOptimistic,
  toggleProductSelection,
  selectAllProducts,
  deselectAllProducts,
  clearProductSelections,
} = productSlice.actions;

export default productSlice.reducer;
