"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { DisplayField } from "@/components/shared/form-field/display-field";

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
              <p className="text-sm font-medium text-foreground">
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
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField label="First Name" value={userData.firstName} />
                  <DisplayField label="Last Name" value={userData.lastName} />
                  <DisplayField label="Email" value={userData.email} />
                  <DisplayField label="Phone Number" value={userData.phoneNumber} />
                  <DisplayField label="Nickname" value={userData.nickname} />
                  <DisplayField label="Gender" value={userData.gender ? formatEnumValue(userData.gender) : "-"} />
                  <DisplayField label="Date of Birth" value={userData.dateOfBirth} />
                  <DisplayField label="Position" value={userData.position} />
                  <DisplayField label="Role" value={userData.roles && userData.roles.length > 0 ? userData.roles.map(r => formatEnumValue(r)).join(", ") : "-"} />
                  <DisplayField label="Account Status" value={userData.accountStatus ? formatEnumValue(userData.accountStatus) : "-"} />
                  {userData.remark && (
                    <div className="col-span-1 md:col-span-2">
                      <DisplayField label="Remark" value={userData.remark} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField label="User Type" value={formatEnumValue(userData.userType)} />
                  <DisplayField label="Business" value={userData.businessName} />
                </div>
              </CardContent>
            </Card>

            {/* Employment Information */}
            {(userData.employeeId ||
              userData.department ||
              userData.employmentType ||
              userData.joinDate ||
              userData.shift) && (
              <Card>
                <CardHeader>
                  <CardTitle>Employment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField label="Employee ID" value={userData.employeeId} />
                    <DisplayField label="Department" value={userData.department} />
                    <DisplayField label="Employment Type" value={userData.employmentType ? formatEnumValue(userData.employmentType) : "-"} />
                    <DisplayField label="Shift" value={userData.shift} />
                    <DisplayField label="Join Date" value={userData.joinDate} />
                    <DisplayField label="Leave Date" value={userData.leaveDate} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Addresses */}
            {userData.addresses && userData.addresses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Addresses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData.addresses.map((address: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardContent className="pt-4 pb-4">
                          <div className="space-y-3">
                            <DisplayField label="Type" value={address.addressType ? formatEnumValue(address.addressType) : "-"} />
                            <DisplayField label="House No" value={address.houseNo} />
                            <DisplayField label="Street" value={address.street} />
                            <DisplayField label="Village" value={address.village} />
                            <DisplayField label="Commune" value={address.commune} />
                            <DisplayField label="District" value={address.district} />
                            <DisplayField label="Province" value={address.province} />
                            <DisplayField label="Country" value={address.country} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Emergency Contacts */}
            {userData.emergencyContacts && userData.emergencyContacts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contacts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData.emergencyContacts.map((contact: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-4 pb-4">
                          <div className="space-y-3">
                            <DisplayField label="Name" value={contact.name} />
                            <DisplayField label="Relationship" value={contact.relationship} />
                            <DisplayField label="Phone" value={contact.phone} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {userData.documents && userData.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData.documents.map((doc: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-blue-500 overflow-hidden">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <DisplayField label="Type" value={doc.type ? formatEnumValue(doc.type) : "-"} />
                            <DisplayField label="Number" value={doc.number} />
                          </div>
                          {doc.fileUrl && (
                            <div className="mt-4 -mx-4 -mb-4 flex justify-start">
                              <img
                                src={doc.fileUrl}
                                alt={doc.type}
                                className="h-40 w-auto max-w-full object-contain bg-muted/20"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {userData.educations && userData.educations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData.educations.map((edu: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-green-500 overflow-hidden">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <DisplayField label="School Name" value={edu.schoolName} />
                            <DisplayField label="Level" value={edu.level ? formatEnumValue(edu.level) : "-"} />
                            <DisplayField label="Field of Study" value={edu.fieldOfStudy} />
                            <DisplayField label="Graduation" value={edu.isGraduated ? "Yes" : "No"} />
                            <DisplayField
                              label="Study Period"
                              value={
                                edu.startYear && edu.endYear
                                  ? `${edu.startYear} - ${edu.endYear}`
                                  : "-"
                              }
                            />
                          </div>
                          {edu.certificateUrl && (
                            <div className="mt-4 -mx-4 -mb-4 flex justify-start">
                              <img
                                src={edu.certificateUrl}
                                alt="Certificate"
                                className="h-40 w-auto max-w-full object-contain bg-muted/20"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            {userData.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DisplayField label="Notes" value={userData.notes} />
                </CardContent>
              </Card>
            )}

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField label="User ID" value={userData.id} />
                  <DisplayField label="Created At" value={dateTimeFormat(userData.createdAt ?? "")} />
                  <DisplayField label="Created By" value={userData.createdBy} />
                  <DisplayField label="Last Updated" value={dateTimeFormat(userData.updatedAt ?? "")} />
                  <DisplayField label="Updated By" value={userData.updatedBy} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
