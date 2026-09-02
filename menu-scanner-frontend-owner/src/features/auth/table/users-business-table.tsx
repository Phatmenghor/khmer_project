import { ActionButton } from "@/components/button/action-button";
import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, RotateCw, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { TableImage } from "@/components/shared/table/table-image";
import {
  AllUserResponseModel,
  UserResponseModel,
} from "../store/models/response/users-response";
import { formatEnumLabel } from "@/utils/common/enum-convert";
import { getProfileImageUrl } from "@/utils/user/user-helper";
import { CustomSwitch } from "@/components/shared/common/custom-switch";

interface UserTableHandlers {
  handleEditUser: (user: UserResponseModel) => void;
  handleViewUserDetail: (user: UserResponseModel) => void;
  handleResetPassword: (user: UserResponseModel) => void;
  handleDeleteUser: (user: UserResponseModel) => void;
  handleToggleStatus: (user: UserResponseModel, checked: boolean) => void;
}

interface UserTableOptions {
  data: AllUserResponseModel | null;
  handlers: UserTableHandlers;
}

export const userBusinessTableColumns = ({
  data,
  handlers,
}: UserTableOptions): TableColumn<UserResponseModel>[] => {
  const {
    handleEditUser,
    handleViewUserDetail,
    handleResetPassword,
    handleDeleteUser,
    handleToggleStatus,
  } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="text-xs text-muted-foreground">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 10, index + 1)}
        </span>
      ),
    },
    {
      key: "avatar",
      label: "Avatar",
      minWidth: "10px",
      maxWidth: "400px",
      render: (user) => (
        <TableImage
          src={getProfileImageUrl(user, "sm")}
          alt={user?.firstName}
          fallbackText={user?.firstName || "U"}
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
          {user?.userIdentifier || "—"}
        </span>
      ),
    },
    {
      key: "fullName",
      label: "Full Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {user?.fullName || `${user.firstName} ${user.lastName}`}
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
        <span className="text-xs font-medium text-foreground">
          {user?.businessName || "—"}
        </span>
      ),
    },
    {
      key: "roles",
      label: "Role",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {user.roles?.length > 0
            ? user.roles.map((r: string) => formatEnumLabel(r) ?? r).join(", ")
            : "—"}
        </span>
      ),
    },
    {
      key: "accountStatus",
      label: "Account Status",
      minWidth: "120px",
      maxWidth: "200px",
      render: (user) => {
        const isActive = user?.accountStatus === "ACTIVE";
        return (
          <div className="flex items-center gap-1.5">
            <CustomSwitch
              checked={isActive}
              onCheckedChange={(checked) => handleToggleStatus(user, checked)}
              size="sm"
            />
            <span
              className={`text-xs font-semibold ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : user?.accountStatus === "LOCKED"
                  ? "text-destructive"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {formatEnumLabel(user?.accountStatus) || "LOCKED"}
            </span>
          </div>
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
            icon={<Eye className="w-3 h-3" />}
            tooltip="View Details"
            onClick={() => handleViewUserDetail(user)}
          />
          <ActionButton
            icon={<Edit className="w-3 h-3" />}
            tooltip="Edit User"
            onClick={() => handleEditUser(user)}
          />
          <ActionButton
            icon={<RotateCw className="w-3 h-3" />}
            tooltip="Reset Password"
            onClick={() => handleResetPassword(user)}
          />
          <ActionButton
            icon={<Trash className="w-3 h-3" />}
            tooltip="Delete User"
            onClick={() => handleDeleteUser(user)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
