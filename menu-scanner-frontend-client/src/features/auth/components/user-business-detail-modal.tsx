"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchUserByIdService } from "@/features/auth/store/thunks/users-thunks";
import { clearSelectedUser } from "@/features/auth/store/slice/users-slice";
import {
  selectSelectedUser,
  selectIsFetchingDetail,
} from "../store/selectors/users-selectors";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { Loading } from "@/components/shared/common/loading";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface UserDetailModalProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5">
      <h3 className="text-xs font-bold text-foreground">
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
    <div className={cn("flex flex-col gap-0.5", fullWidth && "col-span-2")}>
      <span className="text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <span className="text-xs text-foreground break-words">{value ?? "---"}</span>
    </div>
  );
}

function statusColor(s?: string) {
  if (s === "ACTIVE") return "bg-green-100 text-green-700";
  if (s === "INACTIVE") return "bg-gray-100 text-gray-500";
  if (s === "SUSPENDED") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
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

  if (isFetchingDetail) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">User Details Loading</DialogTitle>
        <DialogContent className="w-full sm:max-w-5xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <Loading />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!userData) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">User Details</DialogTitle>
        <DialogContent className="w-full sm:max-w-5xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-muted-foreground">No user data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const initials = [userData.firstName, userData.lastName]
    .filter(Boolean)
    .map((n) => n!.charAt(0).toUpperCase())
    .join("") || userData.fullName?.charAt(0)?.toUpperCase() || "U";

  const hasTelegram =
    userData.telegramId ||
    userData.telegramUsername ||
    userData.telegramFirstName ||
    userData.telegramLastName;

  const hasEmployment =
    userData.employeeId ||
    userData.position ||
    userData.department ||
    userData.employmentType ||
    userData.joinDate ||
    userData.leaveDate ||
    userData.shift;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">
        User Details - {userData.fullName}
      </DialogTitle>

      <DialogContent className="w-full sm:max-w-5xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0 flex items-center gap-3">
          <div className="relative flex-shrink-0 w-14 h-14 rounded-full overflow-hidden bg-primary/10 border border-border/50">
            {userData.profileImageUrl ? (
              <img
                src={userData.profileImageUrl}
                alt={userData.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{initials}</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">
              {userData.fullName || userData.userIdentifier || "---"}
            </p>
            <div className="flex flex-wrap gap-2 mt-0.5">
              {userData.email && (
                <span className="text-xs text-muted-foreground">{userData.email}</span>
              )}
              {userData.userIdentifier && userData.userIdentifier !== userData.email && (
                <span className="text-xs text-muted-foreground font-mono">
                  @{userData.userIdentifier}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 grid grid-cols-1 lg:grid-cols-3 gap-3">

            {/* ── Left column ── */}
            <div className="lg:col-span-2 space-y-3">

              {/* Personal Information */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>Personal Information</SectionTitle>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <InfoRow
                    label="Status"
                    value={
                      userData.accountStatus ? (
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold", statusColor(userData.accountStatus))}>
                          {formatEnumValue(userData.accountStatus)}
                        </span>
                      ) : "---"
                    }
                  />
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
                      ) : "---"
                    }
                  />
                  <InfoRow label="First Name" value={userData.firstName || "---"} />
                  <InfoRow label="Last Name" value={userData.lastName || "---"} />
                  <InfoRow label="Nickname" value={userData.nickname || "---"} />
                  <InfoRow label="Phone" value={userData.phoneNumber || "---"} />
                  <InfoRow
                    label="Gender"
                    value={userData.gender ? formatEnumValue(userData.gender) : "---"}
                  />
                  <InfoRow label="Date of Birth" value={userData.dateOfBirth || "---"} />
                  <InfoRow label="Email" value={userData.email || "---"} fullWidth />
                </div>
              </div>

              {/* Employment Information */}
              {hasEmployment && (
                <div className="rounded border border-border/50 bg-card p-3">
                  <SectionTitle>Employment</SectionTitle>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    <InfoRow label="Employee ID" value={userData.employeeId || "---"} />
                    <InfoRow label="Position" value={userData.position || "---"} />
                    <InfoRow label="Department" value={userData.department || "---"} />
                    <InfoRow
                      label="Type"
                      value={
                        userData.employmentType
                          ? formatEnumValue(userData.employmentType)
                          : "---"
                      }
                    />
                    <InfoRow label="Join Date" value={userData.joinDate || "---"} />
                    <InfoRow label="Leave Date" value={userData.leaveDate || "---"} />
                    {userData.shift && (
                      <InfoRow label="Shift" value={userData.shift} />
                    )}
                  </div>
                </div>
              )}

              {/* Addresses */}
              {userData.addresses && userData.addresses.length > 0 && (
                <div className="rounded border border-border/50 bg-card p-3">
                  <SectionTitle>
                    Addresses ({userData.addresses.length})
                  </SectionTitle>
                  <div className="space-y-2">
                    {userData.addresses.map((addr: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2 rounded border border-border/40 bg-muted/20"
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
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                          <InfoRow label="House No" value={addr.houseNo || "---"} />
                          <InfoRow label="Street" value={addr.street || "---"} />
                          <InfoRow label="Village" value={addr.village || "---"} />
                          <InfoRow label="Commune" value={addr.commune || "---"} />
                          <InfoRow label="District" value={addr.district || "---"} />
                          <InfoRow label="Province" value={addr.province || "---"} />
                          {addr.country && (
                            <InfoRow label="Country" value={addr.country} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Contacts */}
              {userData.emergencyContacts &&
                userData.emergencyContacts.length > 0 && (
                  <div className="rounded border border-border/50 bg-card p-3">
                    <SectionTitle>
                      Emergency Contacts ({userData.emergencyContacts.length})
                    </SectionTitle>
                    <div className="space-y-1.5">
                      {userData.emergencyContacts.map((c: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-2 rounded border border-border/40 bg-muted/20"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground">
                              {c.name || "---"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {c.relationship || "---"}
                            </p>
                          </div>
                          <span className="text-xs text-foreground font-mono flex-shrink-0">
                            {c.phone || "---"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Documents */}
              {userData.documents && userData.documents.length > 0 && (
                <div className="rounded border border-border/50 bg-card p-3">
                  <SectionTitle>
                    Documents ({userData.documents.length})
                  </SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {userData.documents.map((doc: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex gap-2.5 p-2 rounded border border-border/40 bg-muted/20"
                      >
                        {doc.fileUrl && (
                          <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden border border-border/50">
                            <img
                              src={doc.fileUrl}
                              alt="Document"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">
                            {doc.type ? formatEnumValue(doc.type) : "---"}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {doc.number || "---"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {userData.educations && userData.educations.length > 0 && (
                <div className="rounded border border-border/50 bg-card p-3">
                  <SectionTitle>
                    Education ({userData.educations.length})
                  </SectionTitle>
                  <div className="space-y-2">
                    {userData.educations.map((edu: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex gap-2.5 p-2 rounded border border-border/40 bg-muted/20"
                      >
                        {edu.certificateUrl && (
                          <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden border border-border/50">
                            <img
                              src={edu.certificateUrl}
                              alt="Certificate"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-3 gap-y-1">
                          <InfoRow
                            label="Level"
                            value={edu.level ? formatEnumValue(edu.level) : "---"}
                          />
                          <InfoRow label="School" value={edu.schoolName || "---"} />
                          <InfoRow
                            label="Field"
                            value={edu.fieldOfStudy || "---"}
                          />
                          <InfoRow
                            label="Period"
                            value={
                              edu.startYear && edu.endYear
                                ? `${edu.startYear} – ${edu.endYear}`
                                : edu.startYear || "---"
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

              {/* Remarks */}
              {userData.remark && (
                <div className="rounded border border-amber-200 bg-amber-50 p-3">
                  <SectionTitle>Remarks</SectionTitle>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    {userData.remark}
                  </p>
                </div>
              )}
            </div>

            {/* ── Right sidebar ── */}
            <div className="space-y-3">

              {/* Telegram */}
              {hasTelegram && (
                <div className="rounded border border-border/50 bg-card p-3">
                  <SectionTitle>Telegram</SectionTitle>
                  <div className="space-y-2">
                    <InfoRow label="ID" value={userData.telegramId || "---"} />
                    <InfoRow
                      label="Username"
                      value={
                        userData.telegramUsername
                          ? `@${userData.telegramUsername}`
                          : "---"
                      }
                    />
                    <InfoRow
                      label="Name"
                      value={
                        [userData.telegramFirstName, userData.telegramLastName]
                          .filter(Boolean)
                          .join(" ") || "---"
                      }
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Synced
                      </span>
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-xs font-semibold",
                          userData.telegramSynced
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        )}
                      >
                        {userData.telegramSynced ? "Yes" : "No"}
                      </span>
                    </div>
                    {userData.telegramSyncedAt && (
                      <InfoRow
                        label="Synced At"
                        value={userData.telegramSyncedAt}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* System Info */}
              <div className="rounded border border-border/50 bg-card p-3">
                <SectionTitle>System Info</SectionTitle>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  <InfoRow
                    label="User Type"
                    value={
                      userData.userType
                        ? formatEnumValue(userData.userType)
                        : "---"
                    }
                  />
<InfoRow label="Created By" value={userData.createdBy || "---"} />
                  <InfoRow
                    label="Created At"
                    value={dateTimeFormat(userData.createdAt ?? "")}
                  />
                  <InfoRow label="Updated By" value={userData.updatedBy || "---"} />
                  <InfoRow
                    label="Last Updated"
                    value={dateTimeFormat(userData.updatedAt ?? "")}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
