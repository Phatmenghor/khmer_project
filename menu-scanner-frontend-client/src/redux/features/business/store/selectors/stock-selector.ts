import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectStockState = (state: RootState) => state.stocks;

export const selectStock = (state: RootState) => state.stocks.data;

export const selectSelectedStock = (state: RootState) =>
  state.stocks.selectedProduct;

export const selectStockContent = createSelector(
  [selectStock],
  (data) => data?.content || []
);

export const selectIsLoading = (state: RootState) => state.stocks.isLoading;

export const selectError = (state: RootState) => state.stocks.error;

export const selectFilters = (state: RootState) => state.stocks.filters;

export const selectOperations = (state: RootState) => state.stocks.operations;

/**
 * Select pagination metadata
 */
export const selectPagination = createSelector([selectStock], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
  hasNext: data?.hasNext || false,
  hasPrevious: data?.hasPrevious || false,
}));
