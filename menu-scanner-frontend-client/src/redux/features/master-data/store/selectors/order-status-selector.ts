import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectOrderStatusState = (state: RootState) => state.orderStatus;

export const selectOrderStatus = (state: RootState) => state.orderStatus.data;

export const selectSelectedOrderStatus = (state: RootState) =>
  state.orderStatus.selectedOrderStatus;

export const selectOrderStatusContent = createSelector(
  [selectOrderStatus],
  (data) => data?.content || [],
);

export const selectIsLoading = (state: RootState) =>
  state.orderStatus.isLoading;

export const selectIsFetchingDetail = (state: RootState) =>
  state.orderStatus.operations.isFetchingDetail;

export const selectError = (state: RootState) => state.orderStatus.error;

export const selectFilters = (state: RootState) => state.orderStatus.filters;

export const selectOperations = (state: RootState) =>
  state.orderStatus.operations;

/**
 * Select pagination metadata
 */
export const selectPagination = createSelector([selectOrderStatus], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
  hasNext: data?.hasNext || false,
  hasPrevious: data?.hasPrevious || false,
}));
