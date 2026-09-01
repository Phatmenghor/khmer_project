import React from "react";
import { TableColumn } from "@/components/shared/common/data-table";
import { TableImage } from "@/components/shared/table/table-image";
import { ActionButton } from "@/components/shared/button/custom-button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, Check, X } from "lucide-react";
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
  onApprove?: (item: LeaveModel) => void;
  onReject?: (item: LeaveModel) => void;
  onDelete: (item: LeaveModel) => void;
}

export const leaveTableColumns = ({
  currentPage,
  pageSize,
  onReview,
  onApprove,
  onReject,
  onDelete,
}: LeaveTableOptions): TableColumn<LeaveModel>[] => {
  const renderStatus = (status: LeaveStatusType) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-600 hover:text-emerald-600 border border-emerald-500/30 hover:border-emerald-500/80 rounded-xl px-2.5 py-0.5 font-bold transition-colors cursor-default">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500/10 hover:bg-red-500/10 text-red-600 hover:text-red-600 border border-red-500/30 hover:border-red-500/80 rounded-xl px-2.5 py-0.5 font-bold transition-colors cursor-default">Rejected</Badge>;
      case "CANCELLED":
        return <Badge className="bg-gray-500/10 hover:bg-gray-500/10 text-gray-500 hover:text-gray-500 border border-gray-500/30 hover:border-gray-500/80 rounded-xl px-2.5 py-0.5 font-bold transition-colors cursor-default">Cancelled</Badge>;
      case "PENDING":
        return <Badge className="bg-amber-500/10 hover:bg-amber-500/10 text-amber-600 hover:text-amber-600 border border-amber-500/30 hover:border-amber-500/80 rounded-xl px-2.5 py-0.5 font-bold transition-colors cursor-default">Pending</Badge>;
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
      label: "Days & Session",
      render: (item: LeaveModel) => {
        const sessionLabel =
          item.leaveSession === "MORNING_SESSION"
            ? "Sec 1 (Morning)"
            : item.leaveSession === "AFTERNOON_SESSION"
            ? "Sec 2 (Afternoon)"
            : "Full Day";
        return (
          <div className="flex flex-col">
            <span className="font-bold text-foreground text-xs">{item.totalDays} day(s)</span>
            <span className="text-[10px] text-muted-foreground font-semibold">{sessionLabel}</span>
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (item: LeaveModel) => renderStatus(item.status),
    },
    {
      key: "actionUserInfo",
      label: "Action By",
      render: (item: LeaveModel) => {
        if (item.status === "PENDING") {
          return <span className="text-[11px] text-muted-foreground italic">Pending Review</span>;
        }
        const actionUser = item.actionUserInfo;
        const name = actionUser ? `${actionUser.firstName || ""} ${actionUser.lastName || ""}`.trim() : "System Admin";
        return (
          <span className="text-xs text-foreground font-semibold truncate max-w-[150px] block">
            {name}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: LeaveModel) => (
        <div className="flex items-center justify-end gap-1">
          {item.status === "PENDING" && (
            <>
              {onApprove && (
                <ActionButton
                  icon={<Check className="w-3.5 h-3.5" />}
                  tooltip="Approve Leave"
                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                  onClick={() => onApprove(item)}
                />
              )}
              {onReject && (
                <ActionButton
                  icon={<X className="w-3.5 h-3.5" />}
                  tooltip="Reject Leave"
                  variant="destructive"
                  onClick={() => onReject(item)}
                />
              )}
            </>
          )}
          <ActionButton
            icon={<Eye className="w-3.5 h-3.5" />}
            tooltip={item.status === "PENDING" ? "Review Leave" : "View Details"}
            onClick={() => onReview(item)}
          />
          <ActionButton
            icon={<Trash2 className="w-3.5 h-3.5" />}
            tooltip="Delete Request"
            variant="destructive"
            onClick={() => onDelete(item)}
          />
        </div>
      ),
    },
  ];
};
