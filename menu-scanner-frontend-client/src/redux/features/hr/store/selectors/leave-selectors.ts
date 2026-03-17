import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectLeaveState = (state: RootState) => state.leave;

export const selectLeave = (state: RootState) => state.leave.data;

export const selectSelectedLeave = (state: RootState) =>
  state.leave.selectedLeave;

export const selectLeaveContent = createSelector(
  [selectLeave],
  (data) => data?.content || [],
);

export const selectIsLoading = (state: RootState) => state.leave.isLoading;

export const selectIsFetchingDetail = (state: RootState) =>
  state.leave.operations.isFetchingDetail;

export const selectError = (state: RootState) => state.leave.error;

export const selectFilters = (state: RootState) => state.leave.filters;
export const selectOperations = (state: RootState) => state.leave.operations;
/**
 * Select pagination metadata
 */
export const selectPagination = createSelector([selectLeave], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
  hasNext: data?.hasNext || false,
  hasPrevious: data?.hasPrevious || false,
}));
