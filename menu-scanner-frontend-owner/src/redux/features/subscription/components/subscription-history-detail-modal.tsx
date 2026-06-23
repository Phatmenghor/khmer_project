"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { useSubscriptionHistoryState } from "../store/state/subscription-history-state";
import { fetchSubscriptionHistoryByIdService } from "../store/thunks/subscription-history-thunks";
import { clearSelectedHistory } from "../store/slice/subscription-history-slice";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { History } from "lucide-react";

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
    if (!subscriptionId || !isOpen) return;
    dispatch(fetchSubscriptionHistoryByIdService(subscriptionId));
  }, [subscriptionId, isOpen]);

  const handleClose = () => {
    dispatch(clearSelectedHistory());
    onClose();
  };

  const h = selectedHistory;

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={operations.isFetchingDetail}
      title="Subscription Detail"
      description={h ? `${h.businessName} — ${h.planName}` : "Detailed information about the selected subscription"}
      imageUrl={h?.logoBusinessUrl}
      avatarName={h?.businessName}
      icon={History}
      maxWidthClass="sm:max-w-7xl"
    >
      {h && (
        <>
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField label="Business Name" value={h.businessName || "—"} />
                <DisplayField
                  label="Business ID"
                  value={
                    <span className="text-xs font-mono bg-muted px-1 py-1 rounded">
                      {h.businessId}
                    </span>
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Subscription Information */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField label="Plan Name" value={h.planName || "—"} />
                <DisplayField
                  label="Plan Price"
                  value={h.planPrice !== undefined ? `$${h.planPrice.toFixed(2)}` : "—"}
                />
                <DisplayField label="Duration Type" value={h.planDurationType || "—"} />
                <DisplayField label="Status" value={h.status || "—"} />
                <DisplayField label="Start Date" value={h.startDate || "—"} />
                <DisplayField label="End Date" value={h.endDate || "—"} />
                <DisplayField
                  label="Days Remaining"
                  value={h.status === "EXPIRED" ? "Expired" : h.status === "CANCELLED" ? "Cancelled" : `${h.daysRemaining} days`}
                />
                <DisplayField
                  label="Auto Renew"
                  value={h.autoRenew ? "Enabled" : "Disabled"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField label="Payment Status" value={h.paymentStatus?.replace("_", " ") || "—"} />
                <DisplayField
                  label="Total Paid"
                  value={`$${h.totalPaid?.toFixed(2) ?? "0.00"}`}
                />
                {h.payment ? (
                  <>
                    <DisplayField
                      label="Amount"
                      value={`$${h.payment.amount?.toFixed(2) ?? "0.00"}`}
                    />
                    <DisplayField label="Payment Method" value={h.payment.paymentMethod || "—"} />
                    <DisplayField label="Payment Type" value={h.payment.paymentType || "—"} />
                    <DisplayField label="Reference No." value={h.payment.referenceNumber || "—"} />
                    {h.payment.paidAt && (
                      <DisplayField
                        label="Paid At"
                        value={new Date(h.payment.paidAt).toLocaleString("en-US", {
                          timeZone: "Asia/Phnom_Penh",
                        })}
                      />
                    )}
                  </>
                ) : (
                  <div className="md:col-span-2">
                    <DisplayField label="Payment" value="No payment record" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </DetailModal>
  );
}
