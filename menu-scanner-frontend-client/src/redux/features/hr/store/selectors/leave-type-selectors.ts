import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectLeaveTypeState = (state: RootState) => state.leaveType;

export const selectLeaveType = (state: RootState) => state.leaveType.data;

export const selectSelectedLeaveType = (state: RootState) =>
  state.leaveType.selectedLeaveType;

export const selectLeaveTypeContent = createSelector(
  [selectLeaveType],
  (data) => data?.content || []
);

export const selectIsLoading = (state: RootState) => state.leaveType.isLoading;

export const selectIsFetchingDetail = (state: RootState) =>
  state.leaveType.operations.isFetchingDetail;

export const selectError = (state: RootState) => state.leaveType.error;

export const selectFilters = (state: RootState) => state.leaveType.filters;
export const selectOperations = (state: RootState) =>
  state.leaveType.operations;
/**
 * Select pagination metadata
 */
export const selectPagination = createSelector([selectLeaveType], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
  hasNext: data?.hasNext || false,
  hasPrevious: data?.hasPrevious || false,
}));
