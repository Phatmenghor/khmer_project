import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  BakongConfigModel,
  BakongAccountModel,
  BakongTransactionModel,
  BakongMonitoringStatusModel,
} from "../../models/bakong-models";
import { PageResponseModel } from "../../services/bakong-api-service";
import {
  fetchMonitoringStatusThunk,
  fetchAllConfigsThunk,
  createConfigThunk,
  updateConfigThunk,
  deleteConfigThunk,
  fetchAllAccountsThunk,
  createAccountThunk,
  updateAccountThunk,
  deleteAccountThunk,
  fetchTransactionsThunk,
} from "../thunks/bakong-thunks";

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

    updateConfigLocal: (state, action: PayloadAction<{ id: string; enabled: boolean }>) => {
      if (state.configs?.content) {
        const target = state.configs.content.find((c) => c.id === action.payload.id);
        if (target) {
          target.enabled = action.payload.enabled;
        }
      }
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

    updateAccountLocal: (state, action: PayloadAction<{ id: string; enabled: boolean }>) => {
      if (state.accounts?.content) {
        state.accounts.content.forEach((acc) => {
          if (acc.id === action.payload.id) {
            acc.enabled = action.payload.enabled;
            acc.isDefault = action.payload.enabled;
          } else if (action.payload.enabled) {
            acc.enabled = false;
            acc.isDefault = false;
          }
        });
      }
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
    resetState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Monitoring status
    builder
      .addCase(fetchMonitoringStatusThunk.pending, (state) => {
        state.isStatusLoading = true;
        state.error = null;
      })
      .addCase(fetchMonitoringStatusThunk.fulfilled, (state, action) => {
        state.isStatusLoading = false;
        state.status = action.payload;
      })
      .addCase(fetchMonitoringStatusThunk.rejected, (state, action) => {
        state.isStatusLoading = false;
        state.error = (action.payload as string) || "Failed to fetch status";
      });

    // Configs
    builder
      .addCase(fetchAllConfigsThunk.pending, (state) => {
        state.isConfigsLoading = true;
        state.error = null;
      })
      .addCase(fetchAllConfigsThunk.fulfilled, (state, action) => {
        state.isConfigsLoading = false;
        state.configs = action.payload || emptyPage<BakongConfigModel>();
      })
      .addCase(fetchAllConfigsThunk.rejected, (state, action) => {
        state.isConfigsLoading = false;
        state.error = (action.payload as string) || "Failed to fetch configs";
      });

    // Create Config
    builder
      .addCase(createConfigThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createConfigThunk.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(createConfigThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = (action.payload as string) || "Failed to create config";
      });

    // Update Config
    builder
      .addCase(updateConfigThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateConfigThunk.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(updateConfigThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = (action.payload as string) || "Failed to update config";
      });

    // Delete Config
    builder
      .addCase(deleteConfigThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteConfigThunk.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(deleteConfigThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = (action.payload as string) || "Failed to delete config";
      });

    // Accounts
    builder
      .addCase(fetchAllAccountsThunk.pending, (state) => {
        state.isAccountsLoading = true;
        state.error = null;
      })
      .addCase(fetchAllAccountsThunk.fulfilled, (state, action) => {
        state.isAccountsLoading = false;
        state.accounts = action.payload || emptyPage<BakongAccountModel>();
      })
      .addCase(fetchAllAccountsThunk.rejected, (state, action) => {
        state.isAccountsLoading = false;
        state.error = (action.payload as string) || "Failed to fetch accounts";
      });

    // Create Account
    builder
      .addCase(createAccountThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createAccountThunk.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(createAccountThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = (action.payload as string) || "Failed to create account";
      });

    // Update Account
    builder
      .addCase(updateAccountThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateAccountThunk.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(updateAccountThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = (action.payload as string) || "Failed to update account";
      });

    // Delete Account
    builder
      .addCase(deleteAccountThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteAccountThunk.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(deleteAccountThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = (action.payload as string) || "Failed to delete account";
      });

    // Transactions
    builder
      .addCase(fetchTransactionsThunk.pending, (state) => {
        state.isTransactionsLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsThunk.fulfilled, (state, action) => {
        state.isTransactionsLoading = false;
        state.transactions = action.payload || emptyPage<BakongTransactionModel>();
      })
      .addCase(fetchTransactionsThunk.rejected, (state, action) => {
        state.isTransactionsLoading = false;
        state.error = (action.payload as string) || "Failed to fetch transactions";
      });
  },
});

export const {
  setStatus,
  setStatusLoading,
  updateConfigLocal,
  updateAccountLocal,
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
  resetState,
} = bakongSlice.actions;

export default bakongSlice.reducer;

