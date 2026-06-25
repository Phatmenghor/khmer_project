import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectDashboardCustomerGrowth,
  selectDashboardError,
  selectDashboardHourlySales,
  selectDashboardLoading,
  selectDashboardOrders,
  selectDashboardPayments,
  selectDashboardPeriod,
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
  const topProducts = useAppSelector(selectDashboardTopProducts);
  const hourlySales = useAppSelector(selectDashboardHourlySales);
  const customerGrowth = useAppSelector(selectDashboardCustomerGrowth);
  const loading = useAppSelector(selectDashboardLoading);
  const error = useAppSelector(selectDashboardError);

  return {
    period,
    summary,
    sales,
    payments,
    stock,
    orders,
    topProducts,
    hourlySales,
    customerGrowth,
    loading,
    error,
    dispatch,
  };
};
