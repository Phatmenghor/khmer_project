"use client";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/store";
import { getCurrentSubscriptionService } from "@/features/auth/store/thunks/subscription-thunks";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SubscriptionHistoryResponse } from "@/types/subscription";
import { formatDate } from "@/utils/date/date-time-format";
import { cn } from "@/lib/utils";

export default function PlanPage() {
  const dispatch = useAppDispatch();
  const [currentSubscription, setCurrentSubscription] =
    useState<SubscriptionHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await dispatch(
          getCurrentSubscriptionService()
        ).unwrap();
        setCurrentSubscription(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load subscription"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentSubscription();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="border-b px-4 py-4 space-y-1">
          <h1 className="text-xs font-semibold text-foreground">My Plan</h1>
          <p className="text-xs text-muted-foreground">
            View and manage your subscription plan
          </p>
        </div>
        <div className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !currentSubscription) {
    return (
      <div className="min-h-screen">
        <div className="border-b px-4 py-4 space-y-1">
          <h1 className="text-xs font-semibold text-foreground">My Plan</h1>
          <p className="text-xs text-muted-foreground">
            View and manage your subscription plan
          </p>
        </div>
        <div className="p-4">
          <Card>
            <CardContent className="pt-4">
              <div className="p-3 bg-destructive/10 border border-destructive rounded">
                <p className="text-xs text-destructive font-medium">
                  {error || "No active subscription found"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getDaysRemainingColor = (days: number) => {
    if (days > 30) return "text-green-600 dark:text-green-400";
    if (days > 7) return "text-amber-600 dark:text-amber-400";
    return "text-destructive";
  };

  const getStatusBadge = (
    status: string
  ): { bg: string; text: string } => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return {
          bg: "bg-green-100 dark:bg-green-950/30",
          text: "text-green-700 dark:text-green-400",
        };
      case "INACTIVE":
        return {
          bg: "bg-gray-100 dark:bg-gray-800",
          text: "text-gray-700 dark:text-gray-400",
        };
      case "EXPIRED":
        return {
          bg: "bg-red-100 dark:bg-red-950/30",
          text: "text-red-700 dark:text-red-400",
        };
      case "CANCELLED":
        return {
          bg: "bg-red-100 dark:bg-red-950/30",
          text: "text-red-700 dark:text-red-400",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-800",
          text: "text-gray-700 dark:text-gray-400",
        };
    }
  };

  const statusBadge = getStatusBadge(currentSubscription.status);

  return (
    <div className="min-h-screen pb-4">
      <div className="border-b px-4 py-4 space-y-1">
        <h1 className="text-xs font-semibold text-foreground">My Plan</h1>
        <p className="text-xs text-muted-foreground">
          View and manage your subscription plan
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Plan Card */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-foreground">
                  {currentSubscription.planName}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Current active subscription
                </p>
              </div>
              <div
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  statusBadge.bg,
                  statusBadge.text
                )}
              >
                {currentSubscription.status}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Plan Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Start Date */}
              <div className="p-3 bg-muted/50 rounded">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Start Date
                </p>
                <p className="text-xs font-semibold text-foreground mt-1">
                  {formatDate(currentSubscription.startDate)}
                </p>
              </div>

              {/* End Date */}
              <div className="p-3 bg-muted/50 rounded">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  End Date
                </p>
                <p className="text-xs font-semibold text-foreground mt-1">
                  {formatDate(currentSubscription.endDate)}
                </p>
              </div>

              {/* Duration Type */}
              <div className="p-3 bg-muted/50 rounded">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Duration
                </p>
                <p className="text-xs font-semibold text-foreground mt-1">
                  {currentSubscription.planDurationType === "MONTHLY"
                    ? "Monthly"
                    : currentSubscription.planDurationType === "YEARLY"
                      ? "Yearly"
                      : "One Time"}
                </p>
              </div>

              {/* Days Remaining */}
              <div className="p-3 bg-muted/50 rounded">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Days Remaining
                </p>
                <p
                  className={cn(
                    "text-xs font-semibold mt-1",
                    getDaysRemainingColor(currentSubscription.daysRemaining)
                  )}
                >
                  {currentSubscription.daysRemaining} days
                </p>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Plan Price</p>
                  <p className="text-xs font-bold text-foreground mt-1">
                    ${currentSubscription.planPrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Status</p>
                  <p className="text-xs font-bold text-foreground mt-1">
                    {currentSubscription.paymentStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Auto Renewal */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">
                    Auto Renewal
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This subscription will automatically renew at the end date
                  </p>
                </div>
                <div
                  className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    currentSubscription.autoRenew
                      ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"
                  )}
                >
                  {currentSubscription.autoRenew ? "Enabled" : "Disabled"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription History Section */}
        <div>
          <h3 className="text-xs font-semibold text-foreground mb-3">
            Subscription History
          </h3>
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Plan Name
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Duration Type
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Start Date
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      End Date
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Price
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-b hover:bg-muted/50 transition-colors">
                    <TableCell className="py-3">
                      <span className="text-xs font-medium text-foreground">
                        {currentSubscription.planName}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-xs text-muted-foreground">
                        {currentSubscription.planDurationType === "MONTHLY"
                          ? "Monthly"
                          : currentSubscription.planDurationType === "YEARLY"
                            ? "Yearly"
                            : "One Time"}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(currentSubscription.startDate)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(currentSubscription.endDate)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-xs font-medium text-foreground">
                        ${currentSubscription.planPrice.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div
                        className={cn(
                          "w-fit px-1 py-1 rounded text-xs font-medium",
                          statusBadge.bg,
                          statusBadge.text
                        )}
                      >
                        {currentSubscription.status}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
