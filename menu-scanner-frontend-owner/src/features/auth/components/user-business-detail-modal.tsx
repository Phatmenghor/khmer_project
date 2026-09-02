"use client";

import { useEffect } from "react";
import { dateTimeFormat, formatDate } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchUserByIdService } from "@/features/auth/store/thunks/users-thunks";
import { clearSelectedUser } from "@/features/auth/store/slice/users-slice";
import {
  selectSelectedUser,
  selectIsFetchingDetail,
} from "../store/selectors/users-selectors";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { cn } from "@/lib/utils";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";

interface UserDetailModalProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
}

function statusColor(s?: string) {
  if (s === "ACTIVE") return "text-green-600";
  if (s === "INACTIVE") return "text-gray-500";
  if (s === "SUSPENDED") return "text-red-600";
  return "text-amber-600";
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
    if (!userId || !isOpen) return;
    dispatch(fetchUserByIdService(userId)).unwrap().catch(() => {});
  }, [userId, isOpen, dispatch]);

  const handleClose = () => {
    dispatch(clearSelectedUser());
    onClose();
  };

  const hasTelegram =
    userData?.telegramId ||
    userData?.telegramUsername ||
    userData?.telegramFirstName ||
    userData?.telegramLastName;

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      isEmpty={!userData}
      emptyMessage="No user data available"
      title={userData?.fullName || "Business User Details"}
      description="Detailed information about the selected business user"
      avatarUrl={userData?.profileImage?.md || userData?.profileImageUrl}
      avatarName={userData?.fullName || userData?.firstName}
      size="5xl"
    >
      {userData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
          <SectionTitle>Personal Information</SectionTitle>
          <InfoRow label="User Identifier" value={userData.userIdentifier || "-"} />
          <InfoRow
            label="Roles"
            value={
              userData.roles && userData.roles.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {userData.roles.map((role) => (
                    <span key={role} className="px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                      {formatEnumValue(role)}
                    </span>
                  ))}
                </div>
              ) : "-"
            }
          />
          <InfoRow
            label="Status"
            value={
              userData.accountStatus ? (
                <span className={cn("text-xs font-bold", statusColor(userData.accountStatus))}>
                  {formatEnumValue(userData.accountStatus)}
                </span>
              ) : "-"
            }
          />
          <InfoRow label="First Name" value={userData.firstName || "-"} />
          <InfoRow label="Last Name" value={userData.lastName || "-"} />
          <InfoRow label="Nickname" value={userData.nickname || "-"} />
          <InfoRow label="Phone" value={userData.phoneNumber || "-"} />
          <InfoRow
            label="Gender"
            value={userData.gender ? formatEnumValue(userData.gender) : "-"}
          />
          <InfoRow label="Date of Birth" value={userData.dateOfBirth ? formatDate(userData.dateOfBirth) : "-"} />
          <InfoRow label="Email" value={userData.email || "-"} fullWidth />

          {/* Business Information */}
          <SectionTitle>Business Information</SectionTitle>
          <InfoRow label="Business Name" value={userData.businessName || "-"} />
          <InfoRow label="Business ID" value={userData.businessId || "-"} />

          {(userData.employeeId || userData.position || userData.department || userData.employmentType || userData.joinDate) && (
            <>
              <SectionTitle>Employment Information</SectionTitle>
              <InfoRow label="Employee ID" value={userData.employeeId || "-"} />
              <InfoRow label="Position" value={userData.position || "-"} />
              <InfoRow label="Department" value={userData.department || "-"} />
              <InfoRow label="Employment Type" value={userData.employmentType ? formatEnumValue(userData.employmentType) : "-"} />
              <InfoRow label="Join Date" value={userData.joinDate ? formatDate(userData.joinDate) : "-"} />
            </>
          )}

          {hasTelegram && (
            <>
              <SectionTitle>Telegram</SectionTitle>
              <InfoRow label="ID" value={userData.telegramId || "-"} />
              <InfoRow
                label="Username"
                value={
                  userData.telegramUsername
                    ? `@${userData.telegramUsername}`
                    : "-"
                }
              />
              <InfoRow
                label="Name"
                value={
                  [userData.telegramFirstName, userData.telegramLastName]
                    .filter(Boolean)
                    .join(" ") || "-"
                }
              />
              <InfoRow
                label="Synced"
                value={
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-xs font-semibold inline-block",
                      userData.telegramSynced
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {userData.telegramSynced ? "Yes" : "No"}
                  </span>
                }
              />
              <InfoRow label="Synced At" value={userData.telegramSyncedAt ? dateTimeFormat(userData.telegramSyncedAt) : "-"} />
            </>
          )}

          <SectionTitle>System Info</SectionTitle>
          <InfoRow label="User ID" value={userData.id || "-"} />
          <InfoRow label="Created By" value={userData.createdBy || "-"} />
          <InfoRow
            label="Created At"
            value={dateTimeFormat(userData.createdAt ?? "")}
          />
          <InfoRow label="Updated By" value={userData.updatedBy || "-"} />
          <InfoRow
            label="Last Updated"
            value={dateTimeFormat(userData.updatedAt ?? "")}
          />

          {userData.remark && (
            <div className="col-span-2 rounded border border-border bg-muted/10 p-2 text-left mt-2">
              <SectionTitle>Remarks</SectionTitle>
              <p className="text-xs text-foreground leading-relaxed">
                {userData.remark}
              </p>
            </div>
          )}
        </div>
      )}
    </DetailModal>
  );
}
