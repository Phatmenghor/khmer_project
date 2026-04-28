import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectSubcategoriesState = (state: RootState) =>
  state.subcategories;

export const selectSubcategories = (state: RootState) =>
  state.subcategories.data;

export const selectSelectedSubcategories = (state: RootState) =>
  state.subcategories.selectedSubcategories;

export const selectSubcategoriesContent = createSelector(
  [selectSubcategories],
  (data) => data?.content || []
);

export const selectIsLoading = (state: RootState) =>
  state.subcategories.isLoading;

export const selectIsFetchingDetail = (state: RootState) =>
  state.subcategories.operations.isFetchingDetail;

export const selectError = (state: RootState) => state.subcategories.error;

export const selectFilters = (state: RootState) => state.subcategories.filters;

export const selectOperations = (state: RootState) =>
  state.subcategories.operations;

/**
 * Select pagination metadata
 */
export const selectPagination = createSelector([selectSubcategories], (data) => ({
  currentPage: data?.pageNo || 1,
  pageSize: data?.pageSize || 15,
  totalElements: data?.totalElements || 0,
  totalPages: data?.totalPages || 0,
  hasNext: data?.hasNext || false,
  hasPrevious: data?.hasPrevious || false,
}));
