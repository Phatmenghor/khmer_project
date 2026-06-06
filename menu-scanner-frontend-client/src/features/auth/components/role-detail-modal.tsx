"use client";

import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectRoleContent } from "../store/selectors/role-selectors";
import { clearSelectedRole } from "../store/slice/role-slice";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

interface RoleDetailModalProps {
  roleId?: string;
  isOpen: boolean;
  onClose: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5">
      <h3 className="text-xs font-bold text-foreground">{children}</h3>
    </div>
  );
}

function InfoRow({ label, value, fullWidth }: { label: string; value: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-0.5", fullWidth && "col-span-2")}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground">{value || "-"}</span>
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

  if (!roleData) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogTitle className="sr-only">Role Details</DialogTitle>
        <DialogContent className="w-full sm:max-w-md max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No role data available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const displayName = roleData.name
    .split("_")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTitle className="sr-only">Role Details - {roleData.name}</DialogTitle>
      <DialogContent className="w-full sm:max-w-md max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-muted/30 flex-shrink-0 flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted border border-border/50 flex items-center justify-center">
            <Shield className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Role</p>
            <p className="text-xs text-muted-foreground mt-0.5">Manage user roles and permissions</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-3">
            {/* Role Information */}
            <div className="rounded border border-border/50 bg-card p-3">
              <SectionTitle>Role Information</SectionTitle>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <InfoRow label="Role Name" value={displayName} />
                <InfoRow label="User Type" value={formatEnumValue(roleData.userType)} />
                <InfoRow label="Description" value={roleData.description || "-"} fullWidth />
              </div>
            </div>

            {/* System Info */}
            <div className="rounded border border-border/50 bg-card p-3">
              <SectionTitle>System Info</SectionTitle>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                <InfoRow label="Created By" value={roleData.createdBy ?? "-"} />
                <InfoRow label="Created At" value={dateTimeFormat(roleData.createdAt ?? "")} />
                <InfoRow label="Updated By" value={roleData.updatedBy ?? "-"} />
                <InfoRow label="Last Updated" value={dateTimeFormat(roleData.updatedAt ?? "")} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
