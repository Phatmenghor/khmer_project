/**
 * ExchangeRate Management - Redux Slice
 * Manages ExchangeRate state: data, loading, errors, filters, operations
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExchangeRateManagementState } from "../models/type/exchange-rate-type";
import { ExchangeRateStatus } from "@/constants/status/status";
import { ExchangeRateResponseModel } from "../models/response/exchange-rate-response";
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

    // Optimistic update actions
    updateExchangeRateInList: (
      state,
      action: PayloadAction<ExchangeRateResponseModel>
    ) => {
      if (state.data?.content) {
        // If updating to ACTIVE, deactivate all other rates
        if (action.payload.status === "ACTIVE") {
          state.data.content = state.data.content.map((rate) =>
            rate.id === action.payload.id
              ? action.payload
              : { ...rate, status: "INACTIVE" as const }
          );
        } else if (action.payload.status === "INACTIVE") {
          // If deactivating the only ACTIVE rate, activate the most recently created one
          const currentRate = state.data.content.find(
            (rate) => rate.id === action.payload.id
          );
          const isCurrentRateActive = currentRate?.status === "ACTIVE";
          const activeRatesCount = state.data.content.filter(
            (rate) => rate.status === "ACTIVE"
          ).length;

          if (isCurrentRateActive && activeRatesCount === 1) {
            // Find the most recently created INACTIVE rate (sorted by createdAt desc)
            const inactiveRates = state.data.content
              .filter((rate) => rate.status === "INACTIVE" && rate.id !== action.payload.id)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            if (inactiveRates.length > 0) {
              // Activate the most recent INACTIVE rate
              const rateToActivate = inactiveRates[0];
              state.data.content = state.data.content.map((rate) => {
                if (rate.id === action.payload.id) {
                  return action.payload; // Deactivate the current rate
                } else if (rate.id === rateToActivate.id) {
                  return { ...rate, status: "ACTIVE" as const }; // Activate the next one
                }
                return rate;
              });
            } else {
              // No other inactive rates, just update the current one
              const index = state.data.content.findIndex(
                (rate) => rate.id === action.payload.id
              );
              if (index !== -1) {
                state.data.content[index] = action.payload;
              }
            }
          } else {
            // Not the only active rate or already inactive, just update the specific rate
            const index = state.data.content.findIndex(
              (rate) => rate.id === action.payload.id
            );
            if (index !== -1) {
              state.data.content[index] = action.payload;
            }
          }
        } else {
          // For any other status updates, just update the specific rate
          const index = state.data.content.findIndex(
            (rate) => rate.id === action.payload.id
          );
          if (index !== -1) {
            state.data.content[index] = action.payload;
          }
        }
      }
    },

    addExchangeRateToList: (
      state,
      action: PayloadAction<ExchangeRateResponseModel>
    ) => {
      if (state.data) {
        state.data.content = [action.payload, ...state.data.content];
        state.data.totalElements += 1;
        state.data.totalPages = Math.ceil(
          state.data.totalElements / state.data.pageSize
        );
      }
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
          // Extract ID from payload (could be string or object)
          const deletedId = typeof action.payload === 'string' ? action.payload : action.payload?.id;

          state.data.content = state.data.content.filter(
            (rate) => rate.id !== deletedId
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
  updateExchangeRateInList,
  addExchangeRateToList,
} = exchnageRateSlice.actions;

export default exchnageRateSlice.reducer;
