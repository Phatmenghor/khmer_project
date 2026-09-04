import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SubscriptionHistoryManagementState } from "../models/type/subscription-history-type";
import {
  fetchAllSubscriptionHistoryService,
  fetchSubscriptionHistoryByIdService,
  fetchMySubscriptionSummaryService,
} from "../thunks/subscription-history-thunks";

const initialState: SubscriptionHistoryManagementState = {
  data: null,
  selectedHistory: null,
  mySummary: null,
  isLoading: false,
  error: null,
  filters: {
    businessId: "",
    planId: "",
    fromDate: "",
    toDate: "",
    status: "",
    pageNo: 1,
  },
  operations: {
    isFetchingDetail: false,
    isFetchingSummary: false,
  },
};

const subscriptionHistorySlice = createSlice({
  name: "subscription-history",
  initialState,
  reducers: {
    setBusinessIdFilter: (state, action: PayloadAction<string>) => {
      state.filters.businessId = action.payload;
      state.filters.pageNo = 1;
    },
    setPlanIdFilter: (state, action: PayloadAction<string>) => {
      state.filters.planId = action.payload;
      state.filters.pageNo = 1;
    },
    setFromDateFilter: (state, action: PayloadAction<string>) => {
      state.filters.fromDate = action.payload;
      state.filters.pageNo = 1;
    },
    setToDateFilter: (state, action: PayloadAction<string>) => {
      state.filters.toDate = action.payload;
      state.filters.pageNo = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
      state.filters.pageNo = 1;
    },
    setPageNo: (state, action: PayloadAction<number>) => {
      state.filters.pageNo = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSelectedHistory: (state) => {
      state.selectedHistory = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSubscriptionHistoryService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllSubscriptionHistoryService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchAllSubscriptionHistoryService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchSubscriptionHistoryByIdService.pending, (state) => {
        state.operations.isFetchingDetail = true;
        state.selectedHistory = null;
        state.error = null;
      })
      .addCase(fetchSubscriptionHistoryByIdService.fulfilled, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.selectedHistory = action.payload;
      })
      .addCase(fetchSubscriptionHistoryByIdService.rejected, (state, action) => {
        state.operations.isFetchingDetail = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchMySubscriptionSummaryService.pending, (state) => {
        state.operations.isFetchingSummary = true;
        state.error = null;
      })
      .addCase(fetchMySubscriptionSummaryService.fulfilled, (state, action) => {
        state.operations.isFetchingSummary = false;
        state.mySummary = action.payload;
      })
      .addCase(fetchMySubscriptionSummaryService.rejected, (state, action) => {
        state.operations.isFetchingSummary = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setBusinessIdFilter,
  setPlanIdFilter,
  setFromDateFilter,
  setToDateFilter,
  setStatusFilter,
  setPageNo,
  resetFilters,
  clearSelectedHistory,
  clearError,
} = subscriptionHistorySlice.actions;

export default subscriptionHistorySlice.reducer;
