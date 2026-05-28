"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { useSubscriptionHistoryState } from "../store/state/subscription-history-state";
import { fetchSubscriptionHistoryByIdService } from "../store/thunks/subscription-history-thunks";
import { clearSelectedHistory } from "../store/slice/subscription-history-slice";
import Loading from "@/components/shared/common/loading";

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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Subscription Detail</DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="h-14 w-14 rounded-lg overflow-hidden bg-primary/10 border border-border flex-shrink-0 flex items-center justify-center">
              {h?.logoBusinessUrl ? (
                <img
                  src={h.logoBusinessUrl}
                  alt={h.businessName || "Business"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-primary">
                  {h?.businessName?.charAt(0)?.toUpperCase() || "S"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">
                Subscription Detail
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {h
                  ? `${h.businessName} — ${h.planName}`
                  : "Loading..."}
              </p>
            </div>
          </div>
        </div>

        {operations.isFetchingDetail ? (
          <div className="flex items-center justify-center flex-1 min-h-[300px]">
            <Loading />
          </div>
        ) : !h ? (
          <div className="flex items-center justify-center flex-1 min-h-[200px]">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">

              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField label="Business Name" value={h.businessName || "---"} />
                    <DisplayField
                      label="Business ID"
                      value={
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField label="Plan Name" value={h.planName || "---"} />
                    <DisplayField
                      label="Plan Price"
                      value={h.planPrice !== undefined ? `$${h.planPrice.toFixed(2)}` : "---"}
                    />
                    <DisplayField label="Duration Type" value={h.planDurationType || "---"} />
                    <DisplayField label="Status" value={h.status || "---"} />
                    <DisplayField label="Start Date" value={h.startDate || "---"} />
                    <DisplayField label="End Date" value={h.endDate || "---"} />
                    <DisplayField
                      label="Days Remaining"
                      value={h.status === "EXPIRED" ? "Expired" : `${h.daysRemaining} days`}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField label="Payment Status" value={h.paymentStatus?.replace("_", " ") || "---"} />
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
                        <DisplayField label="Payment Method" value={h.payment.paymentMethod || "---"} />
                        <DisplayField label="Payment Type" value={h.payment.paymentType || "---"} />
                        <DisplayField label="Reference No." value={h.payment.referenceNumber || "---"} />
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

            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
