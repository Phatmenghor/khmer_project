import { ActionButton } from "@/components/button/action-button";
import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Eye, RotateCw, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import {
  AllBusinessOwnerResponseModel,
  BusinessOwnerResponseModel,
} from "../store/models/response/business-owner-response";

interface BusinessOwnerTableHandlers {
  handleViewUserDetail: (user: BusinessOwnerResponseModel) => void;
  handleResetPassword: (user: BusinessOwnerResponseModel) => void;
  handleDeleteUser: (user: BusinessOwnerResponseModel) => void;
}

interface BusinessOwnerTableOptions {
  data: AllBusinessOwnerResponseModel | null;
  handlers: BusinessOwnerTableHandlers;
}

export const userBusinessOwnerTableColumns = ({
  data,
  handlers,
}: BusinessOwnerTableOptions): TableColumn<BusinessOwnerResponseModel>[] => {
  const { handleViewUserDetail, handleResetPassword, handleDeleteUser } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "60px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 10, index + 1)}
        </span>
      ),
    },
    {
      key: "userIdentifier",
      label: "User Identifier",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {user?.ownerUserIdentifier || "---"}
        </span>
      ),
    },
    {
      key: "ownerFullName",
      label: "Full Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-xs text-muted-foreground font-medium">
          {user?.ownerFullName || "---"}
        </span>
      ),
    },
    {
      key: "phoneNumber",
      label: "Phone",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {user?.ownerPhone || "---"}
        </span>
      ),
    },
    {
      key: "businessName",
      label: "Business Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-xs text-muted-foreground font-medium">
          {user?.businessName || "---"}
        </span>
      ),
    },
    {
      key: "currentPlanName",
      label: "Plan",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-xs text-muted-foreground font-medium">
          {user?.currentPlanName || "---"}
        </span>
      ),
    },
    {
      key: "daysRemaining",
      label: "Days Remaining",
      minWidth: "10px",
      maxWidth: "400px",
      render: (user) => {
        const days = user?.daysRemaining || 0;
        const colorClass =
          days <= 7
            ? "text-red-600 font-semibold"
            : days <= 30
            ? "text-yellow-600 font-medium"
            : "text-green-600";
        return <span className={`text-xs ${colorClass}`}>{days} days</span>;
      },
    },
    {
      key: "daysActive",
      label: "Days Active",
      minWidth: "10px",
      maxWidth: "400px",
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {user?.daysActive || 0} days
        </span>
      ),
    },
    {
      key: "subscriptionStatus",
      label: "Subscription",
      minWidth: "10px",
      maxWidth: "400px",
      render: (user) => {
        const status = user?.subscriptionStatus;
        const colorClass =
          status === "ACTIVE"
            ? "text-green-600 font-medium"
            : status === "EXPIRING_SOON"
            ? "text-yellow-600 font-medium"
            : "text-red-500";
        return (
          <span className={`text-xs ${colorClass}`}>
            {status || "---"}
          </span>
        );
      },
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
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleViewUserDetail(user)}
            size="sm"
          />
          <ActionButton
            icon={<RotateCw className="w-4 h-4" />}
            tooltip="Reset Password"
            onClick={() => handleResetPassword(user)}
            size="sm"
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete"
            onClick={() => handleDeleteUser(user)}
            size="sm"
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
