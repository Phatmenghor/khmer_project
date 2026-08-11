"use client";

import { DetailModal } from "@/components/shared/modal/detail-modal";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";
import { CustomImagePreview } from "@/components/shared/image/custom-image-preview";
import { cn } from "@/lib/utils";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { dateTimeFormat, formatDate } from "@/utils/date/date-time-format";
import {
  ADDRESS_TYPE_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
} from "@/constants/status/user-enums";
import {
  GENDER_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
} from "@/constants/form-options";

interface ProfileViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
}

function statusColor(s?: string) {
  if (s === "ACTIVE") return "text-green-600";
  if (s === "INACTIVE") return "text-gray-500";
  if (s === "SUSPENDED") return "text-red-600";
  return "text-amber-600";
}

export function ProfileViewModal({
  isOpen,
  onClose,
  userProfile,
}: ProfileViewModalProps) {
  if (!userProfile) return null;

  const hasEmployment =
    userProfile.employeeId ||
    userProfile.position ||
    userProfile.department ||
    userProfile.employmentType ||
    userProfile.joinDate ||
    userProfile.leaveDate ||
    userProfile.shift;

  const hasTelegram =
    userProfile.telegramId ||
    userProfile.telegramUsername ||
    userProfile.telegramFirstName ||
    userProfile.telegramLastName;

  const hasAddresses = userProfile.addresses?.length > 0;
  const hasContacts = userProfile.emergencyContacts?.length > 0;
  const hasDocuments = userProfile.documents?.length > 0;
  const hasEducations = userProfile.educations?.length > 0;

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={userProfile.fullName || "My Profile"}
      description={userProfile.email || ""}
      avatarUrl={userProfile.profileImage?.md}
      avatarName={userProfile.fullName}
      size="5xl"
      badges={
        userProfile.userType ? (
          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-wider">
            {userProfile.userType}
          </span>
        ) : undefined
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">

        {/* ── Personal Information ── */}
        <SectionTitle>Personal Information</SectionTitle>
        <InfoRow label="First Name" value={userProfile.firstName || "-"} />
        <InfoRow label="Last Name" value={userProfile.lastName || "-"} />
        <InfoRow label="Nickname" value={userProfile.nickname || "-"} />
        <InfoRow label="Email" value={userProfile.email || "-"} fullWidth />
        <InfoRow label="Phone" value={userProfile.phoneNumber || "-"} />
        <InfoRow
          label="Gender"
          value={
            GENDER_OPTIONS.find((o) => o.value === userProfile.gender)?.label ||
            userProfile.gender ||
            "-"
          }
        />
        <InfoRow
          label="Date of Birth"
          value={userProfile.dateOfBirth ? formatDate(userProfile.dateOfBirth) : "-"}
        />
        <InfoRow
          label="Account Status"
          value={
            userProfile.accountStatus ? (
              <span className={cn("text-xs font-bold", statusColor(userProfile.accountStatus))}>
                {formatEnumValue(userProfile.accountStatus)}
              </span>
            ) : "-"
          }
        />
        <InfoRow
          label="Roles"
          value={
            userProfile.roles?.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {userProfile.roles.map((role: string) => (
                  <span key={role} className="px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                    {formatEnumValue(role)}
                  </span>
                ))}
              </div>
            ) : "-"
          }
        />

        {/* ── Employment ── */}
        {hasEmployment && (
          <>
            <SectionTitle>Employment</SectionTitle>
            <InfoRow label="Employee ID" value={userProfile.employeeId || "-"} />
            <InfoRow label="Position" value={userProfile.position || "-"} />
            <InfoRow label="Department" value={userProfile.department || "-"} />
            <InfoRow
              label="Employment Type"
              value={
                EMPLOYMENT_TYPE_OPTIONS.find((o) => o.value === userProfile.employmentType)?.label ||
                userProfile.employmentType ||
                "-"
              }
            />
            <InfoRow label="Join Date" value={userProfile.joinDate ? formatDate(userProfile.joinDate) : "-"} />
            <InfoRow label="Leave Date" value={userProfile.leaveDate ? formatDate(userProfile.leaveDate) : "-"} />
            <InfoRow label="Shift" value={userProfile.shift || "-"} />
          </>
        )}

        {/* ── Telegram ── */}
        {hasTelegram && (
          <>
            <SectionTitle>Telegram</SectionTitle>
            <InfoRow label="ID" value={userProfile.telegramId || "-"} />
            <InfoRow
              label="Username"
              value={userProfile.telegramUsername ? `@${userProfile.telegramUsername}` : "-"}
            />
            <InfoRow
              label="Name"
              value={
                [userProfile.telegramFirstName, userProfile.telegramLastName]
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
                    userProfile.telegramSynced
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  )}
                >
                  {userProfile.telegramSynced ? "Yes" : "No"}
                </span>
              }
            />
            <InfoRow label="Synced At" value={dateTimeFormat(userProfile.telegramSyncedAt)} />
          </>
        )}

        {/* ── Addresses ── */}
        {hasAddresses && (
          <div className="col-span-2 space-y-2">
            <SectionTitle>Addresses ({userProfile.addresses.length})</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {userProfile.addresses.map((addr: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl border border-border bg-muted/20 text-left space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold border border-primary/20">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-extrabold text-foreground">Address #{idx + 1}</span>
                    {addr.addressType && (
                      <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px] font-bold uppercase">
                        {ADDRESS_TYPE_OPTIONS.find((o) => o.value === addr.addressType)?.label || formatEnumValue(addr.addressType)}
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
                    <InfoRow label="Country" value={addr.country || "-"} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Emergency Contacts ── */}
        {hasContacts && (
          <div className="col-span-2 space-y-2">
            <SectionTitle>Emergency Contacts ({userProfile.emergencyContacts.length})</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {userProfile.emergencyContacts.map((c: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-3 rounded-xl border border-border bg-muted/20 text-left">
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-foreground">{c.name || "-"}</p>
                    <p className="text-xs text-muted-foreground">{c.relationship || "-"}</p>
                  </div>
                  <span className="text-xs text-foreground font-mono flex-shrink-0">{c.phone || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Documents ── */}
        {hasDocuments && (
          <div className="col-span-2 space-y-2">
            <SectionTitle>Documents ({userProfile.documents.length})</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {userProfile.documents.map((doc: any, idx: number) => (
                <div key={idx} className="flex gap-3 p-3 rounded-xl border border-border bg-muted/20 text-left">
                  {doc.fileUrl && (
                    <CustomImagePreview
                      src={doc.fileUrl}
                      alt={`${doc.number || "Document"} Attachment`}
                      aspectRatio="1x1"
                      className="flex-shrink-0 h-14 w-14 rounded-lg border border-border/80 shadow-2xs cursor-pointer"
                    />
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-extrabold text-foreground">
                      {DOCUMENT_TYPE_OPTIONS.find((o) => o.value === doc.type)?.label || formatEnumValue(doc.type || "-")}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">{doc.number || "-"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Education ── */}
        {hasEducations && (
          <div className="col-span-2 space-y-2">
            <SectionTitle>Education ({userProfile.educations.length})</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {userProfile.educations.map((edu: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl border border-border bg-muted/20 text-left space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    {edu.certificateUrl && (
                      <CustomImagePreview
                        src={edu.certificateUrl}
                        alt={`${edu.schoolName || "Education"} Certificate`}
                        aspectRatio="1x1"
                        className="flex-shrink-0 h-10 w-10 rounded-lg border border-border/80 shadow-2xs cursor-pointer"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-foreground truncate">
                        {edu.schoolName || "-"}
                      </p>
                      {edu.level && (
                        <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px] font-bold uppercase inline-block mt-0.5">
                          {EDUCATION_LEVEL_OPTIONS.find((o) => o.value === edu.level)?.label || formatEnumValue(edu.level)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <InfoRow label="Field" value={edu.fieldOfStudy || "-"} />
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
                        edu.isGraduated === true || edu.isGraduated === "true" ? (
                          <span className="text-green-600 font-semibold text-xs">Yes</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">No</span>
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Remarks ── */}
        {userProfile.remark && (
          <div className="col-span-2 rounded-xl border border-border bg-muted/10 p-3 text-left mt-1">
            <SectionTitle>Remarks</SectionTitle>
            <p className="text-xs text-foreground leading-relaxed">{userProfile.remark}</p>
          </div>
        )}

        {/* ── System Info ── */}
        <SectionTitle>System Info</SectionTitle>
        <InfoRow label="Created By" value={userProfile.createdBy || "-"} />
        <InfoRow label="Created At" value={dateTimeFormat(userProfile.createdAt ?? "")} />
        <InfoRow label="Updated By" value={userProfile.updatedBy || "-"} />
        <InfoRow label="Last Updated" value={dateTimeFormat(userProfile.updatedAt ?? "")} />
      </div>
    </DetailModal>
  );
}
