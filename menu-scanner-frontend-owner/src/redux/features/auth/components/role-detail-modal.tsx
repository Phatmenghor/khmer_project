"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { convertEnumOrString } from "@/utils/common/enum-convert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { selectRoleContent } from "../store/selectors/role-selectors";
import { clearSelectedRole } from "../store/slice/role-slice";
import { DetailRow, DetailSection } from "@/components/shared/modal/detail-section";

interface RoleDetailModalProps {
  roleId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RoleDetailModal({
  roleId,
  isOpen,
  onClose,
}: RoleDetailModalProps) {
  const dispatch = useAppDispatch();
  const rolesContent = useAppSelector(selectRoleContent);
  const roleData = rolesContent.find((role) => role.id === roleId);

  const handleClose = () => {
    dispatch(clearSelectedRole());
    onClose();
  };

  if (!roleData) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Role Details</DialogTitle>
        <DialogContent className="w-full sm:max-w-2xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No role data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Role Details - {roleData.name}</DialogTitle>
      <DialogContent className="w-full sm:max-w-2xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <h2 className="text-lg font-semibold text-foreground">Role Details</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Detailed information about the selected role
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Information</CardTitle>
              </CardHeader>
              <CardContent>
                <DetailSection title="">
                  <DetailRow label="Role Name" value={convertEnumOrString(roleData.name)} />
                  <DetailRow label="User Type" value={convertEnumOrString(roleData.userType)} />
                  <DetailRow label="Description" value={roleData.description || "-"} isLast />
                </DetailSection>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <DetailSection title="">
                  <DetailRow label="Role ID" value={roleData.id} />
                  <DetailRow label="Created At" value={dateTimeFormat(roleData.createdAt ?? "")} />
                  <DetailRow label="Created By" value={roleData.createdBy || "-"} />
                  <DetailRow label="Last Updated" value={dateTimeFormat(roleData.updatedAt ?? "")} />
                  <DetailRow label="Updated By" value={roleData.updatedBy || "-"} isLast />
                </DetailSection>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
