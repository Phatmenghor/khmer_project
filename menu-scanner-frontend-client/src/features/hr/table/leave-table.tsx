import React from "react";
import { TableColumn } from "@/components/shared/common/data-table";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { TableImage } from "@/components/shared/table/table-image";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye } from "lucide-react";
import { indexDisplay } from "@/utils/common/common";
import {
  LeaveModel,
  LeaveStatusType,
  getUserDisplayName,
  getUserRolesDisplay,
  getUserAvatarUrl,
} from "@/features/hr/store/models/hr-models";

interface LeaveTableOptions {
  currentPage: number;
  pageSize: number;
  onReview: (item: LeaveModel) => void;
  onDelete: (item: LeaveModel) => void;
}

export const leaveTableColumns = ({
  currentPage,
  pageSize,
  onReview,
  onDelete,
}: LeaveTableOptions): TableColumn<LeaveModel>[] => {
  const renderStatus = (status: LeaveStatusType) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 rounded-xl px-2.5 py-0.5 font-bold">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/30 rounded-xl px-2.5 py-0.5 font-bold">Rejected</Badge>;
      case "PENDING":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 rounded-xl px-2.5 py-0.5 font-bold">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="text-xs text-muted-foreground">
          {indexDisplay(currentPage, pageSize, index + 1)}
        </span>
      ),
    },
    {
      key: "userInfo",
      label: "Staff",
      render: (item: LeaveModel) => {
        const user = item.userInfo;
        const name = getUserDisplayName(user);
        const avatarUrl = getUserAvatarUrl(user);
        const rolesDisplay = getUserRolesDisplay(user);

        return (
          <div className="flex items-center gap-2.5 py-1">
            <TableImage
              src={avatarUrl}
              alt={name}
              fallbackText={name ? name.substring(0, 1).toUpperCase() : "S"}
              className="h-9 w-9 rounded-[10px]"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-foreground text-xs truncate">{name}</span>
              <span className="text-[11px] text-muted-foreground font-medium truncate">
                {user?.email || rolesDisplay || "Staff Member"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "leaveTypeEnum",
      label: "Leave Type",
      render: (item: LeaveModel) => (
        <span className="font-extrabold text-primary text-xs">{item.leaveTypeEnum}</span>
      ),
    },
    {
      key: "duration",
      label: "Duration",
      render: (item: LeaveModel) => (
        <span className="text-muted-foreground text-xs">
          {item.startDate} → {item.endDate}
        </span>
      ),
    },
    {
      key: "totalDays",
      label: "Days",
      render: (item: LeaveModel) => (
        <span className="font-bold text-foreground text-xs">{item.totalDays} day(s)</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item: LeaveModel) => renderStatus(item.status),
    },
    {
      key: "reason",
      label: "Reason",
      render: (item: LeaveModel) => (
        <span className="text-muted-foreground text-xs line-clamp-1 max-w-[200px]">
          {item.reason}
        </span>
      ),
    },
    {
      key: "attachmentImage",
      label: "Attachment",
      render: (item: LeaveModel) => (
        item.attachmentImage ? (
          <TableImage
            src={item.attachmentImage}
            alt={`${item.leaveTypeEnum} Attachment`}
            className="h-8 w-8 rounded-lg"
          />
        ) : (
          <span className="text-[11px] text-muted-foreground italic">None</span>
        )
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: LeaveModel) => (
        <div className="flex items-center justify-end gap-1.5">
          <CustomButton
            size="sm"
            variant={item.status === "PENDING" ? "primary" : "outline"}
            className="h-7 rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
            onClick={() => onReview(item)}
          >
            <Eye className="w-3.5 h-3.5" />
            {item.status === "PENDING" ? "Review" : "View"}
          </CustomButton>
          <CustomButton
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-xl text-destructive hover:bg-destructive/10 cursor-pointer"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </CustomButton>
        </div>
      ),
    },
  ];
};
