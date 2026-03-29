/**
 * ExchangeRate Management - Redux Slice
 * Manages ExchangeRate state: data, loading, errors, filters, operations
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExchangeRateManagementState } from "../models/type/exchange-rate-type";
import { ExchangeRateStatus } from "@/constants/status/status";
import {
  createExchangeRateService,
  deleteExchangeRateService,
  fetchAllExchangeRateService,
  fetchAllMyBusinessExchangeRateService,
  fetchExchangeRateByIdService,
  updateExchangeRateService,
} from "../thunks/exchange-rate-thunks";

/**
 * Initial state
 */
const initialState: ExchangeRateManagementState = {
  data: null,
  selectedExchangeRate: null,
  isLoading: true,
  error: null,
  filters: {
    search: "",
    pageNo: 1,
    isActive: ExchangeRateStatus.ALL,
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isFetchingDetail: false,
  },
};

/**
 * ExchangeRate slice
 */
const exchnageRateSlice = createSlice({
  name: "business-exchange-rates",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.filters.pageNo = 1;
    },

    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    setExchangeRateStatusFilter: (
      state,
      action: PayloadAction<ExchangeRateStatus>
    ) => {
      state.filters.isActive = action.payload;
      state.filters.pageNo = 1;
    },

    clearSelectedExchangeRate: (state) => {
      state.selectedExchangeRate = null;
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    resetState: () => {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllExchangeRateService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllExchangeRateService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllExchangeRateService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchAllMyBusinessExchangeRateService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllMyBusinessExchangeRateService.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAllMyBusinessExchangeRateService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isLoading = false;
      });

    builder
      .addCase(fetchExchangeRateByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.error = null;
        state.selectedExchangeRate = null;
      })
      .addCase(fetchExchangeRateByIdService.fulfilled, (state, action) => {
        state.selectedExchangeRate = action.payload;
        state.operations.isFetchingDetail = false;

        // Also update in list if exists (for consistency)
        if (state.data?.content) {
          const index = state.data.content.findIndex(
            (user) => user.id === action.payload.id
          );
          if (index !== -1) {
            state.data.content[index] = action.payload;
          }
        }
      })
      .addCase(fetchExchangeRateByIdService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isFetchingDetail = false;
      });

    builder
      .addCase(createExchangeRateService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createExchangeRateService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = [action.payload, ...state.data.content];
          state.data.totalElements += 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
        }
        state.operations.isCreating = false;
      })
      .addCase(createExchangeRateService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isCreating = false;
      });

    builder
      .addCase(updateExchangeRateService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateExchangeRateService.fulfilled, (state, action) => {
        state.selectedExchangeRate = action.payload;
        state.operations.isUpdating = false;

        // Update in list
        if (state.data) {
          state.data.content = state.data.content.map((user) =>
            user.id === action.payload.id ? action.payload : user
          );
        }
      })
      .addCase(updateExchangeRateService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isUpdating = false;
      });

    builder
      .addCase(deleteExchangeRateService.pending, (state) => {
        state.operations.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteExchangeRateService.fulfilled, (state, action) => {
        if (state.data) {
          state.data.content = state.data.content.filter(
            (user) => user.id !== action.payload
          );
          state.data.totalElements -= 1;
          state.data.totalPages = Math.ceil(
            state.data.totalElements / state.data.pageSize
          );
          state.data.last = state.data.pageNo >= state.data.totalPages;
          state.data.hasNext = !state.data.last;
          state.data.hasPrevious = state.data.pageNo > 1;
        }
        state.operations.isDeleting = false;
      })
      .addCase(deleteExchangeRateService.rejected, (state, action) => {
        state.error = action.payload as string;
        state.operations.isDeleting = false;
      });
  },
});

export const {
  setSearchFilter,
  setPageNo,
  clearError,
  setExchangeRateStatusFilter,
  clearSelectedExchangeRate,
  resetFilters,
  resetState,
} = exchnageRateSlice.actions;

export default exchnageRateSlice.reducer;
