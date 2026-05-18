import { createSelector } from 'reselect';
import { RootState } from '@/store';


const selectPublicProductsState = (state: RootState) => state.publicProducts;
const selectPublicProductsList = (state: RootState) => state.publicProducts.products;
const selectProductPagination = (state: RootState) => state.publicProducts.pagination;
const selectProductLoading = (state: RootState) => state.publicProducts.loading;
const selectProductError = (state: RootState) => state.publicProducts.error;


export const selectProductListWithPagination = createSelector(
  [selectPublicProductsList, selectProductPagination],
  (products, pagination) => ({ products, pagination })
);


export const selectProductListLoadingState = createSelector(
  [selectProductLoading],
  (loading) => ({
    isListLoading: loading.list,
    isDetailLoading: loading.detail,
    isFiltersLoading: loading.filters,
  })
);


export const selectProductErrorState = createSelector(
  [selectProductError],
  (error) => ({
    listError: error.list,
    detailError: error.detail,
  })
);


export const selectProductById = createSelector(
  [
    (state: RootState) => state.publicProducts.products,
    (_state: RootState, productId: string) => productId,
  ],
  (products, productId) => {
    return products.find((p) => p.id === productId);
  }
);


export const selectIsProductInList = createSelector(
  [
    (state: RootState) => state.publicProducts.products,
    (_state: RootState, productId: string) => productId,
  ],
  (products, productId) => {
    return products.some((p) => p.id === productId);
  }
);


export const selectAllProductIds = createSelector(
  [selectPublicProductsList],
  (products) => products.map((p) => p.id)
);


export const selectProductCount = createSelector(
  [selectPublicProductsList],
  (products) => products.length
);


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


export const selectIsAnyProductLoading = createSelector(
  [selectProductLoading],
  (loading) => loading.detail || loading.list
);
