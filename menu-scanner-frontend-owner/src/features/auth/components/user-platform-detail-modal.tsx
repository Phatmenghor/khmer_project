"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatEnumLabel } from "@/utils/common/enum-convert";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchUserByIdService } from "@/features/auth/store/thunks/users-thunks";
import { clearSelectedUser } from "@/features/auth/store/slice/users-slice";
import {
  selectSelectedUser,
  selectIsFetchingDetail,
} from "../store/selectors/users-selectors";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { User } from "lucide-react";

interface UserPlatformDetailModalProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserPlatformDetailModal({ userId, isOpen, onClose }: UserPlatformDetailModalProps) {
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
      isEmpty={!isFetchingDetail && !userData}
      emptyMessage="No user data available"
      title="Platform User Details"
      description={
        userData
          ? userData.fullName || `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "—"
          : "Detailed information about the selected platform user"
      }
      imageUrl={userData?.profileImageUrl}
      avatarName={userData?.firstName || "U"}
      icon={User}
      maxWidthClass="sm:max-w-7xl"
    >
      {userData && (
        <>
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField label="Full Name" value={userData.fullName || "—"} />
                <DisplayField label="Email" value={userData.email || "—"} />
                <DisplayField label="Phone Number" value={userData.phoneNumber || "—"} />
                <DisplayField label="Nickname" value={userData.nickname || "—"} />
                <DisplayField label="Gender" value={formatEnumLabel(userData.gender) ?? "—"} />
                <DisplayField label="Date of Birth" value={userData.dateOfBirth || "—"} />
                <DisplayField label="User Identifier" value={userData.userIdentifier || "—"} />
                <DisplayField label="User Type" value={formatEnumLabel(userData.userType) ?? "—"} />
                <DisplayField label="Account Status" value={formatEnumLabel(userData.accountStatus) ?? "—"} />
                <DisplayField
                  label="Roles"
                  value={
                    userData.roles?.length > 0
                      ? userData.roles.map((r) => formatEnumLabel(r) ?? r).join(", ")
                      : "—"
                  }
                />
                {userData.remark && (
                  <div className="md:col-span-2">
                    <DisplayField label="Remark" value={userData.remark} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Telegram Information */}
          <Card>
            <CardHeader>
              <CardTitle>Telegram</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DisplayField
                  label="Synced"
                  value={userData.telegramSynced ? "Connected" : "Not Connected"}
                />
                <DisplayField label="Username" value={userData.telegramUsername || "—"} />
                <DisplayField label="First Name" value={userData.telegramFirstName || "—"} />
                <DisplayField label="Last Name" value={userData.telegramLastName || "—"} />
                <DisplayField
                  label="Synced At"
                  value={userData.telegramSyncedAt ? dateTimeFormat(userData.telegramSyncedAt) : "—"}
                />
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
                <DisplayField label="User ID" value={userData.id} />
                <DisplayField
                  label="Last Login"
                  value={userData.lastLoginAt ? dateTimeFormat(userData.lastLoginAt) : "—"}
                />
                <DisplayField label="Created At" value={dateTimeFormat(userData.createdAt ?? "")} />
                <DisplayField label="Created By" value={userData.createdBy || "—"} />
                <DisplayField label="Last Updated" value={dateTimeFormat(userData.updatedAt ?? "")} />
                <DisplayField label="Updated By" value={userData.updatedBy || "—"} />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </DetailModal>
  );
}
