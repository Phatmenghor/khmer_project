import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectCategoriesState = (state: RootState) => state.categories;

export const selectCategories = (state: RootState) => state.categories.data;

export const selectSelectedCategories = (state: RootState) =>
  state.categories.selectedCategories;

export const selectCategoriesContent = createSelector(
  [selectCategories],
  (data) => data?.content || []
);

export const selectIsLoading = (state: RootState) => state.categories.isLoading;

export const selectIsFetchingDetail = (state: RootState) =>
  state.categories.operations.isFetchingDetail;

export const selectError = (state: RootState) => state.categories.error;

export const selectFilters = (state: RootState) => state.categories.filters;

export const selectOperations = (state: RootState) =>
  state.categories.operations;

/**
 * Select pagination metadata
 */
export const selectPagination = createSelector([selectCategories], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
  hasNext: data?.hasNext || false,
  hasPrevious: data?.hasPrevious || false,
}));
