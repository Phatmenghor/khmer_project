import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectOwnerDashboardSummary,
  selectOwnerDashboardTrends,
  selectOwnerDashboardStatusBreakdown,
  selectOwnerDashboardRecentOwners,
  selectOwnerDashboardPlanBreakdown,
  selectOwnerDashboardCustomerTrends,
  selectOwnerDashboardUserTrends,
  selectOwnerDashboardPaymentTrends,
  selectOwnerDashboardLoading,
  selectOwnerDashboardError,
} from "../selectors/owner-dashboard-selectors";

export function useOwnerDashboardState() {
  const dispatch = useAppDispatch();
  return {
    dispatch,
    summary: useAppSelector(selectOwnerDashboardSummary),
    trends: useAppSelector(selectOwnerDashboardTrends),
    statusBreakdown: useAppSelector(selectOwnerDashboardStatusBreakdown),
    recentOwners: useAppSelector(selectOwnerDashboardRecentOwners),
    planBreakdown: useAppSelector(selectOwnerDashboardPlanBreakdown),
    customerTrends: useAppSelector(selectOwnerDashboardCustomerTrends),
    userTrends: useAppSelector(selectOwnerDashboardUserTrends),
    paymentTrends: useAppSelector(selectOwnerDashboardPaymentTrends),
    loading: useAppSelector(selectOwnerDashboardLoading),
    error: useAppSelector(selectOwnerDashboardError),
  };
}
