"use client";

import { useCallback, useEffect } from "react";
import { format } from "date-fns";
import { showToast } from "@/components/shared/common/show-toast";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { useDashboardWebSocket } from "@/hooks/use-dashboard-websocket";
import { useDashboardState } from "@/features/dashboard/store/state/dashboard-state";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { useExchangeRateState } from "@/features/master-data/store/state/exchange-rate-state";
import { fetchAllMyBusinessExchangeRateService } from "@/features/master-data/store/thunks/exchange-rate-thunks";
import { setPeriod, resetState } from "@/features/dashboard/store/slice/dashboard-slice";
import {
  fetchDashboardSummaryService,
  fetchDashboardSalesService,
  fetchDashboardPaymentsService,
  fetchDashboardStockService,
  fetchDashboardOrdersService,
  fetchDashboardBranchesService,
  fetchDashboardTopProductsService,
  fetchDashboardHourlySalesService,
  fetchDashboardCustomerStatsService,
  fetchDashboardPromotionsService,
} from "@/features/dashboard/store/thunks/dashboard-thunks";
import { DashboardPeriod } from "@/features/dashboard/store/models/response/dashboard-response";
import { DashboardHeader } from "./_components/dashboard-header";
import { KpiSection } from "./_components/kpi-section";
import { SalesAnalyticsCard } from "./_components/sales-analytics-card";
import { PaymentMethodsCard } from "./_components/payment-methods-card";
import { TopProductsCard } from "./_components/top-products-card";
import { ExchangeRateCard } from "./_components/exchange-rate-card";
import { CustomerStatsCard } from "./_components/customer-stats-card";
import { HourlySalesCard } from "./_components/hourly-sales-card";
import { PromotionPerformanceCard } from "./_components/promotion-performance-card";
import { BranchPerformanceCard } from "./_components/branch-performance-card";
import { RecentOrdersCard } from "./_components/recent-orders-card";
import { InventoryStatusCard } from "./_components/inventory-status-card";

export default function AdminDashboardPage() {
  useAdminCleanup(resetState);

  const { period, summary, sales, payments, stock, orders, branches, topProducts, hourlySales, customerStats, promotions, loading, error, dispatch } = useDashboardState();
  const { user } = useAuthState();
  const { exchangeRateContent, dispatch: erDispatch } = useExchangeRateState();
  const activeRate = exchangeRateContent?.find((r) => r.status === "ACTIVE") ?? exchangeRateContent?.[0];

  const fetchAll = useCallback((p: DashboardPeriod) => {
    dispatch(fetchDashboardSummaryService({ period: p }));
    dispatch(fetchDashboardSalesService({ period: "7D" }));
    dispatch(fetchDashboardPaymentsService({ period: p }));
    dispatch(fetchDashboardStockService());
    dispatch(fetchDashboardOrdersService({ period: p }));
    dispatch(fetchDashboardBranchesService({ period: p }));
    dispatch(fetchDashboardTopProductsService({ period: p }));
    dispatch(fetchDashboardHourlySalesService({ period: "TODAY" }));
    dispatch(fetchDashboardCustomerStatsService({ period: p }));
    dispatch(fetchDashboardPromotionsService({ period: "TODAY" }));
  }, [dispatch]);

  const handleOrderEvent = useCallback((type: string) => {
    fetchAll(period);
    showToast.info(type === "NEW_ORDER" ? "New order received" : "Order status updated");
  }, [fetchAll, period]);

  const handleStockEvent = useCallback((_type: string) => {
    fetchAll(period);
  }, [fetchAll, period]);

  const { isConnected } = useDashboardWebSocket({ businessId: user?.businessId, onOrderEvent: handleOrderEvent, onStockEvent: handleStockEvent });

  useEffect(() => {
    fetchAll(period);
    erDispatch(fetchAllMyBusinessExchangeRateService({ pageNo: 1, pageSize: 5 }));
  }, [period, fetchAll, erDispatch]);

  useEffect(() => {
    if (error) showToast.error(error);
  }, [error]);

  const today = format(new Date(), "EEEE, MMM d yyyy");
  const cambodiaCurrentHour = hourlySales?.currentHour ?? 0;

  return (
    <div className="flex flex-col gap-4 p-4">
      <DashboardHeader today={today} period={period} isLive={isConnected} onPeriodChange={(p) => dispatch(setPeriod(p))} onRefresh={() => fetchAll(period)} />
      <KpiSection summary={summary} customerStats={customerStats} loading={loading} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <SalesAnalyticsCard sales={sales} loading={loading.sales} />
        <PaymentMethodsCard payments={payments} loading={loading.payments} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <TopProductsCard topProducts={topProducts} loading={loading.topProducts} />
        <div className="flex flex-col gap-3">
          <ExchangeRateCard activeRate={activeRate} />
          <CustomerStatsCard customerStats={customerStats} loading={loading.customerStats} />
        </div>
      </div>
      <HourlySalesCard hourlySales={hourlySales} loading={loading.hourlySales} currentHour={cambodiaCurrentHour} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <PromotionPerformanceCard promotions={promotions} loading={loading.promotions} />
        <BranchPerformanceCard branches={branches} loading={loading.branches} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <RecentOrdersCard orders={orders} loading={loading.orders} />
        <InventoryStatusCard stock={stock} loading={loading.stock} />
      </div>
    </div>
  );
}
