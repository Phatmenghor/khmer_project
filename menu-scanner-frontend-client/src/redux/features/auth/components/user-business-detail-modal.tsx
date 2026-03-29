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
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
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
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
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
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border bg-muted">
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <span className="text-2xl font-semibold text-primary">
                  {userData.fullName?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">
                User Details
              </h2>
              <p className="text-sm text-foreground mt-1">
                View detailed information about the user
              </p>
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
                  <DisplayField label="Nickname" value={userData.nickname} />
                  <DisplayField label="Email" value={userData.email} />
                  <DisplayField label="Phone Number" value={userData.phoneNumber} />
                  <DisplayField label="Gender" value={userData.gender ? formatEnumValue(userData.gender) : "-"} />
                  <DisplayField label="Date of Birth" value={userData.dateOfBirth} />
                  <DisplayField label="Role" value={userData.roles && userData.roles.length > 0 ? userData.roles.map(r => formatEnumValue(r)).join(", ") : "-"} />
                  <DisplayField label="Account Status" value={userData.accountStatus ? formatEnumValue(userData.accountStatus) : "-"} />
                  <DisplayField
                    label="Telegram ID"
                    value={userData.telegramId}
                  />
                  <DisplayField
                    label="Telegram Username"
                    value={userData.telegramUsername}
                  />
                  <DisplayField
                    label="Telegram First Name"
                    value={userData.telegramFirstName}
                  />
                  <DisplayField
                    label="Telegram Last Name"
                    value={userData.telegramLastName}
                  />
                  <DisplayField
                    label="Telegram Synced At"
                    value={userData.telegramSyncedAt}
                  />
                  <DisplayField
                    label="Telegram Synced"
                    value={userData.telegramSynced ? "Yes" : "No"}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Employment Information */}
            {(userData.employeeId ||
              userData.position ||
              userData.department ||
              userData.employmentType ||
              userData.joinDate ||
              userData.leaveDate ||
              userData.shift) && (
              <Card>
                <CardHeader>
                  <CardTitle>Employment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DisplayField label="Employee ID" value={userData.employeeId} />
                    <DisplayField label="Position" value={userData.position} />
                    <DisplayField label="Department" value={userData.department} />
                    <DisplayField label="Employment Type" value={userData.employmentType ? formatEnumValue(userData.employmentType) : "-"} />
                    <DisplayField label="Join Date" value={userData.joinDate} />
                    <DisplayField label="Leave Date" value={userData.leaveDate} />
                    <DisplayField label="Shift" value={userData.shift} />
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
                <CardContent>
                  <div className="space-y-6">
                    {userData.addresses.map((address: any, index: number) => (
                      <div key={index} className="border-b pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DisplayField label="Type" value={address.addressType ? formatEnumValue(address.addressType) : "-"} />
                          <DisplayField label="House No" value={address.houseNo} />
                          <DisplayField label="Street" value={address.street} />
                          <DisplayField label="Village" value={address.village} />
                          <DisplayField label="Commune" value={address.commune} />
                          <DisplayField label="District" value={address.district} />
                          <DisplayField label="Province" value={address.province} />
                          <DisplayField label="Country" value={address.country} />
                        </div>
                      </div>
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
                <CardContent>
                  <div className="space-y-6">
                    {userData.emergencyContacts.map((contact: any, index: number) => (
                      <div key={index} className="border-b pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <DisplayField label="Name" value={contact.name} />
                          <DisplayField label="Phone" value={contact.phone} />
                          <DisplayField label="Relationship" value={contact.relationship} />
                        </div>
                      </div>
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
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userData.documents.map((doc: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DisplayField label="Type" value={doc.type ? formatEnumValue(doc.type) : "-"} />
                            <DisplayField label="Number" value={doc.number} />
                          </div>
                          {doc.fileUrl && (
                            <div className="mt-4">
                              <label className="text-sm font-medium text-muted-foreground">
                                File
                              </label>
                              <img
                                src={doc.fileUrl}
                                alt="Document"
                                className="w-1/2 h-32 object-cover rounded mt-2"
                              />
                            </div>
                          )}
                        </div>
                      </div>
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
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userData.educations.map((edu: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DisplayField label="Level" value={edu.level ? formatEnumValue(edu.level) : "-"} />
                            <DisplayField label="School" value={edu.schoolName} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DisplayField label="Field of Study" value={edu.fieldOfStudy} />
                            <DisplayField label="Start Year" value={edu.startYear} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DisplayField label="End Year" value={edu.endYear} />
                            <DisplayField label="Graduation" value={edu.isGraduated ? "Yes" : "No"} />
                          </div>
                          {edu.certificateUrl && (
                            <div className="mt-4">
                              <label className="text-sm font-medium text-muted-foreground">
                                Certificate
                              </label>
                              <img
                                src={edu.certificateUrl}
                                alt="Certificate"
                                className="w-1/2 h-32 object-cover rounded mt-2"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Remarks */}
            {userData.remark && (
              <Card>
                <CardHeader>
                  <CardTitle>Remarks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DisplayField label="Remarks" value={userData.remark} />
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
                  <DisplayField label="User Type" value={formatEnumValue(userData.userType)} />
                  <DisplayField label="Business" value={userData.businessName} />
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
