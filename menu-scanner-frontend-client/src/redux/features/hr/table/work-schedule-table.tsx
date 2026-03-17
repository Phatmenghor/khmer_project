import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat, formatTime } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import {
  AllWorkScheduleResponseModel,
  WorkScheduleResponseModel,
} from "../store/models/response/work-schedule-response";
import { formatWorkDays } from "@/utils/common/parse-work-days";

interface WorkScheduleTableHandlers {
  handleEditItem: (workSchedule: WorkScheduleResponseModel) => void;
  handleViewDetailItem: (workSchedule: WorkScheduleResponseModel) => void;
  handleDeleteItem: (workSchedule: WorkScheduleResponseModel) => void;
}

interface WorkScheduleTableOptions {
  data: AllWorkScheduleResponseModel | null;
  handlers: WorkScheduleTableHandlers;
}

export const workScheduleTableColumns = ({
  data,
  handlers,
}: WorkScheduleTableOptions): TableColumn<WorkScheduleResponseModel>[] => {
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
      render: (workSchedule) => (
        <span className="text-xs text-muted-foreground">
          {workSchedule?.userInfo.fullName || "---"}
        </span>
      ),
    },
    {
      key: "name",
      label: "Work Schedule Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (workSchedule) => (
        <span className="text-xs text-muted-foreground">
          {workSchedule?.name || "---"}
        </span>
      ),
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (workSchedule) => (
        <span className="text-xs text-muted-foreground">
          {workSchedule?.userInfo.phoneNumber || "---"}
        </span>
      ),
    },

    {
      key: "scheduleTypeEnum",
      label: "Schedule Type",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (workSchedule) => (
        <span className="text-xs text-muted-foreground">
          {workSchedule?.scheduleTypeEnum || "---"}
        </span>
      ),
    },

    {
      key: "workDays",
      label: "Working Days",
      render: (workSchedule) => (
        <span className="text-xs text-muted-foreground">
          {formatWorkDays(workSchedule?.workDays)}
        </span>
      ),
    },

    {
      key: "startTime",
      label: "Start Time",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (workSchedule) => (
        <span className="text-xs text-muted-foreground">
          {formatTime(workSchedule?.startTime) || "---"}
        </span>
      ),
    },

    {
      key: "endTime",
      label: "End Time",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (workSchedule) => (
        <span className="text-xs text-muted-foreground">
          {formatTime(workSchedule?.endTime) || "---"}
        </span>
      ),
    },

    {
      key: "breakStartTime",
      label: "Break Start Time",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (workSchedule) => (
        <span className="text-xs text-muted-foreground">
          {formatTime(workSchedule?.breakStartTime) || "---"}
        </span>
      ),
    },

    {
      key: "breakEndTime",
      label: "Break End Time",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (workSchedule) => (
        <span className="text-xs text-muted-foreground">
          {formatTime(workSchedule?.breakEndTime) || "---"}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (user) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(user?.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (user) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleViewDetailItem(user)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Work Schedule"
            onClick={() => handleEditItem(user)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Work Schedule"
            onClick={() => handleDeleteItem(user)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
