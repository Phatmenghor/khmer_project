"use client";

import React, { useEffect } from "react";
import {
  CreditCard,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  History,
  Sparkles,
  Zap,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
import { formatDate } from "@/utils/date/date-time-format";
import { useRouter } from "next/navigation";
import { useSubscriptionHistoryState } from "@/features/subscription/store/state/subscription-history-state";
import { fetchMySubscriptionSummaryService } from "@/features/subscription/store/thunks/subscription-history-thunks";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
import { SubscriptionHistorySkeleton } from "@/components/shared/skeletons";

function getPlanIcon(name?: string) {
  if (!name) return <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />;
  const n = name.toLowerCase();
  if (n.includes("pro") || n.includes("premium")) {
    return <Zap className="w-4 h-4 text-amber-500 shrink-0" />;
  }
  if (n.includes("enterprise")) {
    return <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />;
  }
  return <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />;
}

function getStatusBadge(statusStr?: string) {
  if (!statusStr) return null;
  const s = statusStr.toUpperCase();
  if (s === "ACTIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        ACTIVE
      </span>
    );
  }
  if (s === "EXPIRED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[11px] font-bold tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        EXPIRED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      {s}
    </span>
  );
}

interface PlanHistorySectionProps {
  userProfile?: any;
}

export function PlanHistorySection({ userProfile }: PlanHistorySectionProps) {
  const router = useRouter();
  const { mySummary, isFetchingSummary, dispatch } = useSubscriptionHistoryState();

  useEffect(() => {
    dispatch(fetchMySubscriptionSummaryService());
  }, [dispatch]);

  if (isFetchingSummary && !mySummary) {
    return <SubscriptionHistorySkeleton />;
  }

  const currentPlanName = mySummary?.planName || "—";
  const billingCycle = mySummary?.billingCycle || "—";
  const subscriptionStatus = mySummary?.subscriptionStatus || "—";
  const startDate = mySummary?.subscriptionStartDate;
  const endDate = mySummary?.subscriptionEndDate;
  const daysRemainingText = mySummary?.daysRemainingText || "—";
  const progressPercent = mySummary?.progressPercent ?? 0;
  const historyList = mySummary?.history || [];

  const historyColumns: TableColumn<any>[] = [
    {
      key: "planName",
      label: "Plan Name",
      render: (item) => (
        <div className="flex items-center gap-2 font-bold text-foreground">
          {getPlanIcon(item.planName || currentPlanName)}
          <span>{item.planName || currentPlanName}</span>
        </div>
      ),
    },
    {
      key: "startDate",
      label: "Start Date",
      render: (item) => (
        <span className="text-muted-foreground font-semibold">
          {formatDate(item.startDate || startDate)}
        </span>
      ),
    },
    {
      key: "endDate",
      label: "End Date",
      render: (item) => (
        <span className="text-muted-foreground font-semibold">
          {formatDate(item.endDate || endDate)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      className: "text-right",
      render: (item) => (
        <span className="font-extrabold text-foreground block text-right">
          {item.paymentStatus || (item.totalPaid != null ? `$${item.totalPaid}` : "—")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Active Subscription Overview Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-md overflow-hidden relative">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <CardHeader className="pb-4 border-b border-border/50 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <CardTitle className="text-lg font-black tracking-tight text-foreground">
                    Current Subscription Plan
                  </CardTitle>
                  {getStatusBadge(subscriptionStatus)}
                </div>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  Manage your active plan features, subscription renewals, and billing history.
                </p>
              </div>
            </div>

            <CustomButton
              variant="default"
              size="sm"
              onClick={() => router.push("/pricing")}
              className="text-xs font-bold gap-1.5 shadow-sm hover:shadow-md transition-all shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <span>Upgrade Plan</span>
              <ArrowUpRight className="w-4 h-4" />
            </CustomButton>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-5 relative z-10">
          {/* Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-background/80 border border-border/60 shadow-2xs backdrop-blur-xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Active Plan
              </span>
              <div className="flex items-center gap-2">
                {getPlanIcon(currentPlanName)}
                <span className="text-sm font-extrabold text-foreground">{currentPlanName}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-background/80 border border-border/60 shadow-2xs backdrop-blur-xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Billing Cycle
              </span>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-extrabold text-foreground">{billingCycle}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-background/80 border border-border/60 shadow-2xs backdrop-blur-xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Subscription Start
              </span>
              <span className="text-sm font-extrabold text-foreground">{formatDate(startDate)}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-background/80 border border-border/60 shadow-2xs backdrop-blur-xs">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Subscription End
              </span>
              <span className="text-sm font-extrabold text-foreground">
                {formatDate(endDate)}
              </span>
            </div>
          </div>

          {/* Time Remaining Bar */}
          <div className="p-4 rounded-2xl bg-accent/40 border border-border/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span className="font-bold text-foreground">Time Remaining</span>
              </div>
              <span className="font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20 text-xs">
                {daysRemainingText}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription & Plan History Table */}
      <Card className="border-border/80 shadow-2xs overflow-hidden">
        <CardHeader className="py-3.5 px-4 sm:px-6 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-foreground">
              <History className="w-4 h-4 text-primary shrink-0" />
              <span>Subscription & Plan History</span>
            </CardTitle>
            <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border/60">
              {historyList.length} {historyList.length === 1 ? "Record" : "Records"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTableWithPagination
            data={historyList}
            columns={historyColumns}
            loading={isFetchingSummary}
            emptyMessage="No subscription history records found"
            showPagination={historyList.length > 5}
            showPageSizeSelector={false}
            getRowKey={(row: any, idx: number) => row.subscriptionId || idx}
          />
        </CardContent>
      </Card>
    </div>
  );
}
