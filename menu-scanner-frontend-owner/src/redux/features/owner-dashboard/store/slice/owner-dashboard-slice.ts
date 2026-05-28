import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  OwnerDashboardPeriod,
  OwnerDashboardSummaryResponse,
  OwnerDashboardTrendsResponse,
  OwnerDashboardStatusBreakdownResponse,
  OwnerDashboardRecentOwnersResponse,
  OwnerDashboardPlanBreakdownResponse,
} from "../models/response/owner-dashboard-response";
import {
  fetchOwnerDashboardSummaryService,
  fetchOwnerDashboardTrendsService,
  fetchOwnerDashboardStatusBreakdownService,
  fetchOwnerDashboardRecentOwnersService,
  fetchOwnerDashboardPlanBreakdownService,
} from "../thunks/owner-dashboard-thunks";

interface OwnerDashboardState {
  period: OwnerDashboardPeriod;
  summary: OwnerDashboardSummaryResponse | null;
  trends: OwnerDashboardTrendsResponse | null;
  statusBreakdown: OwnerDashboardStatusBreakdownResponse | null;
  recentOwners: OwnerDashboardRecentOwnersResponse | null;
  planBreakdown: OwnerDashboardPlanBreakdownResponse | null;
  loading: {
    summary: boolean;
    trends: boolean;
    statusBreakdown: boolean;
    recentOwners: boolean;
    planBreakdown: boolean;
  };
  error: string | null;
}

const initialState: OwnerDashboardState = {
  period: "30D",
  summary: null,
  trends: null,
  statusBreakdown: null,
  recentOwners: null,
  planBreakdown: null,
  loading: {
    summary: false,
    trends: false,
    statusBreakdown: false,
    recentOwners: false,
    planBreakdown: false,
  },
  error: null,
};

const ownerDashboardSlice = createSlice({
  name: "ownerDashboard",
  initialState,
  reducers: {
    setPeriod(state, action: PayloadAction<OwnerDashboardPeriod>) {
      state.period = action.payload;
    },
    resetState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Summary
    builder
      .addCase(fetchOwnerDashboardSummaryService.pending, (state) => {
        state.loading.summary = true;
        state.error = null;
      })
      .addCase(fetchOwnerDashboardSummaryService.fulfilled, (state, action) => {
        state.loading.summary = false;
        state.summary = action.payload;
      })
      .addCase(fetchOwnerDashboardSummaryService.rejected, (state, action) => {
        state.loading.summary = false;
        state.error = action.payload as string;
      });

    // Trends
    builder
      .addCase(fetchOwnerDashboardTrendsService.pending, (state) => {
        state.loading.trends = true;
        state.error = null;
      })
      .addCase(fetchOwnerDashboardTrendsService.fulfilled, (state, action) => {
        state.loading.trends = false;
        state.trends = action.payload;
      })
      .addCase(fetchOwnerDashboardTrendsService.rejected, (state, action) => {
        state.loading.trends = false;
        state.error = action.payload as string;
      });

    // Status Breakdown
    builder
      .addCase(fetchOwnerDashboardStatusBreakdownService.pending, (state) => {
        state.loading.statusBreakdown = true;
        state.error = null;
      })
      .addCase(
        fetchOwnerDashboardStatusBreakdownService.fulfilled,
        (state, action) => {
          state.loading.statusBreakdown = false;
          state.statusBreakdown = action.payload;
        }
      )
      .addCase(
        fetchOwnerDashboardStatusBreakdownService.rejected,
        (state, action) => {
          state.loading.statusBreakdown = false;
          state.error = action.payload as string;
        }
      );

    // Recent Owners
    builder
      .addCase(fetchOwnerDashboardRecentOwnersService.pending, (state) => {
        state.loading.recentOwners = true;
        state.error = null;
      })
      .addCase(
        fetchOwnerDashboardRecentOwnersService.fulfilled,
        (state, action) => {
          state.loading.recentOwners = false;
          state.recentOwners = action.payload;
        }
      )
      .addCase(
        fetchOwnerDashboardRecentOwnersService.rejected,
        (state, action) => {
          state.loading.recentOwners = false;
          state.error = action.payload as string;
        }
      );

    // Plan Breakdown
    builder
      .addCase(fetchOwnerDashboardPlanBreakdownService.pending, (state) => {
        state.loading.planBreakdown = true;
        state.error = null;
      })
      .addCase(
        fetchOwnerDashboardPlanBreakdownService.fulfilled,
        (state, action) => {
          state.loading.planBreakdown = false;
          state.planBreakdown = action.payload;
        }
      )
      .addCase(
        fetchOwnerDashboardPlanBreakdownService.rejected,
        (state, action) => {
          state.loading.planBreakdown = false;
          state.error = action.payload as string;
        }
      );
  },
});

export const { setPeriod, resetState } = ownerDashboardSlice.actions;
export default ownerDashboardSlice.reducer;
