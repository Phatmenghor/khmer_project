import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectDashboardBranches,
  selectDashboardCustomerStats,
  selectDashboardError,
  selectDashboardHourlySales,
  selectDashboardLoading,
  selectDashboardOrders,
  selectDashboardPayments,
  selectDashboardPeriod,
  selectDashboardPromotions,
  selectDashboardSales,
  selectDashboardStock,
  selectDashboardSummary,
  selectDashboardTarget,
  selectDashboardTopProducts,
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
  const topProducts = useAppSelector(selectDashboardTopProducts);
  const hourlySales = useAppSelector(selectDashboardHourlySales);
  const customerStats = useAppSelector(selectDashboardCustomerStats);
  const target = useAppSelector(selectDashboardTarget);
  const promotions = useAppSelector(selectDashboardPromotions);
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
    topProducts,
    hourlySales,
    customerStats,
    target,
    promotions,
    loading,
    error,
    dispatch,
  };
};
