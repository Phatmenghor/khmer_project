import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectDeliveryOptionsState = (state: RootState) =>
  state.deliveryOptions;

export const selectDeliveryOptions = (state: RootState) =>
  state.deliveryOptions.data;

export const selectSelectedDeliveryOptions = (state: RootState) =>
  state.deliveryOptions.selectedDeliveryOptions;

export const selecDeliveryOptionsContent = createSelector(
  [selectDeliveryOptions],
  (data) => data?.content || []
);

export const selectIsLoading = (state: RootState) =>
  state.deliveryOptions.isLoading;

export const selectIsFetchingDetail = (state: RootState) =>
  state.deliveryOptions.operations.isFetchingDetail;

export const selectError = (state: RootState) => state.deliveryOptions.error;

export const selectFilters = (state: RootState) =>
  state.deliveryOptions.filters;

export const selectOperations = (state: RootState) =>
  state.deliveryOptions.operations;

/**
 * Select pagination metadata
 */
export const selectPagination = createSelector(
  [selectDeliveryOptions],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 15,
    last: data?.last || false,
    first: data?.first || true,
    hasNext: data?.hasNext || false,
    hasPrevious: data?.hasPrevious || false,
  })
);
