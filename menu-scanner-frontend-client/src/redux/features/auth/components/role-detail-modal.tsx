"use client";

import { useEffect } from "react";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import {
  DetailRow,
  DetailSection,
} from "@/components/shared/modal/detail-section";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectRoleContent,
} from "../store/selectors/role-selectors";
import { clearSelectedRole } from "../store/slice/role-slice";
import { RoleResponseModel } from "../store/models/response/role-response";

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
  const roleData = rolesContent.find(role => role.id === roleId);

  const handleClose = () => {
    dispatch(clearSelectedRole());
    onClose();
  };

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={false}
      title={"Role Details"}
      description={"Detailed information about the selected role."}
    >
      {roleData ? (
        <div className="space-y-6">
          {/* Role Information */}
          <DetailSection title="Role Information">
            <DetailRow label="Role Name" value={formatEnumValue(roleData?.name)} />
            <DetailRow
              label="Description"
              value={roleData?.description || "---"}
            />
            <DetailRow label="User Type" value={formatEnumValue(roleData?.userType)} />
          </DetailSection>

          {/* System Information */}
          <DetailSection title="System Information">
            <DetailRow
              label="Role ID"
              value={
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
                  {roleData?.id}
                </span>
              }
            />
            <DetailRow
              label="Created At"
              value={dateTimeFormat(roleData?.createdAt ?? "")}
            />
            <DetailRow
              label="Created By"
              value={roleData?.createdBy || "---"}
            />
            <DetailRow
              label="Last Updated"
              value={dateTimeFormat(roleData?.updatedAt ?? "")}
            />
            <DetailRow
              label="Updated By"
              value={roleData?.updatedBy || "---"}
              isLast
            />
          </DetailSection>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No Role data available</p>
        </div>
      )}
    </DetailModal>
  );
}
