import { RootState } from "@/redux/store";

export const selectPaymentOptionsState = (state: RootState) =>
  state.paymentOptions;

export const selectPaymentOptionsData = (state: RootState) =>
  state.paymentOptions.data;

export const selectPaymentOptionsContent = (state: RootState) =>
  state.paymentOptions.data?.content || [];

export const selectSelectedPaymentOption = (state: RootState) =>
  state.paymentOptions.selectedPaymentOption;

export const selectPaymentOptionsLoading = (state: RootState) =>
  state.paymentOptions.isLoading;

export const selectPaymentOptionsError = (state: RootState) =>
  state.paymentOptions.error;

export const selectPaymentOptionsFilters = (state: RootState) =>
  state.paymentOptions.filters;

export const selectPaymentOptionsOperations = (state: RootState) =>
  state.paymentOptions.operations;

export const selectPaymentOptionsPagination = (state: RootState) => {
  const data = state.paymentOptions.data;
  return {
    pageNo: data?.pageNo || 1,
    pageSize: data?.pageSize || 10,
    totalElements: data?.totalElements || 0,
    totalPages: data?.totalPages || 0,
    hasNext: data?.hasNext || false,
    hasPrevious: data?.hasPrevious || false,
    last: data?.last || false,
  };
};
