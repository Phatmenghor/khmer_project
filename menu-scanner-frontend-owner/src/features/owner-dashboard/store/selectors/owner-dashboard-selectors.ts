import { RootState } from "@/store";

export const selectOwnerDashboardSummary = (s: RootState) => s.ownerDashboard.summary;
export const selectOwnerDashboardTrends = (s: RootState) => s.ownerDashboard.trends;
export const selectOwnerDashboardStatusBreakdown = (s: RootState) => s.ownerDashboard.statusBreakdown;
export const selectOwnerDashboardRecentOwners = (s: RootState) => s.ownerDashboard.recentOwners;
export const selectOwnerDashboardPlanBreakdown = (s: RootState) => s.ownerDashboard.planBreakdown;
export const selectOwnerDashboardCustomerTrends = (s: RootState) => s.ownerDashboard.customerTrends;
export const selectOwnerDashboardUserTrends = (s: RootState) => s.ownerDashboard.userTrends;
export const selectOwnerDashboardPaymentTrends = (s: RootState) => s.ownerDashboard.paymentTrends;
export const selectOwnerDashboardLoading = (s: RootState) => s.ownerDashboard.loading;
export const selectOwnerDashboardError = (s: RootState) => s.ownerDashboard.error;
