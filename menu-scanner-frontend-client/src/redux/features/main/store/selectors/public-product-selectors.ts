import { RootState } from "@/redux/store";

export const selectPublicProducts = (state: RootState) =>
  state.publicProducts.products;

export const selectSelectedPublicProduct = (state: RootState) =>
  state.publicProducts.selectedProduct;

export const selectPublicCategories = (state: RootState) =>
  state.publicProducts.categories;

export const selectPublicBrands = (state: RootState) =>
  state.publicProducts.brands;

export const selectPublicProductPagination = (state: RootState) =>
  state.publicProducts.pagination;

export const selectPublicProductListLoading = (state: RootState) =>
  state.publicProducts.loading.list;

export const selectPublicProductDetailLoading = (state: RootState) =>
  state.publicProducts.loading.detail;

export const selectPublicFiltersLoading = (state: RootState) =>
  state.publicProducts.loading.filters;

export const selectPublicProductListError = (state: RootState) =>
  state.publicProducts.error.list;

export const selectPublicProductDetailError = (state: RootState) =>
  state.publicProducts.error.detail;

export const selectPublicProductScrollY = (state: RootState) =>
  state.publicProducts.scrollY;

// Add new selector
export const selectPublicProductLoadedFilters = (state: RootState) =>
  state.publicProducts.loadedFilters;
