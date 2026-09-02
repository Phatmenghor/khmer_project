"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { convertEnumOrString } from "@/utils/common/enum-convert";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectRoleContent } from "../store/selectors/role-selectors";
import { clearSelectedRole } from "../store/slice/role-slice";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { SectionTitle, InfoRow } from "@/components/shared/modal/detail-section";

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

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isOpen && !roleData}
      isEmpty={!roleData}
      emptyMessage="No role data available"
      title={roleData ? convertEnumOrString(roleData.name) : "Role Details"}
      description="Detailed information about the selected role"
      avatarName={roleData?.name}
      size="5xl"
    >
      {roleData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
          <SectionTitle>Role Information</SectionTitle>
          <InfoRow label="Role Name" value={convertEnumOrString(roleData.name)} />
          <InfoRow label="User Type" value={convertEnumOrString(roleData.userType)} />
          <InfoRow label="Description" value={roleData.description || "-"} fullWidth />

          <SectionTitle>Audit & System Info</SectionTitle>
          <InfoRow label="Role ID" value={roleData.id || "-"} />
          <InfoRow label="Created By" value={roleData.createdBy || "-"} />
          <InfoRow label="Created At" value={dateTimeFormat(roleData.createdAt ?? "")} />
          <InfoRow label="Updated By" value={roleData.updatedBy || "-"} />
          <InfoRow label="Last Updated" value={dateTimeFormat(roleData.updatedAt ?? "")} />
        </div>
      )}
    </DetailModal>
  );
}
