import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectWorkScheduleState = (state: RootState) => state.workSchedule;

export const selectWorkSchedule = (state: RootState) => state.workSchedule.data;

export const selectSelectedWorkSchedule = (state: RootState) =>
  state.workSchedule.selectedWorkSchedule;

export const selectWorkScheduleContent = createSelector(
  [selectWorkSchedule],
  (data) => data?.content || [],
);

export const selectIsLoading = (state: RootState) =>
  state.workSchedule.isLoading;

export const selectIsFetchingDetail = (state: RootState) =>
  state.workSchedule.operations.isFetchingDetail;

export const selectError = (state: RootState) => state.workSchedule.error;

export const selectFilters = (state: RootState) => state.workSchedule.filters;
export const selectOperations = (state: RootState) =>
  state.workSchedule.operations;

/**
 * Select pagination metadata
 */
export const selectPagination = createSelector(
  [selectWorkSchedule],
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
