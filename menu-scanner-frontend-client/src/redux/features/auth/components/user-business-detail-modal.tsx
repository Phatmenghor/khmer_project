"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchUserByIdService } from "@/redux/features/auth/store/thunks/users-thunks";
import { clearSelectedUser } from "@/redux/features/auth/store/slice/users-slice";
import {
  selectSelectedUser,
  selectIsFetchingDetail,
} from "../store/selectors/users-selectors";
import { formatEnumToDisplay } from "@/utils/styles/enum-style";

interface UserDetailModalProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserBusinessDetailModal({
  userId,
  isOpen,
  onClose,
}: UserDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const userData = useAppSelector(selectSelectedUser);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId || !isOpen) return;

      try {
        await dispatch(fetchUserByIdService(userId)).unwrap();
      } catch (error: any) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedUser());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      title={"User Business Details"}
      description={userData?.userIdentifier || "Loading user information..."}
      avatarUrl={userData?.profileImageUrl}
      avatarName={userData?.fullName}
    >
      {userData ? (
        <div className="space-y-6">
          {/* Personal Information */}
          <DetailSection title="Personal Information">
            <DetailRow label="Full Name" value={userData?.fullName || "---"} />
            <DetailRow label="Email" value={userData?.email || "---"} />
            <DetailRow
              label="Phone Number"
              value={userData?.phoneNumber || "---"}
            />
            <DetailRow label="Position" value={userData?.position || "---"} />
            <DetailRow label="Address" value={userData?.address || "---"} />
            <DetailRow
              label="User Identifier"
              value={userData?.userIdentifier || "---"}
            />
            <DetailRow
              label="User Type"
              value={formatEnumToDisplay(userData?.userType)}
            />
            <DetailRow
              label="Account Status"
              value={formatEnumToDisplay(userData?.accountStatus)}
            />
            <DetailRow
              label="Business"
              value={userData?.businessName || "---"}
            />

            {/* Roles */}
            {userData?.roles && userData?.roles.length > 0 && (
              <DetailRow
                label="Roles"
                value={
                  <div className="flex flex-wrap gap-2 justify-end">
                    {userData.roles.map((role, index) => (
                      <Badge key={index} variant="secondary">
                        {formatEnumToDisplay(role)}
                      </Badge>
                    ))}
                  </div>
                }
              />
            )}

            {/* Notes */}
            {userData?.notes && (
              <DetailRow label="Notes" value={userData.notes} isLast />
            )}
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="User ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {userData?.id}
                </span>
              }
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(userData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={userData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(userData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={userData?.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No user data available</p>
        </div>
      )}
    </DetailModal>
  );
}
