import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat, formatDate } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash, Check, X } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import {
  AllAttendanceResponseModel,
  AttendanceResponseModel,
} from "../store/models/response/attendance-response";

interface AttendanceTableHandlers {
  handleEditItem: (attendance: AttendanceResponseModel) => void;
  handleViewDetailItem: (attendance: AttendanceResponseModel) => void;
  handleDeleteItem: (attendance: AttendanceResponseModel) => void;
}

interface AttendanceTableOptions {
  data: AllAttendanceResponseModel | null;
  handlers: AttendanceTableHandlers;
}

export const attendanceTableColumns = ({
  data,
  handlers,
}: AttendanceTableOptions): TableColumn<AttendanceResponseModel>[] => {
  const { handleEditItem, handleViewDetailItem, handleDeleteItem } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 10, index + 1)}
        </span>
      ),
    },

    {
      key: "fullName",
      label: "Full Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (attendance) => (
        <span className="text-xs text-muted-foreground">
          {attendance?.userInfo?.fullName || "---"}
        </span>
      ),
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (attendance) => (
        <span className="text-xs text-muted-foreground">
          {attendance?.userInfo?.phoneNumber || "---"}
        </span>
      ),
    },
    {
      key: "attendanceDate",
      label: "Attendance Date",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (attendance) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(attendance?.attendanceDate)}
        </span>
      ),
    },

    {
      key: "checkIns",
      label: "Check In Times",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (attendance) => (
        <span className="text-xs text-muted-foreground">
          {attendance?.checkIns
            ?.map((c) => `${c.checkInType}: ${dateTimeFormat(c.checkInTime)}`)
            .join(" | ")}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (attendance) => (
        <span className="text-xs text-muted-foreground">
          {attendance?.status || "---"}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (attendance) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(attendance?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (attendance) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleViewDetailItem(attendance)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Attendance"
            onClick={() => handleEditItem(attendance)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Attendance"
            onClick={() => handleDeleteItem(attendance)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
