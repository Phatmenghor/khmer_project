"use client";

import { useEffect } from "react";
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
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { CreditCard } from "lucide-react";

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
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      isEmpty={!isFetchingDetail && !planData}
      emptyMessage="No subscription plan data available"
      title={planData ? `Subscription Plan Details - ${planData.name}` : "Subscription Plan Details"}
      description="Detailed information about the selected subscription plan"
      icon={CreditCard}
      maxWidthClass="sm:max-w-4xl"
    >
      {planData && (
        <>
          {/* Plan Information */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField
                  label="Plan Name"
                  value={planData.name || "—"}
                />
                <DisplayField
                  label="Price"
                  value={
                    planData.price !== undefined && planData.price !== null
                      ? String(planData.price)
                      : "—"
                  }
                />
                <DisplayField
                  label="Duration Type"
                  value={planData.durationType || "—"}
                />
                <DisplayField
                  label="Active Subscriptions Count"
                  value={
                    planData.activeSubscriptionsCount !== undefined &&
                    planData.activeSubscriptionsCount !== null
                      ? String(planData.activeSubscriptionsCount)
                      : "—"
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
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField
                  label="Subscription Plan ID"
                  value={
                    <span className="text-xs font-mono bg-muted px-1 py-1 rounded">
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
                  value={planData.createdBy || "—"}
                />
                <DisplayField
                  label="Last Updated"
                  value={dateTimeFormat(planData.updatedAt ?? "")}
                />
                <DisplayField
                  label="Updated By"
                  value={planData.updatedBy || "—"}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </DetailModal>
  );
}
