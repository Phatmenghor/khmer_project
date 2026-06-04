import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import {
  AllWorkScheduleTypeResponseModel,
  WorkScheduleTypeResponseModel,
} from "../store/models/response/work-schedule-type-response";

interface WorkScheduleTableHandlers {
  handleEditItem: (workSchedule: WorkScheduleTypeResponseModel) => void;
  handleViewDetailItem: (workSchedule: WorkScheduleTypeResponseModel) => void;
  handleDeleteItem: (workSchedule: WorkScheduleTypeResponseModel) => void;
}

interface WorkScheduleTableOptions {
  data: AllWorkScheduleTypeResponseModel | null;
  handlers: WorkScheduleTableHandlers;
}

export const workScheduleTypeTableColumns = ({
  data,
  handlers,
}: WorkScheduleTableOptions): TableColumn<WorkScheduleTypeResponseModel>[] => {
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
      key: "enumName",
      label: "Work Schedule Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (workSchedule) => (
        <span className="text-xs text-muted-foreground">
          {workSchedule?.enumName || "---"}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (workSchedule) => (
        <span className="text-xs text-muted-foreground">
          {workSchedule?.description || "---"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (user) => (
        <span className="text-xs text-muted-foreground">
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
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="w-3 h-3" />}
            tooltip="View Details"
            onClick={() => handleViewDetailItem(user)}
          />
          <ActionButton
            icon={<Edit className="w-3 h-3" />}
            tooltip="Edit Work Schedule"
            onClick={() => handleEditItem(user)}
          />
          <ActionButton
            icon={<Trash className="w-3 h-3" />}
            tooltip="Delete Work Schedule"
            onClick={() => handleDeleteItem(user)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
