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
            <DetailRow label="First Name" value={userData?.firstName || "---"} />
            <DetailRow label="Last Name" value={userData?.lastName || "---"} />
            <DetailRow
              label="User Identifier"
              value={userData?.userIdentifier || "---"}
            />
            <DetailRow label="Email" value={userData?.email || "---"} />
            <DetailRow
              label="Phone Number"
              value={userData?.phoneNumber || "---"}
            />
            <DetailRow label="Position" value={userData?.position || "---"} />
            <DetailRow label="Address" value={userData?.address || "---"} />
            <DetailRow label="Nickname" value={userData?.nickname || "---"} />
            <DetailRow label="Gender" value={userData?.gender || "---"} />
            <DetailRow
              label="Date of Birth"
              value={userData?.dateOfBirth || "---"}
            />
          </DetailSection>

          {/* Account Information */}
          <DetailSection title="Account Information">
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
                isLast
              />
            )}
          </DetailSection>

          {/* Employment Information */}
          {(userData?.employeeId ||
            userData?.department ||
            userData?.employmentType ||
            userData?.joinDate ||
            userData?.leaveDate ||
            userData?.shift) && (
            <DetailSection title="Employment Information">
              <DetailRow
                label="Employee ID"
                value={userData?.employeeId || "---"}
              />
              <DetailRow
                label="Department"
                value={userData?.department || "---"}
              />
              <DetailRow
                label="Employment Type"
                value={userData?.employmentType || "---"}
              />
              <DetailRow label="Join Date" value={userData?.joinDate || "---"} />
              <DetailRow label="Leave Date" value={userData?.leaveDate || "---"} />
              <DetailRow label="Shift" value={userData?.shift || "---"} isLast />
            </DetailSection>
          )}

          {/* Additional Information */}
          {(userData?.notes || userData?.remark) && (
            <DetailSection title="Additional Information">
              {userData?.notes && (
                <DetailRow label="Notes" value={userData.notes} />
              )}
              {userData?.remark && (
                <DetailRow label="Remark" value={userData.remark} isLast />
              )}
            </DetailSection>
          )}

          {/* Addresses */}
          {userData?.addresses && userData?.addresses.length > 0 && (
            <DetailSection title="Addresses">
              <div className="space-y-3">
                {userData.addresses.map((address: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-muted/30 rounded-md border border-border text-sm"
                  >
                    <p className="font-medium">{address.label || `Address ${index + 1}`}</p>
                    <p className="text-muted-foreground">
                      {address.addressLine || address.address || "---"}
                    </p>
                    {(address.city || address.state || address.postalCode) && (
                      <p className="text-xs text-muted-foreground">
                        {[address.city, address.state, address.postalCode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Emergency Contacts */}
          {userData?.emergencyContacts &&
            userData?.emergencyContacts.length > 0 && (
              <DetailSection title="Emergency Contacts">
                <div className="space-y-3">
                  {userData.emergencyContacts.map((contact: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 bg-muted/30 rounded-md border border-border text-sm"
                    >
                      <p className="font-medium">{contact.name || "Contact"}</p>
                      <p className="text-muted-foreground">
                        {contact.relationship || "---"}
                      </p>
                      {contact.phoneNumber && (
                        <p className="text-xs text-muted-foreground">
                          {contact.phoneNumber}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </DetailSection>
            )}

          {/* Documents */}
          {userData?.documents && userData?.documents.length > 0 && (
            <DetailSection title="Documents">
              <div className="space-y-3">
                {userData.documents.map((doc: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-muted/30 rounded-md border border-border text-sm"
                  >
                    <p className="font-medium">{doc.name || `Document ${index + 1}`}</p>
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View Document
                      </a>
                    )}
                    {doc.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {doc.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Education */}
          {userData?.educations && userData?.educations.length > 0 && (
            <DetailSection title="Education">
              <div className="space-y-3">
                {userData.educations.map((edu: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-muted/30 rounded-md border border-border text-sm"
                  >
                    <p className="font-medium">{edu.schoolName || edu.degree || `Education ${index + 1}`}</p>
                    {(edu.major || edu.degree) && (
                      <p className="text-muted-foreground text-xs">
                        {[edu.degree, edu.major].filter(Boolean).join(" - ")}
                      </p>
                    )}
                    {(edu.startDate || edu.endDate) && (
                      <p className="text-xs text-muted-foreground">
                        {edu.startDate}
                        {edu.startDate && edu.endDate && " to "}
                        {edu.endDate}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

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
