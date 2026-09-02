"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/store";
import { clearSelectedSubscriptionPlan } from "../store/slice/subscription-plan-slice";
import {
  selectIsFetchingDetail,
  selectSelectedSubscriptionPlan,
} from "../store/selectors/subscription-plan-selector";
import { fetchSubscriptionPlanByIdService } from "../store/thunks/subscription-plan-thunks";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import { formatEnumValue } from "@/utils/format/enum-formatter";

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
      title={planData ? planData.name : "Subscription Plan Details"}
      description="Detailed information about the selected subscription plan"
      avatarName={planData?.name}
      size="5xl"
    >
      {planData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
          {/* Plan Information */}
          <SectionTitle>Plan Information</SectionTitle>
          <InfoRow label="Plan Name" value={planData.name || "-"} />
          <InfoRow
            label="Price"
            value={planData.price !== undefined && planData.price !== null ? `$${planData.price}` : "-"}
          />
          <InfoRow label="Duration Type" value={planData.durationType ? formatEnumValue(planData.durationType) : "-"} />
          <InfoRow
            label="Active Subscriptions"
            value={planData.activeSubscriptionsCount !== undefined ? String(planData.activeSubscriptionsCount) : "-"}
          />
          <InfoRow
            label="Status"
            value={
              planData.status ? (
                <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">
                  {formatEnumValue(planData.status)}
                </span>
              ) : "-"
            }
          />
          <InfoRow label="Description" value={planData.description || "-"} fullWidth />

          {/* System Information */}
          <SectionTitle>System Info</SectionTitle>
          <InfoRow label="Subscription Plan ID" value={planData.id || "-"} />
          <InfoRow label="Created By" value={planData.createdBy || "-"} />
          <InfoRow label="Created At" value={dateTimeFormat(planData.createdAt ?? "")} />
          <InfoRow label="Updated By" value={planData.updatedBy || "-"} />
          <InfoRow label="Last Updated" value={dateTimeFormat(planData.updatedAt ?? "")} />
        </div>
      )}
    </DetailModal>
  );
}
