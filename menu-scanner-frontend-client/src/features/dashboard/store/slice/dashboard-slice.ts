import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DashboardBranchesResponse,
  DashboardCustomerStatsResponse,
  DashboardHourlySalesResponse,
  DashboardOrdersResponse,
  DashboardPaymentsResponse,
  DashboardPeriod,
  DashboardPromotionsResponse,
  DashboardSalesResponse,
  DashboardStockResponse,
  DashboardSummaryResponse,
  DashboardTargetResponse,
  DashboardTopProductsResponse,
} from "../models/response/dashboard-response";
import {
  fetchDashboardBranchesService,
  fetchDashboardCustomerStatsService,
  fetchDashboardHourlySalesService,
  fetchDashboardOrdersService,
  fetchDashboardPaymentsService,
  fetchDashboardPromotionsService,
  fetchDashboardSalesService,
  fetchDashboardStockService,
  fetchDashboardSummaryService,
  fetchDashboardTargetService,
  fetchDashboardTopProductsService,
} from "../thunks/dashboard-thunks";

interface DashboardState {
  period: DashboardPeriod;

  summary: DashboardSummaryResponse | null;
  sales: DashboardSalesResponse | null;
  payments: DashboardPaymentsResponse | null;
  stock: DashboardStockResponse | null;
  orders: DashboardOrdersResponse | null;
  branches: DashboardBranchesResponse | null;
  topProducts: DashboardTopProductsResponse | null;
  hourlySales: DashboardHourlySalesResponse | null;
  customerStats: DashboardCustomerStatsResponse | null;
  target: DashboardTargetResponse | null;
  promotions: DashboardPromotionsResponse | null;

  loading: {
    summary: boolean;
    sales: boolean;
    payments: boolean;
    stock: boolean;
    orders: boolean;
    branches: boolean;
    topProducts: boolean;
    hourlySales: boolean;
    customerStats: boolean;
    target: boolean;
    promotions: boolean;
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
  topProducts: null,
  hourlySales: null,
  customerStats: null,
  target: null,
  promotions: null,

  loading: {
    summary: true,
    sales: true,
    payments: true,
    stock: true,
    orders: true,
    branches: true,
    topProducts: true,
    hourlySales: true,
    customerStats: true,
    target: true,
    promotions: true,
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
    builder
      .addCase(fetchDashboardSummaryService.pending, (state) => { state.loading.summary = true; state.error = null; })
      .addCase(fetchDashboardSummaryService.fulfilled, (state, action) => { state.summary = action.payload; state.loading.summary = false; })
      .addCase(fetchDashboardSummaryService.rejected, (state, action) => { state.loading.summary = false; state.error = action.payload as string; });

    builder
      .addCase(fetchDashboardSalesService.pending, (state) => { state.loading.sales = true; })
      .addCase(fetchDashboardSalesService.fulfilled, (state, action) => { state.sales = action.payload; state.loading.sales = false; })
      .addCase(fetchDashboardSalesService.rejected, (state) => { state.loading.sales = false; });

    builder
      .addCase(fetchDashboardPaymentsService.pending, (state) => { state.loading.payments = true; })
      .addCase(fetchDashboardPaymentsService.fulfilled, (state, action) => { state.payments = action.payload; state.loading.payments = false; })
      .addCase(fetchDashboardPaymentsService.rejected, (state) => { state.loading.payments = false; });

    builder
      .addCase(fetchDashboardStockService.pending, (state) => { state.loading.stock = true; })
      .addCase(fetchDashboardStockService.fulfilled, (state, action) => { state.stock = action.payload; state.loading.stock = false; })
      .addCase(fetchDashboardStockService.rejected, (state) => { state.loading.stock = false; });

    builder
      .addCase(fetchDashboardOrdersService.pending, (state) => { state.loading.orders = true; })
      .addCase(fetchDashboardOrdersService.fulfilled, (state, action) => { state.orders = action.payload; state.loading.orders = false; })
      .addCase(fetchDashboardOrdersService.rejected, (state) => { state.loading.orders = false; });

    builder
      .addCase(fetchDashboardBranchesService.pending, (state) => { state.loading.branches = true; })
      .addCase(fetchDashboardBranchesService.fulfilled, (state, action) => { state.branches = action.payload; state.loading.branches = false; })
      .addCase(fetchDashboardBranchesService.rejected, (state) => { state.loading.branches = false; });

    builder
      .addCase(fetchDashboardTopProductsService.pending, (state) => { state.loading.topProducts = true; })
      .addCase(fetchDashboardTopProductsService.fulfilled, (state, action) => { state.topProducts = action.payload; state.loading.topProducts = false; })
      .addCase(fetchDashboardTopProductsService.rejected, (state) => { state.loading.topProducts = false; });

    builder
      .addCase(fetchDashboardHourlySalesService.pending, (state) => { state.loading.hourlySales = true; })
      .addCase(fetchDashboardHourlySalesService.fulfilled, (state, action) => { state.hourlySales = action.payload; state.loading.hourlySales = false; })
      .addCase(fetchDashboardHourlySalesService.rejected, (state) => { state.loading.hourlySales = false; });

    builder
      .addCase(fetchDashboardCustomerStatsService.pending, (state) => { state.loading.customerStats = true; })
      .addCase(fetchDashboardCustomerStatsService.fulfilled, (state, action) => { state.customerStats = action.payload; state.loading.customerStats = false; })
      .addCase(fetchDashboardCustomerStatsService.rejected, (state) => { state.loading.customerStats = false; });

    builder
      .addCase(fetchDashboardTargetService.pending, (state) => { state.loading.target = true; })
      .addCase(fetchDashboardTargetService.fulfilled, (state, action) => { state.target = action.payload; state.loading.target = false; })
      .addCase(fetchDashboardTargetService.rejected, (state) => { state.loading.target = false; });

    builder
      .addCase(fetchDashboardPromotionsService.pending, (state) => { state.loading.promotions = true; })
      .addCase(fetchDashboardPromotionsService.fulfilled, (state, action) => { state.promotions = action.payload; state.loading.promotions = false; })
      .addCase(fetchDashboardPromotionsService.rejected, (state) => { state.loading.promotions = false; });
  },
});

export const { setPeriod, clearError, resetState } = dashboardSlice.actions;
export default dashboardSlice.reducer;
