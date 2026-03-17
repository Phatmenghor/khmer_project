import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import {
  AllLeaveTypeResponseModel,
  LeaveTypeResponseModel,
} from "../store/models/response/leave-type-response";

interface LeaveTypeTableHandlers {
  handleEditItem: (leaveType: LeaveTypeResponseModel) => void;
  handleViewDetailItem: (leaveType: LeaveTypeResponseModel) => void;
  handleDeleteItem: (leaveType: LeaveTypeResponseModel) => void;
}

interface LeaveTypeTableOptions {
  data: AllLeaveTypeResponseModel | null;
  handlers: LeaveTypeTableHandlers;
}

export const leaveTypeTableColumns = ({
  data,
  handlers,
}: LeaveTypeTableOptions): TableColumn<LeaveTypeResponseModel>[] => {
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
      label: "Leave Type Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (leaveType) => (
        <span className="text-xs text-muted-foreground">
          {leaveType?.enumName || "---"}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (leaveType) => (
        <span className="text-xs text-muted-foreground">
          {leaveType?.description || "---"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (leaveType) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(leaveType?.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (leaveType) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleViewDetailItem(leaveType)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Leave Type"
            onClick={() => handleEditItem(leaveType)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Leave Type"
            onClick={() => handleDeleteItem(leaveType)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
