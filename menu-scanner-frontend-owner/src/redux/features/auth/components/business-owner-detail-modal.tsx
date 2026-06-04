"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectIsFetchingDetail,
  selectSelectedBusinessOwner,
} from "../store/selectors/business-owner-selectors";
import { fetchBusinessOwnerByIdService } from "../store/thunks/business-owner-thunks";
import { clearSelectedBusinessOwner } from "../store/slice/business-owner-slice";
import Loading from "@/components/shared/common/loading";
import { fetchAllSubscriptionsByBusinessIdService } from "@/redux/features/subscription/store/thunks/subscription-history-thunks";
import { SubscriptionHistoryResponseModel } from "@/redux/features/subscription/store/models/response/subscription-history-response";

interface BusinessOwnerDetailModalProps {
  businessOwnerId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BusinessOwnerDetailModal({
  businessOwnerId,
  isOpen,
  onClose,
}: BusinessOwnerDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const d = useAppSelector(selectSelectedBusinessOwner);

  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistoryResponseModel[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (!businessOwnerId || !isOpen) return;
    dispatch(fetchBusinessOwnerByIdService(businessOwnerId)).unwrap().catch(console.error);
  }, [businessOwnerId, isOpen, dispatch]);

  useEffect(() => {
    if (!d?.businessId || !isOpen) return;
    setIsLoadingHistory(true);
    dispatch(fetchAllSubscriptionsByBusinessIdService(d.businessId))
      .unwrap()
      .then((data: SubscriptionHistoryResponseModel[]) => setSubscriptionHistory(data ?? []))
      .catch(console.error)
      .finally(() => setIsLoadingHistory(false));
  }, [d?.businessId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedBusinessOwner());
    setSubscriptionHistory([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Business Owner Details</DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-3 pr-5">
            <div className="h-10 w-10 rounded overflow-hidden bg-primary/10 border border-border flex-shrink-0 flex items-center justify-center">
              {d?.logoBusinessUrl ? (
                <img
                  src={d.logoBusinessUrl}
                  alt={d.businessName || "Business"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-primary">
                  {d?.ownerFullName?.charAt(0)?.toUpperCase() || "B"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xs font-semibold text-foreground">
                Business Owner Details
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {d ? d.ownerFullName || d.ownerUserIdentifier : "Loading..."}
              </p>
            </div>
          </div>
        </div>

        {isFetchingDetail ? (
          <div className="flex items-center justify-center flex-1 min-h-[300px]">
            <Loading />
          </div>
        ) : !d ? (
          <div className="flex items-center justify-center flex-1 min-h-[200px]">
            <p className="text-muted-foreground">No data available</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">

              {/* Owner Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Owner Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DisplayField label="User Identifier" value={d.ownerUserIdentifier || "---"} />
                    <DisplayField label="Full Name" value={d.ownerFullName || "---"} />
                    <DisplayField label="Email" value={d.ownerEmail || "---"} />
                    <DisplayField label="Phone" value={d.ownerPhone || "---"} />
                    <DisplayField label="Account Status" value={d.ownerAccountStatus || "---"} />
                  </div>
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DisplayField label="Business Name" value={d.businessName || "---"} />
                    <DisplayField label="Business Email" value={d.businessEmail || "---"} />
                    <DisplayField label="Business Phone" value={d.businessPhone || "---"} />
                    <DisplayField label="Business Status" value={d.businessStatus || "---"} />
                    <DisplayField label="Subscription Active" value={d.isSubscriptionActive ? "Yes" : "No"} />
                    <DisplayField label="Stock Management" value={d.enableStock || "---"} />
                    <div className="md:col-span-2">
                      <DisplayField label="Business Address" value={d.businessAddress || "---"} />
                    </div>
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
                    <DisplayField label="Plan Name" value={d.currentPlanName || "---"} />
                    <DisplayField
                      label="Plan Price"
                      value={d.currentPlanPrice !== undefined ? `$${d.currentPlanPrice}` : "---"}
                    />
                    <DisplayField label="Duration Type" value={d.currentPlanDurationType || "---"} />
                    <DisplayField label="Status" value={d.subscriptionStatus || "---"} />
                    <DisplayField label="Start Date" value={d.subscriptionStartDate || "---"} />
                    <DisplayField label="End Date" value={d.subscriptionEndDate || "---"} />
                    <DisplayField
                      label="Days Remaining"
                      value={d.daysRemaining !== undefined ? `${d.daysRemaining} days` : "---"}
                    />
                    <DisplayField
                      label="Days Active"
                      value={d.daysActive !== undefined ? `${d.daysActive} days` : "---"}
                    />
                    <DisplayField label="Auto Renew" value={d.autoRenew ? "Enabled" : "Disabled"} />
                  </div>
                </CardContent>
              </Card>

              {/* Subscription History */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingHistory ? (
                    <div className="flex items-center justify-center py-5">
                      <Loading />
                    </div>
                  ) : subscriptionHistory.length === 0 ? (
                    <div className="flex items-center justify-center py-5">
                      <p className="text-xs text-muted-foreground">No subscription history found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b bg-muted/30">
                            <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">#</th>
                            <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Plan</th>
                            <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Duration</th>
                            <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Price</th>
                            <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Start Date</th>
                            <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">End Date</th>
                            <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Status</th>
                            <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Payment</th>
                            <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Total Paid</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subscriptionHistory.map((row, idx) => (
                            <tr
                              key={row.subscriptionId}
                              className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                            >
                              <td className="px-3 py-2 text-xs text-muted-foreground">{idx + 1}</td>
                              <td className="px-3 py-2 text-xs font-medium">{row.planName || "---"}</td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">{row.planDurationType || "---"}</td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">
                                ${row.planPrice?.toFixed(2) ?? "0.00"}
                              </td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">{row.startDate || "---"}</td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">{row.endDate || "---"}</td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">{row.status || "---"}</td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">
                                {row.paymentStatus?.replace("_", " ") || "---"}
                              </td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">
                                ${row.totalPaid?.toFixed(2) ?? "0.00"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DisplayField
                      label="Owner ID"
                      value={
                        <span className="text-xs font-mono bg-muted px-1 py-1 rounded">
                          {d.ownerId}
                        </span>
                      }
                    />
                    <DisplayField
                      label="Business ID"
                      value={
                        <span className="text-xs font-mono bg-muted px-1 py-1 rounded">
                          {d.businessId}
                        </span>
                      }
                    />
                    <DisplayField label="Created At" value={dateTimeFormat(d.createdAt ?? "")} />
                    <DisplayField label="Created By" value={d.createdBy || "---"} />
                    <DisplayField label="Last Updated" value={dateTimeFormat(d.updatedAt ?? "")} />
                    <DisplayField label="Updated By" value={d.updatedBy || "---"} />
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
