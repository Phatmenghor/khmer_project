"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchUserByIdService } from "@/features/auth/store/thunks/users-thunks";
import { clearSelectedUser } from "@/features/auth/store/slice/users-slice";
import {
  selectSelectedUser,
  selectIsFetchingDetail,
} from "../store/selectors/users-selectors";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/shared/image/smart-image";
import { DetailModal } from "@/components/shared/modal/detail-modal";

interface UserDetailModalProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-2 mt-2 mb-0.5 first:mt-0 border-b border-border/40 pb-1">
      <h3 className="text-xs font-bold text-primary">
        {children}
      </h3>
    </div>
  );
}

function InfoRow({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5 min-w-0", fullWidth && "col-span-2")}>
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <span className="text-xs text-foreground break-all whitespace-normal">{value || "-"}</span>
    </div>
  );
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

  const hasEmployment =
    userData?.employeeId ||
    userData?.position ||
    userData?.department ||
    userData?.employmentType ||
    userData?.joinDate ||
    userData?.leaveDate ||
    userData?.shift;

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isFetchingDetail}
      isEmpty={!userData}
      emptyMessage="No user data available"
      title={userData?.fullName || "User Details"}
      description="Manage user accounts and permissions"
      avatarUrl={userData?.profileImage?.md}
      avatarName={userData?.fullName}
      size="5xl"
    >
      {userData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
          {/* Personal Information */}
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
          <InfoRow label="Date of Birth" value={userData.dateOfBirth || "-"} />
          <InfoRow label="Email" value={userData.email || "-"} fullWidth />

          {/* Employment Information */}
          {hasEmployment && (
            <>
              <SectionTitle>Employment</SectionTitle>
              <InfoRow label="Employee ID" value={userData.employeeId || "-"} />
              <InfoRow label="Position" value={userData.position || "-"} />
              <InfoRow label="Department" value={userData.department || "-"} />
              <InfoRow
                label="Type"
                value={
                  userData.employmentType
                    ? formatEnumValue(userData.employmentType)
                    : "-"
                }
              />
              <InfoRow label="Join Date" value={userData.joinDate || "-"} />
              <InfoRow label="Leave Date" value={userData.leaveDate || "-"} />
              <InfoRow label="Shift" value={userData.shift} />
            </>
          )}

          {/* Telegram */}
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
              <InfoRow label="Synced At" value={userData.telegramSyncedAt} />
            </>
          )}

          {/* Addresses */}
          {userData.addresses && userData.addresses.length > 0 && (
            <div className="col-span-2 space-y-2">
              <SectionTitle>Addresses ({userData.addresses.length})</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {userData.addresses.map((addr: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2 rounded border border-border/40 bg-muted/20 text-left"
                  >
                    <div className="flex items-center gap-1 mb-1.5">
                      <span className="text-xs font-semibold text-foreground">
                        Address {idx + 1}
                      </span>
                      {addr.addressType && (
                        <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                          {formatEnumValue(addr.addressType)}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <InfoRow label="House No" value={addr.houseNo || "-"} />
                      <InfoRow label="Street" value={addr.street || "-"} />
                      <InfoRow label="Village" value={addr.village || "-"} />
                      <InfoRow label="Commune" value={addr.commune || "-"} />
                      <InfoRow label="District" value={addr.district || "-"} />
                      <InfoRow label="Province" value={addr.province || "-"} />
                      <InfoRow label="Country" value={addr.country} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Contacts */}
          {userData.emergencyContacts &&
            userData.emergencyContacts.length > 0 && (
              <div className="col-span-2 space-y-2">
                <SectionTitle>Emergency Contacts ({userData.emergencyContacts.length})</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {userData.emergencyContacts.map((c: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 rounded border border-border/40 bg-muted/20 text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">
                          {c.name || "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.relationship || "-"}
                        </p>
                      </div>
                      <span className="text-xs text-foreground font-mono flex-shrink-0">
                        {c.phone || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Documents */}
          {userData.documents && userData.documents.length > 0 && (
            <div className="col-span-2 space-y-2">
              <SectionTitle>Documents ({userData.documents.length})</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {userData.documents.map((doc: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex gap-2 p-2 rounded border border-border/40 bg-muted/20 text-left"
                  >
                    {doc.fileUrl && (
                      <div className="relative flex-shrink-0 w-12 h-12 rounded overflow-hidden border border-border/50">
                        <SmartImage
                          src={doc.fileUrl}
                          alt="Document"
                          fill
                          showSkeleton={false}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">
                        {doc.type ? formatEnumValue(doc.type) : "-"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {doc.number || "-"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {userData.educations && userData.educations.length > 0 && (
            <div className="col-span-2 space-y-2">
              <SectionTitle>Education ({userData.educations.length})</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {userData.educations.map((edu: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex gap-2 p-2 rounded border border-border/40 bg-muted/20 text-left"
                  >
                    {edu.certificateUrl && (
                      <div className="relative flex-shrink-0 w-12 h-12 rounded overflow-hidden border border-border/50">
                        <SmartImage
                          src={edu.certificateUrl}
                          alt="Certificate"
                          fill
                          showSkeleton={false}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
                      <InfoRow
                        label="Level"
                        value={edu.level ? formatEnumValue(edu.level) : "-"}
                      />
                      <InfoRow label="School" value={edu.schoolName || "-"} />
                      <InfoRow
                        label="Field"
                        value={edu.fieldOfStudy || "-"}
                      />
                      <InfoRow
                        label="Period"
                        value={
                          edu.startYear && edu.endYear
                            ? `${edu.startYear} – ${edu.endYear}`
                            : edu.startYear || "-"
                        }
                      />
                      <InfoRow
                        label="Graduated"
                        value={
                          edu.isGraduated === true ||
                          edu.isGraduated === "true" ? (
                            <span className="text-green-600 font-semibold">
                              Yes
                            </span>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Info */}
          <SectionTitle>System Info</SectionTitle>
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

          {/* Remarks */}
          {userData.remark && (
            <div className="col-span-2 rounded border border-border/40 bg-muted/10 p-2 text-left mt-2">
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
