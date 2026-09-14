import { RootState } from "@/store";

export const selectBakongStatus = (state: RootState) => state.bakong?.status;
export const selectIsBakongStatusLoading = (state: RootState) => state.bakong?.isStatusLoading;

export const selectBakongConfigsList = (state: RootState) => state.bakong?.configs?.content || [];
export const selectBakongConfigsPagination = (state: RootState) => state.bakong?.configs || {
  content: [],
  pageNo: 1,
  pageSize: 15,
  totalElements: 0,
  totalPages: 0,
  last: true,
};
export const selectIsBakongConfigsLoading = (state: RootState) => state.bakong?.isConfigsLoading;
export const selectBakongConfigFilters = (state: RootState) => state.bakong?.configFilters || { search: "", pageNo: 1 };

export const selectBakongAccountsList = (state: RootState) => state.bakong?.accounts?.content || [];
export const selectBakongAccountsPagination = (state: RootState) => state.bakong?.accounts || {
  content: [],
  pageNo: 1,
  pageSize: 15,
  totalElements: 0,
  totalPages: 0,
  last: true,
};
export const selectIsBakongAccountsLoading = (state: RootState) => state.bakong?.isAccountsLoading;
export const selectBakongAccountFilters = (state: RootState) => state.bakong?.accountFilters || { search: "", pageNo: 1 };

export const selectBakongTransactions = (state: RootState) => state.bakong?.transactions?.content || [];
export const selectBakongTransactionsPagination = (state: RootState) => state.bakong?.transactions || {
  content: [],
  pageNo: 1,
  pageSize: 15,
  totalElements: 0,
  totalPages: 0,
  last: true,
};
export const selectIsBakongTransactionsLoading = (state: RootState) => state.bakong?.isTransactionsLoading;
export const selectBakongTransactionFilters = (state: RootState) => state.bakong?.transactionFilters || { search: "", pageNo: 1 };

export const selectIsBakongSubmitting = (state: RootState) => state.bakong?.isSubmitting;
