"use client";

import React from "react";
import { CreditCard, Calendar, CheckCircle2, ShieldCheck, Clock, ArrowUpRight, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomButton } from "@/components/shared/button/custom-button";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { formatDate } from "@/utils/date/date-time-format";
import { useRouter } from "next/navigation";

interface PlanHistorySectionProps {
  userProfile?: any;
}

export function PlanHistorySection({ userProfile }: PlanHistorySectionProps) {
  const router = useRouter();

  const currentPlanName =
    userProfile?.planName ||
    userProfile?.business?.planName ||
    userProfile?.currentPlanName ||
    "Free Trial";

  const subscriptionStatus = userProfile?.isSubscriptionActive
    ? "ACTIVE"
    : userProfile?.businessStatus || "ACTIVE";

  const startDate = userProfile?.subscriptionStartDate || userProfile?.createdAt;
  const endDate = userProfile?.subscriptionEndDate;
  const daysRemaining = userProfile?.daysRemaining ?? (userProfile?.isSubscriptionActive ? "7 Days" : "Expired");

  return (
    <div className="space-y-4">
      {/* Current Active Plan Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-extrabold flex items-center gap-2">
                  <span>Current Subscription Plan</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-extrabold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {subscriptionStatus}
                  </span>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage your subscription, billing details, and active plan features.
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DisplayField label="Active Plan" value={currentPlanName} />
            <DisplayField label="Billing Cycle" value="Monthly / Annual" />
            <DisplayField label="Subscription Start" value={formatDate(startDate)} />
            <DisplayField label="Subscription End" value={formatDate(endDate) || "Ongoing"} />
          </div>

          <div className="p-3.5 rounded-xl bg-accent/40 border border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-foreground">Time Remaining: </span>
                <span className="font-extrabold text-primary">{daysRemaining}</span>
              </div>
            </div>
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => router.push("/pricing")}
              className="text-xs font-bold gap-1.5 shadow-2xs"
            >
              <span>Upgrade Plan</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </CustomButton>
          </div>
        </CardContent>
      </Card>

      {/* Subscription History Table */}
      <Card className="border-border/80 shadow-2xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-sm font-extrabold flex items-center gap-2">
            <History className="w-4 h-4 text-primary shrink-0" />
            <span>Subscription & Plan History</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Start Date</th>
                  <th className="py-3 px-4">End Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <tr className="hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{currentPlanName}</span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground font-medium">
                    {formatDate(startDate)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground font-medium">
                    {formatDate(endDate) || "Ongoing"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-foreground">
                    FREE / INCLUDED
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
