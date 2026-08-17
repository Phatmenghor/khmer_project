import React from "react";
import { TableColumn } from "@/components/shared/common/data-table";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { indexDisplay } from "@/utils/common/common";
import {
  AttendanceModel,
  AttendanceStatusType,
  AttendanceCheckIn,
} from "@/features/hr/store/models/hr-models";

interface AttendanceTableOptions {
  currentPage: number;
  pageSize: number;
  onDelete: (item: AttendanceModel) => void;
}

export const attendanceTableColumns = ({
  currentPage,
  pageSize,
  onDelete,
}: AttendanceTableOptions): TableColumn<AttendanceModel>[] => {
  const renderStatus = (status: AttendanceStatusType) => {
    switch (status) {
      case "PRESENT":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 rounded-xl px-2.5 py-0.5 font-bold">Present</Badge>;
      case "LATE":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 rounded-xl px-2.5 py-0.5 font-bold">Late</Badge>;
      case "ABSENT":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/30 rounded-xl px-2.5 py-0.5 font-bold">Absent</Badge>;
      case "HALF_DAY":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30 rounded-xl px-2.5 py-0.5 font-bold">Half Day</Badge>;
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
      label: "Employee",
      render: (item: AttendanceModel) => {
        const user = item.userInfo;
        const name = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Staff Member";
        return (
          <div className="flex items-center gap-2.5 py-1">
            <CustomAvatar name={name} imageUrl={user?.profileImageUrl} size="md" />
            <div className="flex flex-col">
              <span className="font-extrabold text-foreground text-xs">{name}</span>
              <span className="text-[11px] text-muted-foreground">{user?.email || "N/A"}</span>
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
      key: "status",
      label: "Status",
      render: (item: AttendanceModel) => renderStatus(item.status),
    },
    {
      key: "checkIns",
      label: "Clock Logs",
      render: (item: AttendanceModel) => {
        const logs = item.checkIns;
        if (!logs || logs.length === 0) {
          return <span className="text-muted-foreground italic text-[11px]">No logs</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {logs.map((ci: AttendanceCheckIn) => (
              <span
                key={ci.id}
                className="bg-muted/50 border border-border/60 px-2 py-0.5 rounded-lg text-[10px] font-mono text-muted-foreground"
              >
                {ci.checkInType === "CHECK_IN" ? "IN" : "OUT"}: {ci.checkInTime}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "remarks",
      label: "Remarks",
      render: (item: AttendanceModel) => (
        <span className="text-muted-foreground text-xs">{item.remarks || "-"}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: AttendanceModel) => (
        <div className="text-right">
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
