import { selectDeliveryOptions } from "@/redux/features/master-data/store/selectors/delivery-options-selector";
import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectSessionState = (state: RootState) => state.sessions;

export const selectSessions = (state: RootState) => state.sessions.data;

export const selectSelectedSession = (state: RootState) =>
  state.sessions.selectedSession;

export const selectSessionsContent = createSelector(
  [selectSessions],
  (data) => data?.content || [],
);

export const selectIsLoading = (state: RootState) => state.sessions.isLoading;

export const selectIsFetchingDetail = (state: RootState) =>
  state.sessions.operations.isFetchingDetail;

export const selectError = (state: RootState) => state.sessions.error;

export const selectFilters = (state: RootState) => state.sessions.filters;

export const selectOperations = (state: RootState) => state.sessions.operations;

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
  }),
);
