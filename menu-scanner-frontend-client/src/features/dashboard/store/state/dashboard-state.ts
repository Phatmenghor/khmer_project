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
    promotions,
    loading,
    error,
    dispatch,
  };
};
