import { createSelector } from 'reselect';
import { RootState } from '@/redux/store';

// Base selectors
const selectPublicProductsState = (state: RootState) => state.publicProducts;
const selectPublicProductsList = (state: RootState) => state.publicProducts.products;
const selectProductPagination = (state: RootState) => state.publicProducts.pagination;
const selectProductLoading = (state: RootState) => state.publicProducts.loading;
const selectProductError = (state: RootState) => state.publicProducts.error;

/**
 * MEMOIZED: Public product list with pagination info.
 * Only recalculates when products or pagination changes,
 * not when cart or other unrelated state changes.
 */
export const selectProductListWithPagination = createSelector(
  [selectPublicProductsList, selectProductPagination],
  (products, pagination) => ({ products, pagination })
);

/**
 * MEMOIZED: Loading state for product list.
 * Prevents unnecessary re-renders of product containers when other loading states change.
 */
export const selectProductListLoadingState = createSelector(
  [selectProductLoading],
  (loading) => ({
    isListLoading: loading.list,
    isDetailLoading: loading.detail,
    isFiltersLoading: loading.filters,
  })
);

/**
 * MEMOIZED: Error state for product list.
 */
export const selectProductErrorState = createSelector(
  [selectProductError],
  (error) => ({
    listError: error.list,
    detailError: error.detail,
  })
);

/**
 * MEMOIZED: Find single product by ID.
 * Factory selector pattern - efficiently finds product without iterating all products
 * on every render.
 */
export const selectProductById = createSelector(
  [
    (state: RootState) => state.publicProducts.products,
    (_state: RootState, productId: string) => productId,
  ],
  (products, productId) => {
    return products.find((p) => p.id === productId);
  }
);

/**
 * MEMOIZED: Check if product exists in the list.
 * Prevents ProductCard from triggering parent re-render checks.
 */
export const selectIsProductInList = createSelector(
  [
    (state: RootState) => state.publicProducts.products,
    (_state: RootState, productId: string) => productId,
  ],
  (products, productId) => {
    return products.some((p) => p.id === productId);
  }
);

/**
 * MEMOIZED: Get all product IDs for efficient lookups.
 */
export const selectAllProductIds = createSelector(
  [selectPublicProductsList],
  (products) => products.map((p) => p.id)
);

/**
 * MEMOIZED: Get product count.
 * Prevents pagination controls from re-rendering on list changes.
 */
export const selectProductCount = createSelector(
  [selectPublicProductsList],
  (products) => products.length
);

/**
 * MEMOIZED: Categories with product counts.
 * Useful for category filters showing (5), (10), etc.
 */
export const selectCategoriesWithCounts = createSelector(
  [
    (state: RootState) => state.publicProducts.categories,
    (state: RootState) => state.publicProducts.products,
  ],
  (categories, products) => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      if (p.categoryId) {
        counts.set(p.categoryId, (counts.get(p.categoryId) || 0) + 1);
      }
    });
    return categories.map((cat) => ({
      ...cat,
      count: counts.get(cat.id) || 0,
    }));
  }
);

/**
 * MEMOIZED: Brands with product counts.
 */
export const selectBrandsWithCounts = createSelector(
  [
    (state: RootState) => state.publicProducts.brands,
    (state: RootState) => state.publicProducts.products,
  ],
  (brands, products) => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      if (p.brandId) {
        counts.set(p.brandId, (counts.get(p.brandId) || 0) + 1);
      }
    });
    return brands.map((brand) => ({
      ...brand,
      count: counts.get(brand.id) || 0,
    }));
  }
);

/**
 * MEMOIZED: All data needed for product list page in one efficient call.
 * Components can subscribe to this single selector instead of multiple selectors.
 */
export const selectProductListPageData = createSelector(
  [
    selectPublicProductsList,
    selectProductPagination,
    selectProductLoading,
    selectProductError,
    (state: RootState) => state.publicProducts.categories,
    (state: RootState) => state.publicProducts.brands,
  ],
  (products, pagination, loading, error, categories, brands) => ({
    products,
    pagination,
    loading: {
      list: loading.list,
      detail: loading.detail,
      filters: loading.filters,
    },
    error: {
      list: error.list,
      detail: error.detail,
    },
    categories,
    brands,
  })
);

/**
 * MEMOIZED: Check if any product is currently being loaded in detail view.
 */
export const selectIsAnyProductLoading = createSelector(
  [selectProductLoading],
  (loading) => loading.detail || loading.list
);
