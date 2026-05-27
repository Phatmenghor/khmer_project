"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatEnumLabel } from "@/utils/common/enum-convert";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchUserByIdService } from "@/redux/features/auth/store/thunks/users-thunks";
import { clearSelectedUser } from "@/redux/features/auth/store/slice/users-slice";
import {
  selectSelectedUser,
  selectIsFetchingDetail,
} from "../store/selectors/users-selectors";
import Loading from "@/components/shared/common/loading";
import ResetPasswordModal from "@/components/shared/modal/reset-password-modal";

interface UserBusinessDetailModalProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserBusinessDetailModal({
  userId,
  isOpen,
  onClose,
}: UserBusinessDetailModalProps) {
  const dispatch = useAppDispatch();
  const isFetchingDetail = useAppSelector(selectIsFetchingDetail);
  const userData = useAppSelector(selectSelectedUser);

  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

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
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Business User Details</DialogTitle>
        <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
            <div className="flex items-center gap-4 pr-8">
              {userData && (
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                  {userData.profileImageUrl ? (
                    <img
                      src={userData.profileImageUrl}
                      alt={userData.firstName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/10 dark:bg-primary/20">
                      <span className="text-lg font-semibold text-primary">
                        {userData.firstName?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-foreground">Business User Details</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {userData
                    ? userData.fullName || `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "---"
                    : "Detailed information about the selected business user"}
                </p>
              </div>
              {userData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResetPasswordOpen(true)}
                  className="flex-shrink-0 gap-2"
                >
                  <RotateCw className="h-4 w-4" />
                  Reset Password
                </Button>
              )}
            </div>
          </div>

          {isFetchingDetail ? (
            <div className="flex items-center justify-center flex-1 min-h-[300px]">
              <Loading />
            </div>
          ) : !userData ? (
            <div className="flex items-center justify-center flex-1 min-h-[200px]">
              <p className="text-muted-foreground">No user data available</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DisplayField label="Full Name" value={userData.fullName || "---"} />
                      <DisplayField label="Email" value={userData.email || "---"} />
                      <DisplayField label="Phone Number" value={userData.phoneNumber || "---"} />
                      <DisplayField label="Nickname" value={userData.nickname || "---"} />
                      <DisplayField label="Gender" value={formatEnumLabel(userData.gender) ?? "---"} />
                      <DisplayField label="Date of Birth" value={userData.dateOfBirth || "---"} />
                      <DisplayField label="User Identifier" value={userData.userIdentifier || "---"} />
                      <DisplayField label="User Type" value={formatEnumLabel(userData.userType) ?? "---"} />
                      <DisplayField label="Account Status" value={formatEnumLabel(userData.accountStatus) ?? "---"} />
                      <DisplayField
                        label="Roles"
                        value={
                          userData.roles?.length > 0
                            ? userData.roles.map((r) => formatEnumLabel(r) ?? r).join(", ")
                            : "---"
                        }
                      />
                      {userData.remark && (
                        <div className="md:col-span-2">
                          <DisplayField label="Remark" value={userData.remark} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Telegram Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Telegram</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DisplayField
                        label="Synced"
                        value={userData.telegramSynced ? "Connected" : "Not Connected"}
                      />
                      <DisplayField label="Username" value={userData.telegramUsername || "---"} />
                      <DisplayField label="First Name" value={userData.telegramFirstName || "---"} />
                      <DisplayField label="Last Name" value={userData.telegramLastName || "---"} />
                      <DisplayField
                        label="Synced At"
                        value={userData.telegramSyncedAt ? dateTimeFormat(userData.telegramSyncedAt) : "---"}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* System Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>System Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <DisplayField label="User ID" value={userData.id} />
                      <DisplayField
                        label="Last Login"
                        value={userData.lastLoginAt ? dateTimeFormat(userData.lastLoginAt) : "---"}
                      />
                      <DisplayField label="Created At" value={dateTimeFormat(userData.createdAt ?? "")} />
                      <DisplayField label="Created By" value={userData.createdBy || "---"} />
                      <DisplayField label="Last Updated" value={dateTimeFormat(userData.updatedAt ?? "")} />
                      <DisplayField label="Updated By" value={userData.updatedBy || "---"} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ResetPasswordModal
        isOpen={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
        userId={userData?.id}
        userName={userData?.userIdentifier || userData?.email}
        userRole={userData?.roles}
        profileImageUrl={userData?.profileImageUrl || undefined}
      />
    </>
  );
}
