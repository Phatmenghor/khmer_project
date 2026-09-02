import { TableImage } from "@/components/shared/table/table-image";
import { formatEnumLabel } from "@/utils/common/enum-convert";
import { ActionButton } from "@/components/button/action-button";
import { indexDisplay } from "@/utils/common/common";
import { formatDate } from "@/utils/date/date-time-format";
import { CreditCard, Edit, Eye, RotateCw, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { CustomSwitch } from "@/components/shared/common/custom-switch";
import { SubscriptionConfig } from "@/constants/app-resource/default/default";
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
  handleSubscriptionAction: (user: BusinessOwnerResponseModel) => void;
}

interface BusinessOwnerTableOptions {
  data: AllBusinessOwnerResponseModel | null;
  handlers: BusinessOwnerTableHandlers;
}

export const userBusinessOwnerTableColumns = ({
  data,
  handlers,
}: BusinessOwnerTableOptions): TableColumn<BusinessOwnerResponseModel>[] => {
  const { handleViewUserDetail, handleEditOwner, handleResetPassword, handleDeleteUser, handleToggleAutoRenew, handleSubscriptionAction } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "60px",
      render: (_, index) => (
        <span className="text-xs text-muted-foreground">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 10, index + 1)}
        </span>
      ),
    },
    {
      key: "avatar",
      label: "Avatar",
      minWidth: "60px",
      maxWidth: "80px",
      render: (user) => (
        <TableImage
          src={(user as any)?.logoBusinessUrl || (user as any)?.ownerProfileImage?.sm}
          alt={user?.ownerFullName}
          fallbackText={user?.ownerFullName || "O"}
          className="h-11 w-11 rounded-[12px]"
        />
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
          {user?.ownerUserIdentifier || "—"}
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
          {user?.ownerFullName || "—"}
        </span>
      ),
    },
    {
      key: "roles",
      label: "Roles",
      minWidth: "10px",
      maxWidth: "200px",
      truncate: true,
      render: (user) => {
        const rolesList = (user as any)?.roles || (user as any)?.ownerRoles || ["BUSINESS_OWNER"];
        const formatted = Array.isArray(rolesList)
          ? rolesList.map(formatEnumLabel).join(", ")
          : formatEnumLabel(rolesList);
        return (
          <span className="text-xs text-muted-foreground font-medium">
            {formatted || "Business Owner"}
          </span>
        );
      },
    },
    {
      key: "phoneNumber",
      label: "Phone",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {user?.ownerPhone || "—"}
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
          {user?.businessName || "—"}
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
          {user?.currentPlanName || "—"}
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
            : "—"}
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
          {formatDate(user?.subscriptionStartDate) || "—"}
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
          {formatDate(user?.subscriptionEndDate) || "—"}
        </span>
      ),
    },
    {
      key: "autoRenew",
      label: "Auto Renew",
      minWidth: "100px",
      maxWidth: "140px",
      render: (user) => (
        <div className="flex items-center gap-1.5">
          <CustomSwitch
            checked={user.autoRenew ?? false}
            onCheckedChange={(checked) => handleToggleAutoRenew(user, checked)}
            size="sm"
          />
          <span
            className={`text-xs font-semibold ${
              user.autoRenew
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            }`}
          >
            {user.autoRenew ? "Enabled" : "Disabled"}
          </span>
        </div>
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
          days <= SubscriptionConfig.EXPIRY_CRITICAL_DAYS
            ? "text-red-600 font-semibold"
            : days <= SubscriptionConfig.EXPIRY_WARNING_DAYS
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
            {status || "—"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (user) => (
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<CreditCard className="w-3 h-3" />}
            tooltip="Subscription"
            onClick={() => handleSubscriptionAction(user)}
          />
          <ActionButton
            icon={<Eye className="w-3 h-3" />}
            tooltip="View Details"
            onClick={() => handleViewUserDetail(user)}
          />
          <ActionButton
            icon={<Edit className="w-3 h-3" />}
            tooltip="Edit"
            onClick={() => handleEditOwner(user)}
          />
          <ActionButton
            icon={<RotateCw className="w-3 h-3" />}
            tooltip="Reset Password"
            onClick={() => handleResetPassword(user)}
          />
          <ActionButton
            icon={<Trash className="w-3 h-3" />}
            tooltip="Delete"
            onClick={() => handleDeleteUser(user)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
