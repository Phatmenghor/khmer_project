import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectBrandState = (state: RootState) => state.brand;

export const selectBrand = (state: RootState) => state.brand.data;

export const selectSelectedBrand = (state: RootState) =>
  state.brand.selectedBrand;

export const selectBrandContent = createSelector(
  [selectBrand],
  (data) => data?.content || []
);

export const selectIsLoading = (state: RootState) => state.brand.isLoading;

export const selectIsFetchingDetail = (state: RootState) =>
  state.brand.operations.isFetchingDetail;

export const selectError = (state: RootState) => state.brand.error;

export const selectFilters = (state: RootState) => state.brand.filters;

export const selectOperations = (state: RootState) => state.brand.operations;

/**
 * Select pagination metadata
 */
export const selectPagination = createSelector([selectBrand], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
  hasNext: data?.hasNext || false,
  hasPrevious: data?.hasPrevious || false,
}));
