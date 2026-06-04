"use client";

import { useCallback, useEffect } from "react";
import { format } from "date-fns";
import { showToast } from "@/components/shared/common/show-toast";
import { useAppSelector } from "@/redux/store";
import { useOwnerDashboardState } from "@/redux/features/owner-dashboard/store/state/owner-dashboard-state";
import {
  fetchOwnerDashboardSummaryService,
  fetchOwnerDashboardTrendsService,
  fetchOwnerDashboardStatusBreakdownService,
  fetchOwnerDashboardRecentOwnersService,
  fetchOwnerDashboardPlanBreakdownService,
  fetchOwnerDashboardCustomerTrendsService,
  fetchOwnerDashboardUserTrendsService,
  fetchOwnerDashboardPaymentTrendsService,
} from "@/redux/features/owner-dashboard/store/thunks/owner-dashboard-thunks";
import { DashboardHeader } from "./_components/dashboard-header";
import { KpiSection } from "./_components/kpi-section";
import { SubscriptionTrendsCard } from "./_components/subscription-trends-card";
import { SubscriptionStatusCard } from "./_components/subscription-status-card";
import { RecentOwnersCard } from "./_components/recent-owners-card";
import { PlanBreakdownCard } from "./_components/plan-breakdown-card";
import { DailyTrendsCard } from "./_components/daily-trends-card";

export default function AdminDashboardPage() {
  const {
    dispatch,
    summary,
    trends,
    statusBreakdown,
    recentOwners,
    planBreakdown,
    customerTrends,
    userTrends,
    paymentTrends,
    loading,
    error,
  } = useOwnerDashboardState();

  const wsVersion = useAppSelector((state) => state.websocket.versions.dashboard);

  const fetchAll = useCallback(() => {
    dispatch(fetchOwnerDashboardSummaryService());
    dispatch(fetchOwnerDashboardTrendsService());
    dispatch(fetchOwnerDashboardStatusBreakdownService());
    dispatch(fetchOwnerDashboardRecentOwnersService());
    dispatch(fetchOwnerDashboardPlanBreakdownService());
    dispatch(fetchOwnerDashboardCustomerTrendsService());
    dispatch(fetchOwnerDashboardUserTrendsService());
    dispatch(fetchOwnerDashboardPaymentTrendsService());
  }, [dispatch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll, wsVersion]);

  useEffect(() => {
    if (error) showToast.error(error);
  }, [error]);

  const today = format(new Date(), "EEEE, MMM d yyyy");

  return (
    <div className="flex flex-col gap-4 p-4">
      <DashboardHeader today={today} onRefresh={fetchAll} />

      <KpiSection summary={summary} loading={loading.summary} />

      {/* Subscription trends + status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <SubscriptionTrendsCard trends={trends} loading={loading.trends} className="lg:col-span-2" />
        <SubscriptionStatusCard statusBreakdown={statusBreakdown} loading={loading.statusBreakdown} />
      </div>

      {/* Daily charts: customers, business users, payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <DailyTrendsCard
          title="Customer Registrations"
          description="New customers per day — last 30 days"
          data={customerTrends}
          loading={loading.customerTrends}
          mode="count"
          color="hsl(var(--chart-2, 210 100% 56%))"
          totalLabel="total new customers"
        />
        <DailyTrendsCard
          title="Business User Signups"
          description="New business users per day — last 30 days"
          data={userTrends}
          loading={loading.userTrends}
          mode="count"
          color="hsl(var(--chart-3, 160 84% 39%))"
          totalLabel="total new users"
        />
        <DailyTrendsCard
          title="Payment Revenue"
          description="Daily subscription payments — last 30 days"
          data={paymentTrends}
          loading={loading.paymentTrends}
          mode="amount"
          color="hsl(var(--chart-4, 280 65% 60%))"
          totalLabel="total collected"
        />
      </div>

      {/* Recent owners + plan breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <RecentOwnersCard recentOwners={recentOwners} loading={loading.recentOwners} />
        <PlanBreakdownCard planBreakdown={planBreakdown} loading={loading.planBreakdown} />
      </div>
    </div>
  );
}
