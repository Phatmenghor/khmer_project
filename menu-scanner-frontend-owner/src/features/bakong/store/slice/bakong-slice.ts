import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  BakongConfigModel,
  BakongAccountModel,
  BakongTransactionModel,
  BakongMonitoringStatusModel,
} from "../../models/bakong-models";
import { PageResponseModel } from "../../services/bakong-api-service";

interface BakongState {
  status: BakongMonitoringStatusModel | null;
  isStatusLoading: boolean;

  configs: PageResponseModel<BakongConfigModel>;
  isConfigsLoading: boolean;
  configFilters: {
    search: string;
    pageNo: number;
  };

  accounts: PageResponseModel<BakongAccountModel>;
  isAccountsLoading: boolean;
  accountFilters: {
    search: string;
    pageNo: number;
  };

  transactions: PageResponseModel<BakongTransactionModel>;
  isTransactionsLoading: boolean;
  transactionFilters: {
    search: string;
    pageNo: number;
  };

  isSubmitting: boolean;
  error: string | null;
}

const emptyPage = <T>(): PageResponseModel<T> => ({
  content: [],
  pageNo: 1,
  pageSize: 15,
  totalElements: 0,
  totalPages: 0,
  last: true,
});

const initialState: BakongState = {
  status: null,
  isStatusLoading: false,

  configs: emptyPage<BakongConfigModel>(),
  isConfigsLoading: false,
  configFilters: {
    search: "",
    pageNo: 1,
  },

  accounts: emptyPage<BakongAccountModel>(),
  isAccountsLoading: false,
  accountFilters: {
    search: "",
    pageNo: 1,
  },

  transactions: emptyPage<BakongTransactionModel>(),
  isTransactionsLoading: false,
  transactionFilters: {
    search: "",
    pageNo: 1,
  },

  isSubmitting: false,
  error: null,
};

export const bakongSlice = createSlice({
  name: "bakong",
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<BakongMonitoringStatusModel | null>) => {
      state.status = action.payload;
    },
    setStatusLoading: (state, action: PayloadAction<boolean>) => {
      state.isStatusLoading = action.payload;
    },

    setConfigs: (state, action: PayloadAction<PageResponseModel<BakongConfigModel>>) => {
      state.configs = action.payload;
    },
    setConfigsLoading: (state, action: PayloadAction<boolean>) => {
      state.isConfigsLoading = action.payload;
    },
    setConfigSearch: (state, action: PayloadAction<string>) => {
      state.configFilters.search = action.payload;
      state.configFilters.pageNo = 1;
    },
    setConfigPageNo: (state, action: PayloadAction<number>) => {
      state.configFilters.pageNo = action.payload;
    },

    setAccounts: (state, action: PayloadAction<PageResponseModel<BakongAccountModel>>) => {
      state.accounts = action.payload;
    },
    setAccountsLoading: (state, action: PayloadAction<boolean>) => {
      state.isAccountsLoading = action.payload;
    },
    setAccountSearch: (state, action: PayloadAction<string>) => {
      state.accountFilters.search = action.payload;
      state.accountFilters.pageNo = 1;
    },
    setAccountPageNo: (state, action: PayloadAction<number>) => {
      state.accountFilters.pageNo = action.payload;
    },

    setTransactions: (state, action: PayloadAction<PageResponseModel<BakongTransactionModel>>) => {
      state.transactions = action.payload;
    },
    setTransactionsLoading: (state, action: PayloadAction<boolean>) => {
      state.isTransactionsLoading = action.payload;
    },
    setTransactionSearch: (state, action: PayloadAction<string>) => {
      state.transactionFilters.search = action.payload;
      state.transactionFilters.pageNo = 1;
    },
    setTransactionPageNo: (state, action: PayloadAction<number>) => {
      state.transactionFilters.pageNo = action.payload;
    },

    setIsSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setStatus,
  setStatusLoading,
  setConfigs,
  setConfigsLoading,
  setConfigSearch,
  setConfigPageNo,
  setAccounts,
  setAccountsLoading,
  setAccountSearch,
  setAccountPageNo,
  setTransactions,
  setTransactionsLoading,
  setTransactionSearch,
  setTransactionPageNo,
  setIsSubmitting,
  setError,
} = bakongSlice.actions;

export default bakongSlice.reducer;
