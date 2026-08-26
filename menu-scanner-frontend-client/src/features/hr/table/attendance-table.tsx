import React from "react";
import { TableColumn } from "@/components/shared/common/data-table";
import { TableImage } from "@/components/shared/table/table-image";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Trash2, Eye } from "lucide-react";
import { indexDisplay } from "@/utils/common/common";
import {
  AttendanceModel,
  AttendanceCheckIn,
  getUserDisplayName,
  getUserRolesDisplay,
  getUserAvatarUrl,
} from "@/features/hr/store/models/hr-models";

interface AttendanceTableOptions {
  currentPage: number;
  pageSize: number;
  onViewDetail: (item: AttendanceModel) => void;
  onDelete: (item: AttendanceModel) => void;
}

export const attendanceTableColumns = ({
  currentPage,
  pageSize,
  onViewDetail,
  onDelete,
}: AttendanceTableOptions): TableColumn<AttendanceModel>[] => {
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
      render: (item: AttendanceModel) => {
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
      key: "attendanceDate",
      label: "Date",
      render: (item: AttendanceModel) => (
        <span className="font-semibold text-foreground text-xs">{item.attendanceDate}</span>
      ),
    },
    {
      key: "checkIns",
      label: "Clock Logs",
      render: (item: AttendanceModel) => {
        const logs = item.checkIns;
        const isLate = item.status === "LATE" || (item.lateMinutes !== undefined && item.lateMinutes > 0);
        const lateMins = item.lateMinutes;
        const overMins = item.overtimeMinutes;

        if (!logs || logs.length === 0) {
          return (
            <span className="font-extrabold text-rose-600 dark:text-rose-400 text-xs">
              {item.status === "ABSENT" ? "Absent" : item.status}
            </span>
          );
        }

        return (
          <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold">
            {logs.map((ci: AttendanceCheckIn, idx: number) => {
              const formattedTime = ci.checkInTime
                ? new Date(ci.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Recently";
              const isCheckIn = ci.checkInType === "CHECK_IN" || (ci as any).checkInType === "START";

              if (isCheckIn) {
                const ciLateMins = ci.lateMinutes !== undefined ? ci.lateMinutes : lateMins;
                const isCiLate = ci.isLate || (ciLateMins !== undefined && ciLateMins > 0) || isLate;

                return (
                  <span
                    key={ci.id || idx}
                    className={
                      isCiLate
                        ? "text-amber-600 dark:text-amber-400 font-extrabold"
                        : "text-emerald-600 dark:text-emerald-400 font-extrabold"
                    }
                  >
                    IN: {formattedTime} {isCiLate ? `(Late ${ciLateMins ? `${ciLateMins}m` : ""})` : "(Present)"}
                  </span>
                );
              }

              const ciEarlyMins = ci.earlyLeaveMinutes !== undefined ? ci.earlyLeaveMinutes : item.earlyLeaveMinutes;
              const isCiEarly = ci.isEarly || (ciEarlyMins !== undefined && ciEarlyMins > 0);
              const isCiOvertime = ci.isOvertime || (overMins !== undefined && overMins > 0);

              return (
                <span
                  key={ci.id || idx}
                  className={
                    isCiEarly
                      ? "text-rose-600 dark:text-rose-400 font-extrabold"
                      : isCiOvertime
                      ? "text-indigo-600 dark:text-indigo-400 font-extrabold"
                      : "text-blue-600 dark:text-blue-400 font-extrabold"
                  }
                >
                  OUT: {formattedTime}{" "}
                  {isCiEarly
                    ? `(Early ${ciEarlyMins ? `${ciEarlyMins}m` : ""})`
                    : isCiOvertime
                    ? "(Overtime)"
                    : ""}
                </span>
              );
            })}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: AttendanceModel) => (
        <div className="flex items-center justify-end gap-1">
          <CustomButton
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-xl text-primary hover:bg-primary/10 cursor-pointer"
            onClick={() => onViewDetail(item)}
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </CustomButton>
          <CustomButton
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-xl text-destructive hover:bg-destructive/10 cursor-pointer"
            onClick={() => onDelete(item)}
            title="Delete Record"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </CustomButton>
        </div>
      ),
    },
  ];
};
