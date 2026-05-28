import { RootState } from "@/redux/store";

export const selectOwnerDashboardPeriod = (state: RootState) =>
  state.ownerDashboard.period;

export const selectOwnerDashboardSummary = (state: RootState) =>
  state.ownerDashboard.summary;

export const selectOwnerDashboardTrends = (state: RootState) =>
  state.ownerDashboard.trends;

export const selectOwnerDashboardStatusBreakdown = (state: RootState) =>
  state.ownerDashboard.statusBreakdown;

export const selectOwnerDashboardRecentOwners = (state: RootState) =>
  state.ownerDashboard.recentOwners;

export const selectOwnerDashboardPlanBreakdown = (state: RootState) =>
  state.ownerDashboard.planBreakdown;

export const selectOwnerDashboardLoading = (state: RootState) =>
  state.ownerDashboard.loading;

export const selectOwnerDashboardError = (state: RootState) =>
  state.ownerDashboard.error;
