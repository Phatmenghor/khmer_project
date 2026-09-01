"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { convertEnumOrString } from "@/utils/common/enum-convert";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectRoleContent } from "../store/selectors/role-selectors";
import { clearSelectedRole } from "../store/slice/role-slice";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { DetailModal } from "@/components/shared/modal/detail-modal";
import { SectionTitle } from "@/components/shared/common/section-title";
import { Shield, Info, History } from "lucide-react";

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
      title={roleData ? `Role Details - ${convertEnumOrString(roleData.name)}` : "Role Details"}
      description="Detailed information about the selected role"
      icon={Shield}
      maxWidthClass="sm:max-w-2xl"
    >
      {roleData && (
        <div className="space-y-5 p-1">
          {/* Role Information Group */}
          <div className="space-y-3">
            <SectionTitle icon={Info} title="Role Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DisplayField label="Role Name" value={convertEnumOrString(roleData.name)} />
              <DisplayField label="User Type" value={convertEnumOrString(roleData.userType)} />
              <div className="md:col-span-2">
                <DisplayField label="Description" value={roleData.description || "-"} />
              </div>
            </div>
          </div>

          {/* Audit Information Group */}
          <div className="space-y-3">
            <SectionTitle icon={History} title="Audit Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DisplayField label="Created At" value={dateTimeFormat(roleData.createdAt ?? "")} />
              <DisplayField label="Created By" value={roleData.createdBy || "-"} />
              <DisplayField label="Last Updated" value={dateTimeFormat(roleData.updatedAt ?? "")} />
              <DisplayField label="Updated By" value={roleData.updatedBy || "-"} />
            </div>
          </div>
        </div>
      )}
    </DetailModal>
  );
}
