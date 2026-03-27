"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchUserByIdService } from "@/redux/features/auth/store/thunks/users-thunks";
import { clearSelectedUser } from "@/redux/features/auth/store/slice/users-slice";
import {
  selectSelectedUser,
  selectIsFetchingDetail,
} from "../store/selectors/users-selectors";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { Loading } from "@/components/shared/common/loading";

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

  const DetailField = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value || "---"}</p>
    </div>
  );

  if (isFetchingDetail) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">User Details Loading</DialogTitle>
        <DialogContent className="w-full sm:max-w-6xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
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
        <DialogContent className="w-full sm:max-w-6xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No user data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">User Details - {userData.fullName}</DialogTitle>
      <DialogContent className="w-full sm:max-w-6xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4">
            {userData.profileImageUrl ? (
              <img
                src={userData.profileImageUrl}
                alt={userData.fullName}
                className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold text-primary">
                  {userData.fullName?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-foreground">
                {userData.fullName || "Unknown User"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {userData.userIdentifier}
              </p>
              {userData.roles && userData.roles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {userData.roles.map((role, index) => (
                    <Badge key={index} variant="secondary">
                      {formatEnumValue(role)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <DetailField label="First Name" value={userData.firstName} />
                <DetailField label="Last Name" value={userData.lastName} />
                <DetailField label="Email" value={userData.email} />
                <DetailField label="Phone Number" value={userData.phoneNumber} />
                <DetailField label="Nickname" value={userData.nickname} />
                <DetailField label="Gender" value={userData.gender ? formatEnumValue(userData.gender) : null} />
                <DetailField label="Date of Birth" value={userData.dateOfBirth} />
                <DetailField label="Position" value={userData.position} />
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <DetailField label="User Type" value={formatEnumValue(userData.userType)} />
                <DetailField
                  label="Account Status"
                  value={
                    <span
                      className={
                        userData.accountStatus === "ACTIVE"
                          ? "text-green-600 font-medium"
                          : userData.accountStatus === "END_WORK"
                            ? "text-orange-600 font-medium"
                            : userData.accountStatus === "LOCKED"
                              ? "text-red-600 font-medium"
                              : ""
                      }
                    >
                      {formatEnumValue(userData.accountStatus)}
                    </span>
                  }
                />
                <DetailField label="Business" value={userData.businessName} />
              </div>
            </div>

            {/* Employment Information */}
            {(userData.employeeId ||
              userData.department ||
              userData.employmentType ||
              userData.joinDate ||
              userData.shift) && (
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4">
                  Employment Information
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <DetailField label="Employee ID" value={userData.employeeId} />
                  <DetailField label="Department" value={userData.department} />
                  <DetailField
                    label="Employment Type"
                    value={userData.employmentType ? formatEnumValue(userData.employmentType) : null}
                  />
                  <DetailField label="Shift" value={userData.shift} />
                  <DetailField label="Join Date" value={userData.joinDate} />
                  <DetailField label="Leave Date" value={userData.leaveDate} />
                </div>
              </div>
            )}

            {/* Addresses */}
            {userData.addresses && userData.addresses.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4">
                  Addresses
                </h3>
                <div className="space-y-3">
                  {userData.addresses.map((address: any, index: number) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4 pb-4">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                          <DetailField label="Type" value={address.addressType ? formatEnumValue(address.addressType) : null} />
                          <DetailField label="House No" value={address.houseNo} />
                          <DetailField label="Street" value={address.street} />
                          <DetailField label="Village" value={address.village} />
                          <DetailField label="Commune" value={address.commune} />
                          <DetailField label="District" value={address.district} />
                          <DetailField label="Province" value={address.province} />
                          <DetailField label="Country" value={address.country} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Contacts */}
            {userData.emergencyContacts && userData.emergencyContacts.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4">
                  Emergency Contacts
                </h3>
                <div className="space-y-3">
                  {userData.emergencyContacts.map((contact: any, index: number) => (
                    <Card key={index} className="border-l-4 border-l-orange-500">
                      <CardContent className="pt-4 pb-4">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                          <DetailField label="Name" value={contact.name} />
                          <DetailField label="Relationship" value={contact.relationship} />
                          <DetailField label="Phone" value={contact.phone} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {userData.documents && userData.documents.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4">
                  Documents
                </h3>
                <div className="space-y-4">
                  {userData.documents.map((doc: any, index: number) => (
                    <Card key={index} className="border-l-4 border-l-blue-500 overflow-hidden">
                      <CardContent className="pt-4 pb-4">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                          <DetailField label="Type" value={doc.type ? formatEnumValue(doc.type) : null} />
                          <DetailField label="Number" value={doc.number} />
                        </div>
                        {doc.fileUrl && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Preview</p>
                            <img
                              src={doc.fileUrl}
                              alt={doc.type}
                              className="h-32 w-full rounded-lg object-contain bg-muted/20"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {userData.educations && userData.educations.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4">
                  Education
                </h3>
                <div className="space-y-4">
                  {userData.educations.map((edu: any, index: number) => (
                    <Card key={index} className="border-l-4 border-l-green-500 overflow-hidden">
                      <CardContent className="pt-4 pb-4">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                          <DetailField label="School Name" value={edu.schoolName} />
                          <DetailField label="Level" value={edu.level ? formatEnumValue(edu.level) : null} />
                          <DetailField label="Field of Study" value={edu.fieldOfStudy} />
                          <DetailField label="Graduation" value={edu.isGraduated ? "Yes" : "No"} />
                          <DetailField
                            label="Study Period"
                            value={
                              edu.startYear && edu.endYear
                                ? `${edu.startYear} - ${edu.endYear}`
                                : null
                            }
                          />
                        </div>
                        {edu.certificateUrl && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Certificate</p>
                            <img
                              src={edu.certificateUrl}
                              alt="Certificate"
                              className="h-32 w-full rounded-lg object-contain bg-muted/20"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            {(userData.remark || userData.notes) && (
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4">
                  Additional Information
                </h3>
                <div className="space-y-4">
                  {userData.remark && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Remark</p>
                      <p className="text-sm text-foreground bg-muted/30 rounded-md p-3">
                        {userData.remark}
                      </p>
                    </div>
                  )}
                  {userData.notes && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Notes</p>
                      <p className="text-sm text-foreground bg-muted/30 rounded-md p-3">
                        {userData.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* System Information */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-4">
                System Information
              </h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">User ID</p>
                  <p className="text-xs font-mono bg-muted px-3 py-2 rounded break-all">
                    {userData.id}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <DetailField
                    label="Created At"
                    value={dateTimeFormat(userData.createdAt ?? "")}
                  />
                  <DetailField label="Created By" value={userData.createdBy} />
                  <DetailField
                    label="Last Updated"
                    value={dateTimeFormat(userData.updatedAt ?? "")}
                  />
                  <DetailField label="Updated By" value={userData.updatedBy} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
