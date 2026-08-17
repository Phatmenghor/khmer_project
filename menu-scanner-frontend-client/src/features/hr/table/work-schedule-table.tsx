import React from "react";
import { TableColumn } from "@/components/shared/common/data-table";
import { TableImage } from "@/components/shared/table/table-image";
import { ActionButton } from "@/components/shared/button/custom-button";
import { Eye, Edit, Trash } from "lucide-react";
import { indexDisplay } from "@/utils/common/common";
import {
  WorkScheduleModel,
  getUserDisplayName,
  getUserRolesDisplay,
  getUserAvatarUrl,
  getWorkingDaysFormattedInfo,
} from "@/features/hr/store/models/hr-models";

interface WorkScheduleTableOptions {
  currentPage: number;
  pageSize: number;
  onView: (item: WorkScheduleModel) => void;
  onEdit: (item: WorkScheduleModel) => void;
  onDelete: (item: WorkScheduleModel) => void;
}

export const workScheduleTableColumns = ({
  currentPage,
  pageSize,
  onView,
  onEdit,
  onDelete,
}: WorkScheduleTableOptions): TableColumn<WorkScheduleModel>[] => {
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
      key: "avatar",
      label: "Profile",
      render: (item: WorkScheduleModel) => {
        const user = item.userInfo;
        const name = getUserDisplayName(user);
        const avatarUrl = getUserAvatarUrl(user);
        const fallbackText = name ? name.substring(0, 1).toUpperCase() : "S";

        return (
          <div className="flex items-center py-1">
            <TableImage
              src={avatarUrl}
              alt={name}
              fallbackText={fallbackText}
              className="h-9 w-9 rounded-[10px]"
            />
          </div>
        );
      },
    },
    {
      key: "userInfo",
      label: "Staff",
      render: (item: WorkScheduleModel) => {
        const user = item.userInfo;
        const name = getUserDisplayName(user);
        const rolesDisplay = getUserRolesDisplay(user);

        return (
          <div className="flex flex-col min-w-0 py-1">
            <span className="font-extrabold text-foreground text-xs truncate">{name}</span>
            <span className="text-[11px] text-muted-foreground font-medium truncate">
              {rolesDisplay}
            </span>
          </div>
        );
      },
    },
    {
      key: "name",
      label: "Schedule Name",
      render: (item: WorkScheduleModel) => (
        <span className="font-extrabold text-foreground text-xs">{item.name}</span>
      ),
    },
    {
      key: "workDays",
      label: "Working Days",
      render: (item: WorkScheduleModel) => {
        const info = getWorkingDaysFormattedInfo(item.workDays, item.dayShifts);
        const hasActiveShifts = item.dayShifts ? item.dayShifts.some((ds) => ds.enabled) : (item.workDays && item.workDays.length > 0);

        if (!hasActiveShifts) {
          return <span className="text-muted-foreground italic text-xs">No days set</span>;
        }

        return (
          <span className="text-xs font-extrabold text-foreground">
            {info.summaryLabel}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: WorkScheduleModel) => (
        <div className="flex items-center justify-end gap-1.5">
          <ActionButton
            icon={<Eye className="w-3.5 h-3.5" />}
            tooltip="View Schedule Details"
            onClick={() => onView(item)}
          />
          <ActionButton
            icon={<Edit className="w-3.5 h-3.5" />}
            tooltip="Edit Schedule"
            onClick={() => onEdit(item)}
          />
          <ActionButton
            icon={<Trash className="w-3.5 h-3.5" />}
            tooltip="Delete Schedule"
            onClick={() => onDelete(item)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
