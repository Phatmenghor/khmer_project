"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    const fetchData = async () => {
      if (!businessOwnerId || !isOpen) return;
      try {
        await dispatch(fetchBusinessOwnerByIdService(businessOwnerId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching business owner data:", error);
      }
    };
    fetchData();
  }, [businessOwnerId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedBusinessOwner());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Business Owner Details</DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="h-14 w-14 rounded-lg overflow-hidden bg-primary/10 border border-border flex-shrink-0 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {d?.ownerFullName?.charAt(0)?.toUpperCase() || "B"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">
                Business Owner Details
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
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
            <div className="p-6 space-y-6">

              {/* Owner Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Owner Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField
                      label="Owner ID"
                      value={
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {d.ownerId}
                        </span>
                      }
                    />
                    <DisplayField
                      label="Business ID"
                      value={
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
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
