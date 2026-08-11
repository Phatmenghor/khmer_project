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
import { UserRole } from "@/constants/status/status";

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
  currentUserId?: string;
}

export const userBusinessTableColumns = ({
  data,
  handlers,
  currentUserId,
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
          className="h-10 w-10 rounded-[10px]"
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
      render: (user) => {
        const isSelf = user?.id === currentUserId;
        const isBusinessOwner = user?.roles?.includes(UserRole.BUSINESS_OWNER);
        const isDisabled = isSelf || isBusinessOwner;

        return (
          <div className="flex items-center gap-1">
            {!isDisabled && (
              <Switch
                checked={user?.accountStatus === "ACTIVE"}
                onCheckedChange={() => handleToggleStatus(user)}
              />
            )}
            <span className="text-xs text-muted-foreground">
              {user?.accountStatus
                ? formatEnumValue(user.accountStatus)
                : "---"}
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
      render: (user) => {
        const isSelf = user?.id === currentUserId;
        const isBusinessOwner = user?.roles?.includes(UserRole.BUSINESS_OWNER);
        const hideActions = isSelf || isBusinessOwner;

        return (
          <div className="flex items-center gap-1.5">
            <ActionButton
              icon={<Eye className="w-3.5 h-3.5" />}
              tooltip="View Details"
              onClick={() => handleViewUserDetail(user)}
            />
            {!hideActions && (
              <ActionButton
                icon={<Edit className="w-3.5 h-3.5" />}
                tooltip="Edit User"
                onClick={() => handleEditUser(user)}
              />
            )}
            {!hideActions && (
              <ActionButton
                icon={<RotateCw className="w-3.5 h-3.5" />}
                tooltip="Reset Password"
                onClick={() => handleResetPassword(user)}
              />
            )}
            {!hideActions && (
              <ActionButton
                icon={<Trash className="w-3.5 h-3.5" />}
                tooltip="Delete User"
                onClick={() => handleDeleteUser(user)}
                variant="destructive"
              />
            )}
          </div>
        );
      },
    },
  ];
};
