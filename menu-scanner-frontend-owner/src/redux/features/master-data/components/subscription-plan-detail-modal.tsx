"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { Badge } from "@/components/ui/badge";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { clearSelectedSubscriptionPlan } from "../store/slice/subscription-plan-slice";
import { SubscriptionPlanStatus } from "@/constants/app-resource/status/status";
import { getStatusColor } from "@/utils/styles/enum-style";
import {
  selectIsFetchingDetail,
  selectSelectedSubscriptionPlan,
} from "../store/selectors/subscription-plan-selector";
import { fetchSubscriptionPlanByIdService } from "../store/thunks/subscription-plan-thunks";
import Loading from "@/components/shared/common/loading";

interface SubscriptionPlanDetailModalProps {
  planId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionPlanDetailModal({
  planId,
  isOpen,
  onClose,
}: SubscriptionPlanDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const planData = useAppSelector(selectSelectedSubscriptionPlan);

  useEffect(() => {
    const fetchPlanData = async () => {
      if (!planId || !isOpen) return;
      try {
        await dispatch(fetchSubscriptionPlanByIdService(planId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching subscription plan data:", error);
      }
    };
    fetchPlanData();
  }, [planId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedSubscriptionPlan());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Subscription Plan Details</DialogTitle>
      <DialogContent className="w-full sm:max-w-4xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">
                Subscription Plan Details
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {planData
                  ? planData.name
                  : "Detailed information about the selected subscription plan"}
              </p>
            </div>
          </div>
        </div>

        {isFetchingDetail ? (
          <div className="flex items-center justify-center flex-1 min-h-[300px]">
            <Loading />
          </div>
        ) : !planData ? (
          <div className="flex items-center justify-center flex-1 min-h-[200px]">
            <p className="text-muted-foreground">
              No subscription plan data available
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Plan Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField
                      label="Plan Name"
                      value={planData.name || "---"}
                    />
                    <DisplayField
                      label="Price"
                      value={
                        planData.price !== undefined && planData.price !== null
                          ? String(planData.price)
                          : "---"
                      }
                    />
                    <DisplayField
                      label="Duration Days"
                      value={
                        planData.durationDays !== undefined &&
                        planData.durationDays !== null
                          ? String(planData.durationDays)
                          : "---"
                      }
                    />
                    <DisplayField
                      label="Active Subscriptions Count"
                      value={
                        planData.activeSubscriptionsCount !== undefined &&
                        planData.activeSubscriptionsCount !== null
                          ? String(planData.activeSubscriptionsCount)
                          : "---"
                      }
                    />
                    <DisplayField
                      label="Status"
                      value={
                        <Badge
                          variant="outline"
                          className={getStatusColor(
                            planData.status === SubscriptionPlanStatus.PUBLIC
                              ? "ACTIVE"
                              : "INACTIVE"
                          )}
                        >
                          {planData.status}
                        </Badge>
                      }
                    />
                    {planData.description && (
                      <div className="md:col-span-2">
                        <DisplayField
                          label="Description"
                          value={planData.description}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField
                      label="Subscription Plan ID"
                      value={
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {planData.id}
                        </span>
                      }
                    />
                    <DisplayField
                      label="Created At"
                      value={dateTimeFormat(planData.createdAt ?? "")}
                    />
                    <DisplayField
                      label="Created By"
                      value={planData.createdBy || "---"}
                    />
                    <DisplayField
                      label="Last Updated"
                      value={dateTimeFormat(planData.updatedAt ?? "")}
                    />
                    <DisplayField
                      label="Updated By"
                      value={planData.updatedBy || "---"}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
