import { ActionButton } from "@/components/button/action-button";
import { indexDisplay } from "@/utils/common/common";
import { formatDate } from "@/utils/date/date-time-format";
import { Edit, Eye, RotateCw, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { Switch } from "@/components/ui/switch";
import {
  AllBusinessOwnerResponseModel,
  BusinessOwnerResponseModel,
} from "../store/models/response/business-owner-response";

interface BusinessOwnerTableHandlers {
  handleViewUserDetail: (user: BusinessOwnerResponseModel) => void;
  handleEditOwner: (user: BusinessOwnerResponseModel) => void;
  handleResetPassword: (user: BusinessOwnerResponseModel) => void;
  handleDeleteUser: (user: BusinessOwnerResponseModel) => void;
  handleToggleAutoRenew: (user: BusinessOwnerResponseModel, checked: boolean) => void;
}

interface BusinessOwnerTableOptions {
  data: AllBusinessOwnerResponseModel | null;
  handlers: BusinessOwnerTableHandlers;
}

export const userBusinessOwnerTableColumns = ({
  data,
  handlers,
}: BusinessOwnerTableOptions): TableColumn<BusinessOwnerResponseModel>[] => {
  const { handleViewUserDetail, handleEditOwner, handleResetPassword, handleDeleteUser, handleToggleAutoRenew } = handlers;

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
      key: "currentPlanPrice",
      label: "Plan Price",
      minWidth: "10px",
      maxWidth: "120px",
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {user?.currentPlanPrice !== undefined && user?.currentPlanPrice !== null
            ? `$${user.currentPlanPrice}`
            : "---"}
        </span>
      ),
    },
    {
      key: "subscriptionStartDate",
      label: "Start Date",
      minWidth: "10px",
      maxWidth: "200px",
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(user?.subscriptionStartDate) || "---"}
        </span>
      ),
    },
    {
      key: "subscriptionEndDate",
      label: "End Date",
      minWidth: "10px",
      maxWidth: "200px",
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(user?.subscriptionEndDate) || "---"}
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
      key: "autoRenew",
      label: "Auto Renew",
      minWidth: "80px",
      maxWidth: "120px",
      render: (user) => (
        <Switch
          checked={user.autoRenew ?? false}
          onCheckedChange={(checked) => handleToggleAutoRenew(user, checked)}
          aria-label="Toggle auto renew"
        />
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
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit"
            onClick={() => handleEditOwner(user)}
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
