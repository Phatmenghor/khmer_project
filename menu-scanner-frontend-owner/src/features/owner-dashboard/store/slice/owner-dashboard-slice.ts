import { createSlice } from "@reduxjs/toolkit";
import {
  OwnerDashboardSummaryResponse,
  OwnerDashboardTrendsResponse,
  OwnerDashboardStatusBreakdownResponse,
  OwnerDashboardRecentOwnersResponse,
  OwnerDashboardPlanBreakdownResponse,
  OwnerDashboardDailyTrendsResponse,
} from "../models/response/owner-dashboard-response";
import {
  fetchOwnerDashboardSummaryService,
  fetchOwnerDashboardTrendsService,
  fetchOwnerDashboardStatusBreakdownService,
  fetchOwnerDashboardRecentOwnersService,
  fetchOwnerDashboardPlanBreakdownService,
  fetchOwnerDashboardCustomerTrendsService,
  fetchOwnerDashboardUserTrendsService,
  fetchOwnerDashboardPaymentTrendsService,
} from "../thunks/owner-dashboard-thunks";

interface OwnerDashboardState {
  summary: OwnerDashboardSummaryResponse | null;
  trends: OwnerDashboardTrendsResponse | null;
  statusBreakdown: OwnerDashboardStatusBreakdownResponse | null;
  recentOwners: OwnerDashboardRecentOwnersResponse | null;
  planBreakdown: OwnerDashboardPlanBreakdownResponse | null;
  customerTrends: OwnerDashboardDailyTrendsResponse | null;
  userTrends: OwnerDashboardDailyTrendsResponse | null;
  paymentTrends: OwnerDashboardDailyTrendsResponse | null;
  loading: {
    summary: boolean;
    trends: boolean;
    statusBreakdown: boolean;
    recentOwners: boolean;
    planBreakdown: boolean;
    customerTrends: boolean;
    userTrends: boolean;
    paymentTrends: boolean;
  };
  error: string | null;
}

const initialState: OwnerDashboardState = {
  summary: null,
  trends: null,
  statusBreakdown: null,
  recentOwners: null,
  planBreakdown: null,
  customerTrends: null,
  userTrends: null,
  paymentTrends: null,
  loading: {
    summary: false,
    trends: false,
    statusBreakdown: false,
    recentOwners: false,
    planBreakdown: false,
    customerTrends: false,
    userTrends: false,
    paymentTrends: false,
  },
  error: null,
};

const ownerDashboardSlice = createSlice({
  name: "ownerDashboard",
  initialState,
  reducers: {
    resetState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOwnerDashboardSummaryService.pending, (s) => { s.loading.summary = true; s.error = null; })
      .addCase(fetchOwnerDashboardSummaryService.fulfilled, (s, a) => { s.loading.summary = false; s.summary = a.payload; })
      .addCase(fetchOwnerDashboardSummaryService.rejected, (s, a) => { s.loading.summary = false; s.error = a.payload as string; });

    builder
      .addCase(fetchOwnerDashboardTrendsService.pending, (s) => { s.loading.trends = true; s.error = null; })
      .addCase(fetchOwnerDashboardTrendsService.fulfilled, (s, a) => { s.loading.trends = false; s.trends = a.payload; })
      .addCase(fetchOwnerDashboardTrendsService.rejected, (s, a) => { s.loading.trends = false; s.error = a.payload as string; });

    builder
      .addCase(fetchOwnerDashboardStatusBreakdownService.pending, (s) => { s.loading.statusBreakdown = true; s.error = null; })
      .addCase(fetchOwnerDashboardStatusBreakdownService.fulfilled, (s, a) => { s.loading.statusBreakdown = false; s.statusBreakdown = a.payload; })
      .addCase(fetchOwnerDashboardStatusBreakdownService.rejected, (s, a) => { s.loading.statusBreakdown = false; s.error = a.payload as string; });

    builder
      .addCase(fetchOwnerDashboardRecentOwnersService.pending, (s) => { s.loading.recentOwners = true; s.error = null; })
      .addCase(fetchOwnerDashboardRecentOwnersService.fulfilled, (s, a) => { s.loading.recentOwners = false; s.recentOwners = a.payload; })
      .addCase(fetchOwnerDashboardRecentOwnersService.rejected, (s, a) => { s.loading.recentOwners = false; s.error = a.payload as string; });

    builder
      .addCase(fetchOwnerDashboardPlanBreakdownService.pending, (s) => { s.loading.planBreakdown = true; s.error = null; })
      .addCase(fetchOwnerDashboardPlanBreakdownService.fulfilled, (s, a) => { s.loading.planBreakdown = false; s.planBreakdown = a.payload; })
      .addCase(fetchOwnerDashboardPlanBreakdownService.rejected, (s, a) => { s.loading.planBreakdown = false; s.error = a.payload as string; });

    builder
      .addCase(fetchOwnerDashboardCustomerTrendsService.pending, (s) => { s.loading.customerTrends = true; s.error = null; })
      .addCase(fetchOwnerDashboardCustomerTrendsService.fulfilled, (s, a) => { s.loading.customerTrends = false; s.customerTrends = a.payload; })
      .addCase(fetchOwnerDashboardCustomerTrendsService.rejected, (s, a) => { s.loading.customerTrends = false; s.error = a.payload as string; });

    builder
      .addCase(fetchOwnerDashboardUserTrendsService.pending, (s) => { s.loading.userTrends = true; s.error = null; })
      .addCase(fetchOwnerDashboardUserTrendsService.fulfilled, (s, a) => { s.loading.userTrends = false; s.userTrends = a.payload; })
      .addCase(fetchOwnerDashboardUserTrendsService.rejected, (s, a) => { s.loading.userTrends = false; s.error = a.payload as string; });

    builder
      .addCase(fetchOwnerDashboardPaymentTrendsService.pending, (s) => { s.loading.paymentTrends = true; s.error = null; })
      .addCase(fetchOwnerDashboardPaymentTrendsService.fulfilled, (s, a) => { s.loading.paymentTrends = false; s.paymentTrends = a.payload; })
      .addCase(fetchOwnerDashboardPaymentTrendsService.rejected, (s, a) => { s.loading.paymentTrends = false; s.error = a.payload as string; });
  },
});

export const { resetState } = ownerDashboardSlice.actions;
export default ownerDashboardSlice.reducer;
