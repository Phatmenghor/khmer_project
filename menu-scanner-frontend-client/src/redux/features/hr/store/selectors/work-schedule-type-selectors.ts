import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectWorkScheduleTypeState = (state: RootState) =>
  state.workScheduleType;

export const selectWorkScheduleType = (state: RootState) =>
  state.workScheduleType.data;

export const selectSelectedWorkScheduleType = (state: RootState) =>
  state.workScheduleType.selectedWorkSchedule;

export const selectWorkScheduleTypeContent = createSelector(
  [selectWorkScheduleType],
  (data) => data?.content || []
);

export const selectIsLoading = (state: RootState) =>
  state.workScheduleType.isLoading;

export const selectIsFetchingDetail = (state: RootState) =>
  state.workScheduleType.operations.isFetchingDetail;

export const selectError = (state: RootState) => state.workScheduleType.error;

export const selectFilters = (state: RootState) =>
  state.workScheduleType.filters;
export const selectOperations = (state: RootState) =>
  state.workScheduleType.operations;

/**
 * Select pagination metadata
 */
export const selectPagination = createSelector(
  [selectWorkScheduleType],
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
