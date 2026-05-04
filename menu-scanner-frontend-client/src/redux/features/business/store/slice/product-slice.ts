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
  resetProductPromotionService,
  resetAllPromotionsService,
  resetBulkPromotionsService,
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
    status: ProductStatus.ALL,
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

    createBulkPromotionsOptimistic: (
      state,
      action: PayloadAction<{
        productIds: string[];
        promotionType: string;
        promotionValue: number;
        promotionFromDate: string;
        promotionToDate: string;
        productSizeMapping?: Record<string, string[]>;
      }>,
    ) => {
      // Update products and sizes optimistically after bulk promotion creation
      if (state.data) {
        const {
          productIds,
          promotionType,
          promotionValue,
          promotionFromDate,
          promotionToDate,
          productSizeMapping,
        } = action.payload;

        const selectedIds = new Set(productIds);

        state.data.content = state.data.content.map((product) => {
          if (selectedIds.has(product.id)) {
            // Check if this product has specific size mappings
            const productSizeIds = productSizeMapping?.[product.id];
            const hasSizeMappings =
              productSizeIds && productSizeIds.length > 0;

            // Update sizes if they exist
            let updatedSizes = product.sizes;
            if (product.sizes && product.sizes.length > 0) {
              updatedSizes = product.sizes.map((size: any) => {
                // If size mapping exists, only update specified sizes; otherwise update all
                const shouldUpdateSize =
                  !hasSizeMappings ||
                  (productSizeIds && productSizeIds.includes(size.id));

                if (shouldUpdateSize) {
                  const discountAmount =
                    promotionType === "PERCENTAGE"
                      ? (parseFloat(product.price) * promotionValue) / 100
                      : promotionValue;
                  const newPrice =
                    parseFloat(product.price) - discountAmount;

                  return {
                    ...size,
                    promotionType,
                    promotionValue,
                    promotionFromDate,
                    promotionToDate,
                    finalPrice: Math.max(newPrice, 0),
                    hasPromotion: true,
                  };
                }
                return size;
              });
            }

            // Calculate display price for product level
            const discountAmount =
              promotionType === "PERCENTAGE"
                ? (parseFloat(product.price) * promotionValue) / 100
                : promotionValue;
            const displayPrice = Math.max(
              parseFloat(product.price) - discountAmount,
              0,
            );

            return {
              ...product,
              promotionType,
              promotionValue,
              promotionFromDate,
              promotionToDate,
              displayPrice,
              displayOriginPrice: parseFloat(product.price),
              displayPromotionType: promotionType,
              displayPromotionValue: promotionValue,
              displayPromotionFromDate: promotionFromDate,
              displayPromotionToDate: promotionToDate,
              hasPromotion: true,
              sizes: updatedSizes,
            };
          }
          return product;
        });
      }
    },

    resetSelectedPromotionsOptimistic: (
      state,
      action: PayloadAction<{
        productIds: string[];
        productSizeMapping?: Record<string, string[]>;
      }>,
    ) => {
      // Reset promotions for selected products/sizes optimistically
      if (state.data) {
        const { productIds, productSizeMapping } = action.payload;
        const selectedIds = new Set(productIds);
        const hasSizeMapping =
          productSizeMapping && Object.keys(productSizeMapping).length > 0;

        state.data.content = state.data.content.map((product) => {
          if (selectedIds.has(product.id)) {
            const productSizeIds = productSizeMapping?.[product.id];
            const shouldResetAll = !hasSizeMapping || !productSizeIds;

            // Reset sizes if they exist
            let updatedSizes = product.sizes;
            if (product.sizes && product.sizes.length > 0) {
              updatedSizes = product.sizes.map((size: any) => {
                const shouldResetSize =
                  shouldResetAll ||
                  (productSizeIds && productSizeIds.includes(size.id));

                if (shouldResetSize) {
                  return {
                    ...size,
                    promotionType: null,
                    promotionValue: null,
                    promotionFromDate: null,
                    promotionToDate: null,
                    finalPrice: size.price,
                    hasPromotion: false,
                  };
                }
                return size;
              });
            }

            // Reset product-level promotion only if all sizes are being reset
            if (shouldResetAll) {
              return {
                ...product,
                promotionType: null,
                promotionValue: null,
                promotionFromDate: null,
                promotionToDate: null,
                displayPrice: parseFloat(product.price),
                displayOriginPrice: parseFloat(product.price),
                displayPromotionType: null,
                displayPromotionValue: null,
                displayPromotionFromDate: null,
                displayPromotionToDate: null,
                hasPromotion: false,
                sizes: updatedSizes,
              };
            }

            return {
              ...product,
              sizes: updatedSizes,
            };
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

    builder
      .addCase(resetProductPromotionService.pending, (state) => {
        state.operations.isResettingPromotion = true;
        state.error = null;
      })
      .addCase(resetProductPromotionService.fulfilled, (state) => {
        state.operations.isResettingPromotion = false;
      })
      .addCase(resetProductPromotionService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isResettingPromotion = false;
      });

    builder
      .addCase(resetAllPromotionsService.pending, (state) => {
        state.operations.isResettingAll = true;
        state.error = null;
      })
      .addCase(resetAllPromotionsService.fulfilled, (state) => {
        state.operations.isResettingAll = false;
      })
      .addCase(resetAllPromotionsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isResettingAll = false;
      });

    builder
      .addCase(resetBulkPromotionsService.pending, (state) => {
        state.operations.isResettingBulk = true;
        state.error = null;
      })
      .addCase(resetBulkPromotionsService.fulfilled, (state) => {
        state.operations.isResettingBulk = false;
      })
      .addCase(resetBulkPromotionsService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isResettingBulk = false;
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
  createBulkPromotionsOptimistic,
  resetSelectedPromotionsOptimistic,
  toggleProductSelection,
  selectAllProducts,
  deselectAllProducts,
  clearProductSelections,
} = productSlice.actions;

export default productSlice.reducer;
