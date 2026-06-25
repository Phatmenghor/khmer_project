import { createSelector } from "reselect";
import { RootState } from "@/store";

const selectDashboardState = (state: RootState) => state.dashboard;

export const selectDashboardPeriod = createSelector(selectDashboardState, (s) => s.period);
export const selectDashboardSummary = createSelector(selectDashboardState, (s) => s.summary);
export const selectDashboardSales = createSelector(selectDashboardState, (s) => s.sales);
export const selectDashboardPayments = createSelector(selectDashboardState, (s) => s.payments);
export const selectDashboardStock = createSelector(selectDashboardState, (s) => s.stock);
export const selectDashboardOrders = createSelector(selectDashboardState, (s) => s.orders);
export const selectDashboardTopProducts = createSelector(selectDashboardState, (s) => s.topProducts);
export const selectDashboardHourlySales = createSelector(selectDashboardState, (s) => s.hourlySales);
export const selectDashboardCustomerStats = createSelector(selectDashboardState, (s) => s.customerStats);
export const selectDashboardLoading = createSelector(selectDashboardState, (s) => s.loading);
export const selectDashboardError = createSelector(selectDashboardState, (s) => s.error);
