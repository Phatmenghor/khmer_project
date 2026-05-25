import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectDashboardBranches,
  selectDashboardError,
  selectDashboardLoading,
  selectDashboardOrders,
  selectDashboardPayments,
  selectDashboardPeriod,
  selectDashboardSales,
  selectDashboardStock,
  selectDashboardSummary,
} from "../selectors/dashboard-selectors";

export const useDashboardState = () => {
  const dispatch = useAppDispatch();

  const period = useAppSelector(selectDashboardPeriod);
  const summary = useAppSelector(selectDashboardSummary);
  const sales = useAppSelector(selectDashboardSales);
  const payments = useAppSelector(selectDashboardPayments);
  const stock = useAppSelector(selectDashboardStock);
  const orders = useAppSelector(selectDashboardOrders);
  const branches = useAppSelector(selectDashboardBranches);
  const loading = useAppSelector(selectDashboardLoading);
  const error = useAppSelector(selectDashboardError);

  return {
    period,
    summary,
    sales,
    payments,
    stock,
    orders,
    branches,
    loading,
    error,
    dispatch,
  };
};
