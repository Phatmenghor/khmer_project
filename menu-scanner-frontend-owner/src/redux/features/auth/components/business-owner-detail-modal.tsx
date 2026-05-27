"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectIsFetchingDetail,
  selectSelectedBusinessOwner,
} from "../store/selectors/business-owner-selectors";
import { fetchBusinessOwnerByIdService } from "../store/thunks/business-owner-thunks";
import { clearSelectedBusinessOwner } from "../store/slice/business-owner-slice";
import { getStatusColor } from "@/utils/styles/enum-style";

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
  const businessOwnerData = useAppSelector(selectSelectedBusinessOwner);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!businessOwnerId || !isOpen) return;
      try {
        await dispatch(fetchBusinessOwnerByIdService(businessOwnerId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching business owner data:", error);
      }
    };
    fetchUserData();
  }, [businessOwnerId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedBusinessOwner());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title="Business Owner Details"
      description={
        businessOwnerData?.ownerFullName || "Loading business owner information..."
      }
      avatarName={businessOwnerData?.ownerFullName}
    >
      {businessOwnerData ? (
        <div className="space-y-6">
          {/* Owner Information */}
          <DetailSection title="Owner Information">
            <DetailRow
              label="User Identifier"
              value={businessOwnerData.ownerUserIdentifier || "---"}
            />
            <DetailRow
              label="Full Name"
              value={businessOwnerData.ownerFullName || "---"}
            />
            <DetailRow
              label="Email"
              value={businessOwnerData.ownerEmail || "---"}
            />
            <DetailRow
              label="Phone"
              value={businessOwnerData.ownerPhone || "---"}
            />
            <DetailRow
              label="Account Status"
              value={
                <Badge
                  variant="outline"
                  className={getStatusColor(businessOwnerData.ownerAccountStatus)}
                >
                  {businessOwnerData.ownerAccountStatus || "---"}
                </Badge>
              }
              isLast
            />
          </DetailSection>

          {/* Business Information */}
          <DetailSection title="Business Information">
            <DetailRow
              label="Business Name"
              value={businessOwnerData.businessName || "---"}
            />
            <DetailRow
              label="Business Email"
              value={businessOwnerData.businessEmail || "---"}
            />
            <DetailRow
              label="Business Phone"
              value={businessOwnerData.businessPhone || "---"}
            />
            <DetailRow
              label="Business Address"
              value={businessOwnerData.businessAddress || "---"}
            />
            <DetailRow
              label="Business Status"
              value={
                <Badge
                  variant="outline"
                  className={getStatusColor(businessOwnerData.businessStatus)}
                >
                  {businessOwnerData.businessStatus || "---"}
                </Badge>
              }
            />
            <DetailRow
              label="Subscription Active"
              value={businessOwnerData.isSubscriptionActive ? "Yes" : "No"}
            />
            <DetailRow
              label="Stock Management"
              value={businessOwnerData.enableStock || "---"}
              isLast
            />
          </DetailSection>

          {/* Subscription Information */}
          <DetailSection title="Subscription Information">
            <DetailRow
              label="Plan Name"
              value={businessOwnerData.currentPlanName || "---"}
            />
            <DetailRow
              label="Plan Price"
              value={
                businessOwnerData.currentPlanPrice !== undefined
                  ? `$${businessOwnerData.currentPlanPrice}`
                  : "---"
              }
            />
            <DetailRow
              label="Duration Type"
              value={businessOwnerData.currentPlanDurationType || "---"}
            />
            <DetailRow
              label="Start Date"
              value={businessOwnerData.subscriptionStartDate || "---"}
            />
            <DetailRow
              label="End Date"
              value={businessOwnerData.subscriptionEndDate || "---"}
            />
            <DetailRow
              label="Days Remaining"
              value={
                businessOwnerData.daysRemaining !== undefined
                  ? `${businessOwnerData.daysRemaining} days`
                  : "---"
              }
            />
            <DetailRow
              label="Days Active"
              value={
                businessOwnerData.daysActive !== undefined
                  ? `${businessOwnerData.daysActive} days`
                  : "---"
              }
            />
            <DetailRow
              label="Subscription Status"
              value={
                <Badge
                  variant="outline"
                  className={getStatusColor(businessOwnerData.subscriptionStatus)}
                >
                  {businessOwnerData.subscriptionStatus || "---"}
                </Badge>
              }
            />
            <DetailRow
              label="Auto Renew"
              value={businessOwnerData.autoRenew ? "Enabled" : "Disabled"}
              isLast
            />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Owner ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                  {businessOwnerData.ownerId}
                </span>
              }
            />
            <DetailRow
              label="Business ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                  {businessOwnerData.businessId}
                </span>
              }
            />
            <DetailRow
              label="Created At"
              value={businessOwnerData.createdAt || "---"}
            />
            <DetailRow
              label="Created By"
              value={businessOwnerData.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={businessOwnerData.updatedAt || "---"}
            />
            <DetailRow
              label="Updated By"
              value={businessOwnerData.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No business owner data available</p>
        </div>
      )}
    </DetailModal>
  );
}
