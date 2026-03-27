"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

  if (isFetchingDetail) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    First Name
                  </p>
                  <p className="text-sm text-foreground">{userData.firstName || "---"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Last Name
                  </p>
                  <p className="text-sm text-foreground">{userData.lastName || "---"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-sm text-foreground">{userData.email || "---"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Phone Number
                  </p>
                  <p className="text-sm text-foreground">
                    {userData.phoneNumber || "---"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Nickname
                  </p>
                  <p className="text-sm text-foreground">{userData.nickname || "---"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Gender
                  </p>
                  <p className="text-sm text-foreground">
                    {userData.gender ? formatEnumValue(userData.gender) : "---"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Date of Birth
                  </p>
                  <p className="text-sm text-foreground">
                    {userData.dateOfBirth || "---"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Position
                  </p>
                  <p className="text-sm text-foreground">{userData.position || "---"}</p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    User Type
                  </p>
                  <p className="text-sm text-foreground">
                    {formatEnumValue(userData.userType)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Account Status
                  </p>
                  <p className="text-sm font-medium">
                    {userData.accountStatus === "ACTIVE" && (
                      <span className="text-green-600">
                        {formatEnumValue(userData.accountStatus)}
                      </span>
                    )}
                    {userData.accountStatus === "END_WORK" && (
                      <span className="text-orange-600">
                        {formatEnumValue(userData.accountStatus)}
                      </span>
                    )}
                    {userData.accountStatus === "LOCKED" && (
                      <span className="text-red-600">
                        {formatEnumValue(userData.accountStatus)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Business
                  </p>
                  <p className="text-sm text-foreground">
                    {userData.businessName || "---"}
                  </p>
                </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Employee ID
                    </p>
                    <p className="text-sm text-foreground">
                      {userData.employeeId || "---"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Department
                    </p>
                    <p className="text-sm text-foreground">
                      {userData.department || "---"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Employment Type
                    </p>
                    <p className="text-sm text-foreground">
                      {userData.employmentType
                        ? formatEnumValue(userData.employmentType)
                        : "---"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Shift
                    </p>
                    <p className="text-sm text-foreground">
                      {userData.shift || "---"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Join Date
                    </p>
                    <p className="text-sm text-foreground">
                      {userData.joinDate || "---"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Leave Date
                    </p>
                    <p className="text-sm text-foreground">
                      {userData.leaveDate || "---"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Address Information */}
            {userData.addresses && userData.addresses.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4">
                  Addresses
                </h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {userData.addresses.map((address: any, index: number) => (
                        <div key={index}>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Type
                              </p>
                              <p className="text-sm text-foreground">
                                {address.addressType
                                  ? formatEnumValue(address.addressType)
                                  : "---"}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                House No
                              </p>
                              <p className="text-sm text-foreground">
                                {address.houseNo || "---"}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Street
                              </p>
                              <p className="text-sm text-foreground">
                                {address.street || "---"}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Village
                              </p>
                              <p className="text-sm text-foreground">
                                {address.village || "---"}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Commune
                              </p>
                              <p className="text-sm text-foreground">
                                {address.commune || "---"}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                District
                              </p>
                              <p className="text-sm text-foreground">
                                {address.district || "---"}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Province
                              </p>
                              <p className="text-sm text-foreground">
                                {address.province || "---"}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Country
                              </p>
                              <p className="text-sm text-foreground">
                                {address.country || "---"}
                              </p>
                            </div>
                          </div>
                          {index < userData.addresses.length - 1 && (
                            <div className="border-t pt-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Emergency Contacts */}
            {userData.emergencyContacts &&
              userData.emergencyContacts.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-4">
                    Emergency Contacts
                  </h3>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {userData.emergencyContacts.map(
                          (contact: any, index: number) => (
                            <div key={index}>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Name
                                  </p>
                                  <p className="text-sm text-foreground">
                                    {contact.name || "---"}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Relationship
                                  </p>
                                  <p className="text-sm text-foreground">
                                    {contact.relationship || "---"}
                                  </p>
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Phone
                                  </p>
                                  <p className="text-sm text-foreground">
                                    {contact.phone || "---"}
                                  </p>
                                </div>
                              </div>
                              {index < userData.emergencyContacts.length - 1 && (
                                <div className="border-t pt-4" />
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            {/* Documents */}
            {userData.documents && userData.documents.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4">
                  Documents
                </h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {userData.documents.map((doc: any, index: number) => (
                        <div key={index}>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Type
                              </p>
                              <p className="text-sm text-foreground">
                                {doc.type ? formatEnumValue(doc.type) : "---"}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Number
                              </p>
                              <p className="text-sm text-foreground">
                                {doc.number || "---"}
                              </p>
                            </div>
                          </div>
                          {doc.fileUrl && (
                            <div className="space-y-2 mb-4">
                              <p className="text-xs font-medium text-muted-foreground">
                                Preview
                              </p>
                              <img
                                src={doc.fileUrl}
                                alt={doc.type}
                                className="h-40 w-full rounded-lg object-contain bg-muted/20"
                              />
                            </div>
                          )}
                          {index < userData.documents.length - 1 && (
                            <div className="border-t pt-6" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Education */}
            {userData.educations && userData.educations.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4">
                  Education
                </h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {userData.educations.map((edu: any, index: number) => (
                        <div key={index}>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                School Name
                              </p>
                              <p className="text-sm text-foreground">
                                {edu.schoolName || "---"}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Level
                              </p>
                              <p className="text-sm text-foreground">
                                {edu.level ? formatEnumValue(edu.level) : "---"}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Field of Study
                              </p>
                              <p className="text-sm text-foreground">
                                {edu.fieldOfStudy || "---"}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Graduation Status
                              </p>
                              <p className="text-sm text-foreground">
                                {edu.isGraduated ? "Graduated" : "Not Graduated"}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Study Period
                              </p>
                              <p className="text-sm text-foreground">
                                {edu.startYear && edu.endYear
                                  ? `${edu.startYear} - ${edu.endYear}`
                                  : "---"}
                              </p>
                            </div>
                          </div>
                          {edu.certificateUrl && (
                            <div className="space-y-2 mb-4">
                              <p className="text-xs font-medium text-muted-foreground">
                                Certificate
                              </p>
                              <img
                                src={edu.certificateUrl}
                                alt="Certificate"
                                className="h-40 w-full rounded-lg object-contain bg-muted/20"
                              />
                            </div>
                          )}
                          {index < userData.educations.length - 1 && (
                            <div className="border-t pt-6" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Additional Information */}
            {(userData.remark || userData.notes) && (
              <div>
                <h3 className="text-base font-semibold text-foreground mb-4">
                  Additional Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {userData.remark && (
                    <div className="space-y-2 col-span-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Remark
                      </p>
                      <p className="text-sm text-foreground">{userData.remark}</p>
                    </div>
                  )}
                  {userData.notes && (
                    <div className="space-y-2 col-span-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Notes
                      </p>
                      <p className="text-sm text-foreground">{userData.notes}</p>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    User ID
                  </p>
                  <p className="text-xs font-mono bg-muted px-3 py-2 rounded break-all">
                    {userData.id}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Created At
                  </p>
                  <p className="text-sm text-foreground">
                    {dateTimeFormat(userData.createdAt ?? "")}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Created By
                  </p>
                  <p className="text-sm text-foreground">
                    {userData.createdBy || "---"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Last Updated
                  </p>
                  <p className="text-sm text-foreground">
                    {dateTimeFormat(userData.updatedAt ?? "")}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Updated By
                  </p>
                  <p className="text-sm text-foreground">
                    {userData.updatedBy || "---"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
