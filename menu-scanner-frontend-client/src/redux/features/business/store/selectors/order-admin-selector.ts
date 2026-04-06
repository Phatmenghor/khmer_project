import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectOrderAdminState = (state: RootState) => state.ordersAdmin;

export const selectOrderAdminData = (state: RootState) => state.ordersAdmin.data;

export const selectSelectedOrder = (state: RootState) =>
  state.ordersAdmin.selectedOrder;

export const selectOrderAdminContent = createSelector(
  [selectOrderAdminData],
  (data) => data?.content || []
);

export const selectOrderAdminIsLoading = (state: RootState) =>
  state.ordersAdmin.isLoading;

export const selectOrderAdminIsFetchingDetail = (state: RootState) =>
  state.ordersAdmin.operations.isFetchingDetail;

export const selectOrderAdminError = (state: RootState) =>
  state.ordersAdmin.error;

export const selectOrderAdminFilters = (state: RootState) =>
  state.ordersAdmin.filters;

export const selectOrderAdminOperations = (state: RootState) =>
  state.ordersAdmin.operations;

export const selectOrderAdminPagination = createSelector(
  [selectOrderAdminData],
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

export const selectOrderAdminDetailError = (state: RootState) =>
  state.ordersAdmin.error;
