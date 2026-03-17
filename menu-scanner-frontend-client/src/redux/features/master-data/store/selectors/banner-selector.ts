import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectBannerState = (state: RootState) => state.banner;

export const selectBanner = (state: RootState) => state.banner.data;

export const selectSelectedBanner = (state: RootState) =>
  state.banner.selectedBanner;

export const selecBannerContent = createSelector(
  [selectBanner],
  (data) => data?.content || []
);

export const selectIsLoading = (state: RootState) => state.banner.isLoading;

export const selectIsFetchingDetail = (state: RootState) =>
  state.banner.operations.isFetchingDetail;

export const selectError = (state: RootState) => state.banner.error;

export const selectFilters = (state: RootState) => state.banner.filters;

export const selectOperations = (state: RootState) => state.banner.operations;

/**
 * Select pagination metadata
 */
export const selectPagination = createSelector([selectBanner], (data) => ({
  currentPage: data?.pageNo || 1,
  totalPages: data?.totalPages || 1,
  totalElements: data?.totalElements || 0,
  pageSize: data?.pageSize || 15,
  last: data?.last || false,
  first: data?.first || true,
  hasNext: data?.hasNext || false,
  hasPrevious: data?.hasPrevious || false,
}));
