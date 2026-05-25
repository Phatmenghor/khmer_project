import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DashboardBranchesResponse,
  DashboardOrdersResponse,
  DashboardPaymentsResponse,
  DashboardPeriod,
  DashboardSalesResponse,
  DashboardStockResponse,
  DashboardSummaryResponse,
} from "../models/response/dashboard-response";
import {
  fetchDashboardBranchesService,
  fetchDashboardOrdersService,
  fetchDashboardPaymentsService,
  fetchDashboardSalesService,
  fetchDashboardStockService,
  fetchDashboardSummaryService,
} from "../thunks/dashboard-thunks";

interface DashboardState {
  period: DashboardPeriod;

  summary: DashboardSummaryResponse | null;
  sales: DashboardSalesResponse | null;
  payments: DashboardPaymentsResponse | null;
  stock: DashboardStockResponse | null;
  orders: DashboardOrdersResponse | null;
  branches: DashboardBranchesResponse | null;

  loading: {
    summary: boolean;
    sales: boolean;
    payments: boolean;
    stock: boolean;
    orders: boolean;
    branches: boolean;
  };

  error: string | null;
}

const initialState: DashboardState = {
  period: "TODAY",

  summary: null,
  sales: null,
  payments: null,
  stock: null,
  orders: null,
  branches: null,

  loading: {
    summary: true,
    sales: true,
    payments: true,
    stock: true,
    orders: true,
    branches: true,
  },

  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setPeriod: (state, action: PayloadAction<DashboardPeriod>) => {
      state.period = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Summary
    builder
      .addCase(fetchDashboardSummaryService.pending, (state) => {
        state.loading.summary = true;
        state.error = null;
      })
      .addCase(fetchDashboardSummaryService.fulfilled, (state, action) => {
        state.summary = action.payload;
        state.loading.summary = false;
      })
      .addCase(fetchDashboardSummaryService.rejected, (state, action) => {
        state.loading.summary = false;
        state.error = action.payload as string;
      });

    // Sales
    builder
      .addCase(fetchDashboardSalesService.pending, (state) => {
        state.loading.sales = true;
      })
      .addCase(fetchDashboardSalesService.fulfilled, (state, action) => {
        state.sales = action.payload;
        state.loading.sales = false;
      })
      .addCase(fetchDashboardSalesService.rejected, (state) => {
        state.loading.sales = false;
      });

    // Payments
    builder
      .addCase(fetchDashboardPaymentsService.pending, (state) => {
        state.loading.payments = true;
      })
      .addCase(fetchDashboardPaymentsService.fulfilled, (state, action) => {
        state.payments = action.payload;
        state.loading.payments = false;
      })
      .addCase(fetchDashboardPaymentsService.rejected, (state) => {
        state.loading.payments = false;
      });

    // Stock
    builder
      .addCase(fetchDashboardStockService.pending, (state) => {
        state.loading.stock = true;
      })
      .addCase(fetchDashboardStockService.fulfilled, (state, action) => {
        state.stock = action.payload;
        state.loading.stock = false;
      })
      .addCase(fetchDashboardStockService.rejected, (state) => {
        state.loading.stock = false;
      });

    // Orders
    builder
      .addCase(fetchDashboardOrdersService.pending, (state) => {
        state.loading.orders = true;
      })
      .addCase(fetchDashboardOrdersService.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading.orders = false;
      })
      .addCase(fetchDashboardOrdersService.rejected, (state) => {
        state.loading.orders = false;
      });

    // Branches
    builder
      .addCase(fetchDashboardBranchesService.pending, (state) => {
        state.loading.branches = true;
      })
      .addCase(fetchDashboardBranchesService.fulfilled, (state, action) => {
        state.branches = action.payload;
        state.loading.branches = false;
      })
      .addCase(fetchDashboardBranchesService.rejected, (state) => {
        state.loading.branches = false;
      });
  },
});

export const { setPeriod, clearError, resetState } = dashboardSlice.actions;
export default dashboardSlice.reducer;
