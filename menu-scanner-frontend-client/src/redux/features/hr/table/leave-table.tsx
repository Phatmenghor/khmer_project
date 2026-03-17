import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat, formatDate } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash, Check, X } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import {
  AllLeaveResponseModel,
  LeaveResponseModel,
} from "../store/models/response/leave-response";

interface LeaveTableHandlers {
  handleEditItem: (leave: LeaveResponseModel) => void;
  handleViewDetailItem: (leave: LeaveResponseModel) => void;
  handleDeleteItem: (leave: LeaveResponseModel) => void;
  handleApproveItem: (leave: LeaveResponseModel) => void;
  handleRejectItem: (leave: LeaveResponseModel) => void;
}

interface LeaveTableOptions {
  data: AllLeaveResponseModel | null;
  handlers: LeaveTableHandlers;
}

export const leaveTableColumns = ({
  data,
  handlers,
}: LeaveTableOptions): TableColumn<LeaveResponseModel>[] => {
  const {
    handleEditItem,
    handleViewDetailItem,
    handleDeleteItem,
    handleApproveItem,
    handleRejectItem,
  } = handlers;

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
      render: (leave) => (
        <span className="text-xs text-muted-foreground">
          {leave?.userInfo?.fullName || "---"}
        </span>
      ),
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (leave) => (
        <span className="text-xs text-muted-foreground">
          {leave?.userInfo?.phoneNumber || "---"}
        </span>
      ),
    },
    {
      key: "leaveTypeEnum",
      label: "Leave Type",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (leave) => (
        <span className="text-xs text-muted-foreground">
          {leave?.leaveTypeEnum || "---"}
        </span>
      ),
    },
    {
      key: "startDate",
      label: "Start Date",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (leave) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(leave?.startDate)}
        </span>
      ),
    },
    {
      key: "endDate",
      label: "End Date",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (leave) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(leave?.endDate)}
        </span>
      ),
    },

    {
      key: "totalDays",
      label: "Total Days",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (leave) => (
        <span className="text-xs text-muted-foreground">
          {leave?.totalDays || "---"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (leave) => (
        <span className="text-xs text-muted-foreground">
          {leave?.status || "---"}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (leave) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(leave?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (leave) => {
        const isPending = leave.status === "PENDING";

        return (
          <div className="flex items-center gap-2">
            <ActionButton
              icon={<Eye className="w-4 h-4" />}
              tooltip="View Details"
              onClick={() => handleViewDetailItem(leave)}
            />
            {isPending && (
              <>
                <ActionButton
                  icon={<Check className="w-4 h-4" />}
                  tooltip="Approve Leave"
                  onClick={() => handleApproveItem(leave)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                />
                <ActionButton
                  icon={<X className="w-4 h-4" />}
                  tooltip="Reject Leave"
                  onClick={() => handleRejectItem(leave)}
                  variant="destructive"
                />
              </>
            )}
            <ActionButton
              icon={<Edit className="w-4 h-4" />}
              tooltip="Edit Leave"
              onClick={() => handleEditItem(leave)}
            />
            <ActionButton
              icon={<Trash className="w-4 h-4" />}
              tooltip="Delete Leave"
              onClick={() => handleDeleteItem(leave)}
              variant="destructive"
            />
          </div>
        );
      },
    },
  ];
};
