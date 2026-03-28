"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchUserByIdService, updateUserService } from "@/redux/features/auth/store/thunks/users-thunks";
import { clearSelectedUser } from "@/redux/features/auth/store/slice/users-slice";
import {
  selectSelectedUser,
  selectIsFetchingDetail,
} from "../store/selectors/users-selectors";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { Loading } from "@/components/shared/common/loading";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { Button } from "@/components/ui/button";
import { Edit, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema, UserFormData } from "../store/models/schema/user.schema";
import { TextField } from "@/components/shared/form-field/text-field";
import { SelectField } from "@/components/shared/form-field/select-field";
import { DateTimePickerField } from "@/components/shared/form-field/date-picker-field";
import { showToast } from "@/components/shared/common/show-toast";
import { GENDER_OPTIONS, EMPLOYMENT_TYPE_OPTIONS } from "@/constants/form-options";
import { TextareaField } from "@/components/shared/form-field/text-area-field";

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
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  const typedControl = control as any;

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

  // Initialize form when userData is loaded
  useEffect(() => {
    if (userData && isEditing) {
      reset({
        id: userData.id || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        nickname: userData.nickname || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        gender: userData.gender || "",
        dateOfBirth: userData.dateOfBirth || "",
        employeeId: userData.employeeId || "",
        position: userData.position || "",
        department: userData.department || "",
        employmentType: userData.employmentType || "",
        joinDate: userData.joinDate || "",
        leaveDate: userData.leaveDate || "",
        shift: userData.shift || "",
        remark: userData.remark || "",
      });
    }
  }, [userData, isEditing, reset]);

  const handleClose = () => {
    setIsEditing(false);
    dispatch(clearSelectedUser());
    onClose();
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        nickname: data.nickname,
        email: data.email,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        employeeId: data.employeeId,
        position: data.position,
        department: data.department,
        employmentType: data.employmentType,
        joinDate: data.joinDate,
        leaveDate: data.leaveDate,
        shift: data.shift,
        remark: data.remark,
      };

      await dispatch(updateUserService({ userId: userData?.id || "", data: payload })).unwrap();
      showToast.success("User updated successfully");
      setIsEditing(false);

      // Refresh user data
      await dispatch(fetchUserByIdService(userData?.id || "")).unwrap();
    } catch (error: any) {
      showToast.error(error || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 flex-1">
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
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
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
                  {isEditing ? (
                    <>
                      <TextField
                        control={typedControl}
                        name="firstName"
                        label="First Name"
                        placeholder="First name"
                        error={errors.firstName}
                      />
                      <TextField
                        control={typedControl}
                        name="lastName"
                        label="Last Name"
                        placeholder="Last name"
                        error={errors.lastName}
                      />
                      <TextField
                        control={typedControl}
                        name="nickname"
                        label="Nickname"
                        placeholder="Nickname"
                        error={errors.nickname}
                      />
                      <TextField
                        control={typedControl}
                        name="email"
                        label="Email"
                        placeholder="Email"
                        type="email"
                        error={errors.email}
                      />
                      <TextField
                        control={typedControl}
                        name="phoneNumber"
                        label="Phone Number"
                        placeholder="Phone"
                        error={errors.phoneNumber}
                      />
                      <SelectField
                        control={typedControl}
                        name="gender"
                        label="Gender"
                        placeholder="Select gender"
                        options={GENDER_OPTIONS}
                        error={errors.gender}
                      />
                      <DateTimePickerField
                        control={typedControl}
                        name="dateOfBirth"
                        label="Date of Birth"
                        mode="date"
                        placeholder="Date of birth"
                        error={errors.dateOfBirth}
                      />
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Employment Information */}
            {isEditing || userData.employeeId ||
              userData.position ||
              userData.department ||
              userData.employmentType ||
              userData.joinDate ||
              userData.leaveDate ||
              userData.shift ? (
              <Card>
                <CardHeader>
                  <CardTitle>Employment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isEditing ? (
                      <>
                        <TextField
                          control={typedControl}
                          name="employeeId"
                          label="Employee ID"
                          placeholder="Employee ID"
                          error={errors.employeeId}
                        />
                        <TextField
                          control={typedControl}
                          name="position"
                          label="Position"
                          placeholder="Position"
                          error={errors.position}
                        />
                        <TextField
                          control={typedControl}
                          name="department"
                          label="Department"
                          placeholder="Department"
                          error={errors.department}
                        />
                        <SelectField
                          control={typedControl}
                          name="employmentType"
                          label="Employment Type"
                          placeholder="Select type"
                          options={EMPLOYMENT_TYPE_OPTIONS}
                          error={errors.employmentType}
                        />
                        <DateTimePickerField
                          control={typedControl}
                          name="joinDate"
                          label="Join Date"
                          mode="date"
                          placeholder="Join date"
                          error={errors.joinDate}
                        />
                        <DateTimePickerField
                          control={typedControl}
                          name="leaveDate"
                          label="Leave Date"
                          mode="date"
                          placeholder="Leave date"
                          error={errors.leaveDate}
                        />
                        <TextField
                          control={typedControl}
                          name="shift"
                          label="Shift"
                          placeholder="Shift"
                          error={errors.shift}
                        />
                      </>
                    ) : (
                      <>
                        <DisplayField label="Employee ID" value={userData.employeeId} />
                        <DisplayField label="Position" value={userData.position} />
                        <DisplayField label="Department" value={userData.department} />
                        <DisplayField label="Employment Type" value={userData.employmentType ? formatEnumValue(userData.employmentType) : "-"} />
                        <DisplayField label="Join Date" value={userData.joinDate} />
                        <DisplayField label="Leave Date" value={userData.leaveDate} />
                        <DisplayField label="Shift" value={userData.shift} />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}

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
