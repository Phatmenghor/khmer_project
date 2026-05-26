"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { convertEnumOrString } from "@/utils/common/enum-convert";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchUserByIdService } from "@/redux/features/auth/store/thunks/users-thunks";
import { clearSelectedUser } from "@/redux/features/auth/store/slice/users-slice";
import {
  selectSelectedUser,
  selectIsFetchingDetail,
} from "../store/selectors/users-selectors";
import Loading from "@/components/shared/common/loading";

interface UserCustomerDetailModalProps {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UserCustomerDetailModal({ userId, isOpen, onClose }: UserCustomerDetailModalProps) {
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Customer Details</DialogTitle>
      <DialogContent className="w-full sm:max-w-7xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <h2 className="text-lg font-semibold text-foreground">Customer Details</h2>
          <p className="text-sm text-foreground mt-1">
            Detailed information about the selected customer
          </p>
        </div>

        {isFetchingDetail ? (
          <div className="flex items-center justify-center flex-1 min-h-[300px]">
            <Loading />
          </div>
        ) : !userData ? (
          <div className="flex items-center justify-center flex-1 min-h-[200px]">
            <p className="text-muted-foreground">No customer data available</p>
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
                    <DisplayField label="Gender" value={userData.gender ? convertEnumOrString(userData.gender) : "---"} />
                    <DisplayField label="Date of Birth" value={userData.dateOfBirth || "---"} />
                    <DisplayField label="User Identifier" value={userData.userIdentifier || "---"} />
                    <DisplayField
                      label="User Type"
                      value={
                        <Badge variant="outline">
                          {convertEnumOrString(userData.userType ?? "")}
                        </Badge>
                      }
                    />
                    <DisplayField
                      label="Account Status"
                      value={
                        <Badge variant="outline">
                          {convertEnumOrString(userData.accountStatus ?? "")}
                        </Badge>
                      }
                    />
                    <DisplayField
                      label="Roles"
                      value={
                        userData.roles?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {userData.roles.map((role, i) => (
                              <Badge key={i} variant="secondary">
                                {convertEnumOrString(role)}
                              </Badge>
                            ))}
                          </div>
                        ) : "---"
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
                      value={
                        <Badge variant={userData.telegramSynced ? "default" : "outline"}>
                          {userData.telegramSynced ? "Connected" : "Not Connected"}
                        </Badge>
                      }
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
  );
}
