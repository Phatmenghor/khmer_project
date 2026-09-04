import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectSubscriptionHistoryState = (state: RootState) =>
  state.subscriptionHistory;

export const selectSubscriptionHistoryData = (state: RootState) =>
  state.subscriptionHistory.data;

export const selectSubscriptionHistoryContent = (state: RootState) =>
  state.subscriptionHistory.data?.content || [];

export const selectSelectedHistory = (state: RootState) =>
  state.subscriptionHistory.selectedHistory;

export const selectMySubscriptionSummary = (state: RootState) =>
  state.subscriptionHistory.mySummary;

export const selectIsLoading = (state: RootState) =>
  state.subscriptionHistory.isLoading;

export const selectIsFetchingDetail = (state: RootState) =>
  state.subscriptionHistory.operations.isFetchingDetail;

export const selectIsFetchingSummary = (state: RootState) =>
  state.subscriptionHistory.operations.isFetchingSummary;

export const selectError = (state: RootState) =>
  state.subscriptionHistory.error;

export const selectFilters = (state: RootState) =>
  state.subscriptionHistory.filters;

export const selectOperations = (state: RootState) =>
  state.subscriptionHistory.operations;

export const selectPagination = createSelector(
  [selectSubscriptionHistoryData],
  (data) => ({
    currentPage: data?.pageNo || 1,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
    pageSize: data?.pageSize || 10,
    last: data?.last || false,
    first: data?.first || true,
    hasNext: data?.hasNext || false,
    hasPrevious: data?.hasPrevious || false,
  })
);
