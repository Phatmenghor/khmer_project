"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { SectionTitle } from "@/components/shared/common/section-title";
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
import { User, Building2, CreditCard, History, Info } from "lucide-react";

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
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title="Business Owner"
      description="Manage business owner accounts and subscriptions"
      icon={Building2}
      maxWidthClass="sm:max-w-6xl"
    >
      {!d ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-xs text-muted-foreground">No data available</p>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <SectionTitle icon={User} title="Owner Information" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField label="User Identifier" value={d.ownerUserIdentifier} />
                <DisplayField label="Full Name" value={d.ownerFullName} />
                <DisplayField label="Email" value={d.ownerEmail} />
                <DisplayField label="Phone" value={d.ownerPhone} />
                <DisplayField label="Account Status" value={d.ownerAccountStatus} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionTitle icon={Building2} title="Business Information" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField label="Business Name" value={d.businessName} />
                <DisplayField label="Business Email" value={d.businessEmail} />
                <DisplayField label="Business Phone" value={d.businessPhone} />
                <DisplayField label="Business Status" value={d.businessStatus} />
                <DisplayField label="Subscription Active" value={d.isSubscriptionActive ? "Yes" : "No"} />
                <DisplayField label="Stock Management" value={d.enableStock} />
                <DisplayField label="Business Address" value={d.businessAddress} fullWidth />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionTitle icon={CreditCard} title="Subscription Information" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField label="Plan Name" value={d.currentPlanName} />
                <DisplayField
                  label="Plan Price"
                  value={d.currentPlanPrice !== undefined ? `$${d.currentPlanPrice}` : undefined}
                />
                <DisplayField label="Duration Type" value={d.currentPlanDurationType} />
                <DisplayField label="Status" value={d.subscriptionStatus} />
                <DisplayField label="Start Date" value={d.subscriptionStartDate} />
                <DisplayField label="End Date" value={d.subscriptionEndDate} />
                <DisplayField
                  label="Days Remaining"
                  value={d.daysRemaining !== undefined ? `${d.daysRemaining} days` : undefined}
                />
                <DisplayField
                  label="Days Active"
                  value={d.daysActive !== undefined ? `${d.daysActive} days` : undefined}
                />
                <DisplayField label="Auto Renew" value={d.autoRenew ? "Enabled" : "Disabled"} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionTitle
                icon={History}
                title="Subscription History"
                subtitle={
                  subscriptionHistory.length > 0
                    ? `${subscriptionHistory.length} previous plan${subscriptionHistory.length > 1 ? "s" : ""}`
                    : undefined
                }
              />
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
                        <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">#</th>
                        <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Plan</th>
                        <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Duration</th>
                        <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Price</th>
                        <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Start Date</th>
                        <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">End Date</th>
                        <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Status</th>
                        <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Payment</th>
                        <th className="text-left px-3 py-2 text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">Total Paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptionHistory.map((row, idx) => (
                        <tr
                          key={row.subscriptionId}
                          className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-3 py-2 text-xs text-muted-foreground">{idx + 1}</td>
                          <td className="px-3 py-2 text-xs font-medium">{row.planName || "—"}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{row.planDurationType || "—"}</td>
                          <td className="px-3 py-2 text-xs text-foreground tabular-nums">
                            ${row.planPrice?.toFixed(2) ?? "0.00"}
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{row.startDate || "—"}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{row.endDate || "—"}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">{row.status || "—"}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {row.paymentStatus?.replace("_", " ") || "—"}
                          </td>
                          <td className="px-3 py-2 text-xs text-foreground tabular-nums">
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

          <Card>
            <CardHeader>
              <SectionTitle icon={Info} title="System Information" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField label="Owner ID" value={d.ownerId} mono />
                <DisplayField label="Business ID" value={d.businessId} mono />
                <DisplayField label="Created At" value={dateTimeFormat(d.createdAt ?? "")} />
                <DisplayField label="Created By" value={d.createdBy} />
                <DisplayField label="Last Updated" value={dateTimeFormat(d.updatedAt ?? "")} />
                <DisplayField label="Updated By" value={d.updatedBy} />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </DetailModal>
  );
}
