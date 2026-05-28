"use client";

import { useCallback, useEffect } from "react";
import { format } from "date-fns";
import { showToast } from "@/components/shared/common/show-toast";
import { useOwnerDashboardState } from "@/redux/features/owner-dashboard/store/state/owner-dashboard-state";
import { setPeriod } from "@/redux/features/owner-dashboard/store/slice/owner-dashboard-slice";
import {
  fetchOwnerDashboardSummaryService,
  fetchOwnerDashboardTrendsService,
  fetchOwnerDashboardStatusBreakdownService,
  fetchOwnerDashboardRecentOwnersService,
  fetchOwnerDashboardPlanBreakdownService,
} from "@/redux/features/owner-dashboard/store/thunks/owner-dashboard-thunks";
import { OwnerDashboardPeriod } from "@/redux/features/owner-dashboard/store/models/response/owner-dashboard-response";
import { DashboardHeader } from "./_components/dashboard-header";
import { KpiSection } from "./_components/kpi-section";
import { SubscriptionTrendsCard } from "./_components/subscription-trends-card";
import { SubscriptionStatusCard } from "./_components/subscription-status-card";
import { RecentOwnersCard } from "./_components/recent-owners-card";
import { PlanBreakdownCard } from "./_components/plan-breakdown-card";

export default function AdminDashboardPage() {
  const {
    dispatch,
    period,
    summary,
    trends,
    statusBreakdown,
    recentOwners,
    planBreakdown,
    loading,
    error,
  } = useOwnerDashboardState();

  const fetchAll = useCallback(
    (p: OwnerDashboardPeriod) => {
      dispatch(fetchOwnerDashboardSummaryService({ period: p }));
      dispatch(fetchOwnerDashboardTrendsService({ period: p }));
      dispatch(fetchOwnerDashboardStatusBreakdownService());
      dispatch(fetchOwnerDashboardRecentOwnersService());
      dispatch(fetchOwnerDashboardPlanBreakdownService());
    },
    [dispatch]
  );

  useEffect(() => {
    fetchAll(period);
  }, [period, fetchAll]);

  useEffect(() => {
    if (error) showToast.error(error);
  }, [error]);

  const today = format(new Date(), "EEEE, MMM d yyyy");

  return (
    <div className="flex flex-col gap-6 p-6">
      <DashboardHeader
        today={today}
        period={period}
        onPeriodChange={(p) => dispatch(setPeriod(p))}
        onRefresh={() => fetchAll(period)}
      />

      <KpiSection summary={summary} loading={loading.summary} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SubscriptionTrendsCard
          trends={trends}
          loading={loading.trends}
          className="lg:col-span-2"
        />
        <SubscriptionStatusCard
          statusBreakdown={statusBreakdown}
          loading={loading.statusBreakdown}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentOwnersCard recentOwners={recentOwners} loading={loading.recentOwners} />
        <PlanBreakdownCard
          planBreakdown={planBreakdown}
          loading={loading.planBreakdown}
        />
      </div>
    </div>
  );
}
