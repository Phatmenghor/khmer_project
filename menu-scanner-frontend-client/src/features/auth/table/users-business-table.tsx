import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, RotateCw, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { TableImage } from "@/components/shared/table/table-image";
import {
  AllUserResponseModel,
  UserResponseModel,
} from "../store/models/response/users-response";
import { ActionButton } from "@/components/shared/button/custom-button";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { Switch } from "@/components/ui/switch";

interface UserTableHandlers {
  handleEditUser: (user: UserResponseModel) => void;
  handleViewUserDetail: (user: UserResponseModel) => void;
  handleResetPassword: (user: UserResponseModel) => void;
  handleDeleteUser: (user: UserResponseModel) => void;
  handleToggleStatus: (user: UserResponseModel) => void;
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
          src={user.profileImage?.sm}
          previewSrc={user.profileImage?.o}
          alt={user?.firstName}
          fallbackText={user?.firstName || "U"}
          className="h-8 w-8"
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
          {user?.userIdentifier || "---"}
        </span>
      ),
    },
    {
      key: "phoneNumber",
      label: "Phone Number",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {user?.phoneNumber || "---"}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {user?.email || "---"}
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
      key: "roles",
      label: "Role",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {user.roles?.length > 0
            ? user.roles.map((role: string) => formatEnumValue(role)).join(", ")
            : "---"}
        </span>
      ),
    },
    {
      key: "accountStatus",
      label: "Account Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <div className="flex items-center gap-1">
          <Switch
            checked={user?.accountStatus === "ACTIVE"}
            onCheckedChange={() => handleToggleStatus(user)}
          />
          <span className="text-xs text-muted-foreground">
            {user?.accountStatus ? formatEnumValue(user.accountStatus) : "---"}
          </span>
        </div>
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
