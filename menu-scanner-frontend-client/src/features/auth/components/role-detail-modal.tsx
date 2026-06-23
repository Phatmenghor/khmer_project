"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectRoleContent } from "../store/selectors/role-selectors";
import { clearSelectedRole } from "../store/slice/role-slice";
import { cn } from "@/lib/utils";
import { DetailModal } from "@/components/shared/modal/detail-modal";

interface RoleDetailModalProps {
  roleId?: string;
  isOpen: boolean;
  onClose: () => void;
}

function InfoRow({ label, value, fullWidth }: { label: string; value: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-0.5", fullWidth && "col-span-2")}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground">{value || "-"}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-2 mt-2 mb-0.5 first:mt-0 border-b border-border/40 pb-1">
      <h3 className="text-xs font-bold text-primary">
        {children}
      </h3>
    </div>
  );
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

  const displayName = roleData
    ? roleData.name
        .split("_")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ")
    : "";

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={handleClose}
      isLoading={isOpen && !roleData}
      isEmpty={!roleData}
      emptyMessage="No role data available"
      title="Role"
      description="Manage user roles and permissions"
      size="xl"
    >
      {roleData && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 p-1 text-left">
          <SectionTitle>Role Information</SectionTitle>
          <InfoRow label="Role Name" value={displayName} />
          <InfoRow label="User Type" value={formatEnumValue(roleData.userType)} />
          <InfoRow label="Description" value={roleData.description || "-"} fullWidth />

          <SectionTitle>Audit Information</SectionTitle>
          <InfoRow label="Created At" value={dateTimeFormat(roleData.createdAt ?? "")} />
          <InfoRow label="Created By" value={roleData.createdBy ?? "-"} />
          <InfoRow label="Last Updated" value={dateTimeFormat(roleData.updatedAt ?? "")} />
          <InfoRow label="Updated By" value={roleData.updatedBy ?? "-"} />
        </div>
      )}
    </DetailModal>
  );
}
