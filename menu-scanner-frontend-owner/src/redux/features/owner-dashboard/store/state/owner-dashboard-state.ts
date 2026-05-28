import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectOwnerDashboardPeriod,
  selectOwnerDashboardSummary,
  selectOwnerDashboardTrends,
  selectOwnerDashboardStatusBreakdown,
  selectOwnerDashboardRecentOwners,
  selectOwnerDashboardPlanBreakdown,
  selectOwnerDashboardLoading,
  selectOwnerDashboardError,
} from "../selectors/owner-dashboard-selectors";

export function useOwnerDashboardState() {
  const dispatch = useAppDispatch();
  const period = useAppSelector(selectOwnerDashboardPeriod);
  const summary = useAppSelector(selectOwnerDashboardSummary);
  const trends = useAppSelector(selectOwnerDashboardTrends);
  const statusBreakdown = useAppSelector(selectOwnerDashboardStatusBreakdown);
  const recentOwners = useAppSelector(selectOwnerDashboardRecentOwners);
  const planBreakdown = useAppSelector(selectOwnerDashboardPlanBreakdown);
  const loading = useAppSelector(selectOwnerDashboardLoading);
  const error = useAppSelector(selectOwnerDashboardError);

  return {
    dispatch,
    period,
    summary,
    trends,
    statusBreakdown,
    recentOwners,
    planBreakdown,
    loading,
    error,
  };
}
