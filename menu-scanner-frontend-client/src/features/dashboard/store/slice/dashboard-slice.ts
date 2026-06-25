import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DashboardCustomerGrowthResponse,
  DashboardHourlySalesResponse,
  DashboardOrdersResponse,
  DashboardPaymentsResponse,
  DashboardPeriod,
  DashboardSalesResponse,
  DashboardStockResponse,
  DashboardSummaryResponse,
  DashboardTopProductsResponse,
} from "../models/response/dashboard-response";
import {
  fetchDashboardCustomerGrowthService,
  fetchDashboardHourlySalesService,
  fetchDashboardOrdersService,
  fetchDashboardPaymentsService,
  fetchDashboardSalesService,
  fetchDashboardStockService,
  fetchDashboardSummaryService,
  fetchDashboardTopProductsService,
} from "../thunks/dashboard-thunks";

interface DashboardState {
  period: DashboardPeriod;

  summary: DashboardSummaryResponse | null;
  sales: DashboardSalesResponse | null;
  payments: DashboardPaymentsResponse | null;
  stock: DashboardStockResponse | null;
  orders: DashboardOrdersResponse | null;
  topProducts: DashboardTopProductsResponse | null;
  hourlySales: DashboardHourlySalesResponse | null;
  customerGrowth: DashboardCustomerGrowthResponse | null;

  loading: {
    summary: boolean;
    sales: boolean;
    payments: boolean;
    stock: boolean;
    orders: boolean;
    topProducts: boolean;
    hourlySales: boolean;
    customerGrowth: boolean;
  };

  error: string | null;
}

const initialState: DashboardState = {
  period: "ALL",

  summary: null,
  sales: null,
  payments: null,
  stock: null,
  orders: null,
  topProducts: null,
  hourlySales: null,
  customerGrowth: null,

  loading: {
    summary: true,
    sales: true,
    payments: true,
    stock: true,
    orders: true,
    topProducts: true,
    hourlySales: true,
    customerGrowth: true,
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
      .addCase(fetchDashboardTopProductsService.pending, (state) => { state.loading.topProducts = true; })
      .addCase(fetchDashboardTopProductsService.fulfilled, (state, action) => { state.topProducts = action.payload; state.loading.topProducts = false; })
      .addCase(fetchDashboardTopProductsService.rejected, (state) => { state.loading.topProducts = false; });

    builder
      .addCase(fetchDashboardHourlySalesService.pending, (state) => { state.loading.hourlySales = true; })
      .addCase(fetchDashboardHourlySalesService.fulfilled, (state, action) => { state.hourlySales = action.payload; state.loading.hourlySales = false; })
      .addCase(fetchDashboardHourlySalesService.rejected, (state) => { state.loading.hourlySales = false; });

    builder
      .addCase(fetchDashboardCustomerGrowthService.pending, (state) => { state.loading.customerGrowth = true; })
      .addCase(fetchDashboardCustomerGrowthService.fulfilled, (state, action) => { state.customerGrowth = action.payload; state.loading.customerGrowth = false; })
      .addCase(fetchDashboardCustomerGrowthService.rejected, (state) => { state.loading.customerGrowth = false; });
  },
});

export const { setPeriod, clearError, resetState } = dashboardSlice.actions;
export default dashboardSlice.reducer;
