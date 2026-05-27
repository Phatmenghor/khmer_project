"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { DetailSection } from "@/components/shared/modal/detail-section";
import { DetailRow } from "@/components/shared/modal/detail-section";
import { useSubscriptionHistoryState } from "../store/state/subscription-history-state";
import { fetchSubscriptionHistoryByIdService } from "../store/thunks/subscription-history-thunks";
import { clearSelectedHistory } from "../store/slice/subscription-history-slice";

interface SubscriptionHistoryDetailModalProps {
  subscriptionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionHistoryDetailModal({
  subscriptionId,
  isOpen,
  onClose,
}: SubscriptionHistoryDetailModalProps) {
  const { selectedHistory, operations, dispatch } = useSubscriptionHistoryState();

  useEffect(() => {
    if (isOpen && subscriptionId) {
      dispatch(fetchSubscriptionHistoryByIdService(subscriptionId));
    }
    return () => {
      if (!isOpen) dispatch(clearSelectedHistory());
    };
  }, [isOpen, subscriptionId]);

  const h = selectedHistory;

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      isLoading={operations.isFetchingDetail}
      title={h ? `${h.businessName} — ${h.planName}` : "Subscription Detail"}
      description={h ? `${h.startDate} → ${h.endDate}` : undefined}
      badges={
        h ? (
          <>
            <Badge variant={h.status === "ACTIVE" ? "default" : "destructive"} className="text-xs">
              {h.status}
            </Badge>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              h.paymentStatus === "PAID"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : h.paymentStatus === "PENDING"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
            }`}>
              {h.paymentStatus?.replace("_", " ")}
            </span>
          </>
        ) : undefined
      }
    >
      {h && (
        <div className="space-y-6">
          <DetailSection title="Business Information">
            <DetailRow label="Business Name" value={h.businessName || "—"} />
            <DetailRow label="Business ID" value={<span className="text-xs text-muted-foreground font-mono">{h.businessId}</span>} />
          </DetailSection>

          <DetailSection title="Subscription Details">
            <DetailRow label="Plan Name" value={h.planName || "—"} />
            <DetailRow label="Plan Price" value={`$${h.planPrice?.toFixed(2) ?? "0.00"}`} />
            <DetailRow label="Duration Type" value={h.planDurationType || "—"} />
            <DetailRow label="Start Date" value={h.startDate || "—"} />
            <DetailRow label="End Date" value={h.endDate || "—"} />
            <DetailRow
              label="Days Remaining"
              value={h.status === "EXPIRED" ? "Expired" : `${h.daysRemaining} days`}
            />
            <DetailRow
              label="Auto Renew"
              value={
                <Badge variant={h.autoRenew ? "default" : "secondary"} className="text-xs">
                  {h.autoRenew ? "Yes" : "No"}
                </Badge>
              }
            />
          </DetailSection>

          <DetailSection title="Payment Information">
            <DetailRow label="Payment Status" value={
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                h.paymentStatus === "PAID"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : h.paymentStatus === "PENDING"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : h.paymentStatus === "PARTIALLY_PAID"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              }`}>
                {h.paymentStatus?.replace("_", " ")}
              </span>
            } />
            <DetailRow label="Total Paid" value={`$${h.totalPaid?.toFixed(2) ?? "0.00"}`} />
            {h.payment && (
              <>
                <DetailRow label="Amount" value={`$${h.payment.amount?.toFixed(2) ?? "0.00"}`} />
                <DetailRow label="Payment Method" value={h.payment.paymentMethod || "—"} />
                <DetailRow label="Payment Type" value={h.payment.paymentType || "—"} />
                <DetailRow label="Reference No." value={h.payment.referenceNumber || "—"} />
                <DetailRow label="Notes" value={h.payment.notes || "—"} />
                {h.payment.paidAt && (
                  <DetailRow
                    label="Paid At"
                    value={new Date(h.payment.paidAt).toLocaleString("en-US", { timeZone: "Asia/Phnom_Penh" })}
                    isLast
                  />
                )}
              </>
            )}
            {!h.payment && (
              <DetailRow label="Payment" value="No payment record" isLast />
            )}
          </DetailSection>
        </div>
      )}
    </DetailModal>
  );
}
