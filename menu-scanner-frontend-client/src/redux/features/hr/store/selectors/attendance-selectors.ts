import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectAttendanceState = (state: RootState) => state.attendance;

export const selectAttendance = (state: RootState) => state.attendance.data;

export const selectSelectedAttendance = (state: RootState) =>
  state.attendance.selectedAttendance;

export const selectAttendanceContent = createSelector(
  [selectAttendance],
  (data) => data?.content || [],
);

export const selectIsLoading = (state: RootState) => state.attendance.isLoading;
export const selectIsFetchingDetail = (state: RootState) =>
  state.attendance.operations.isFetchingDetail;

export const selectError = (state: RootState) => state.attendance.error;

export const selectFilters = (state: RootState) => state.attendance.filters;
export const selectOperations = (state: RootState) =>
  state.attendance.operations;

/**
 * Select pagination metadata
 */
export const selectPagination = createSelector([selectAttendance], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
  hasNext: data?.hasNext || false,
  hasPrevious: data?.hasPrevious || false,
}));
