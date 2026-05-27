import { ActionButton } from "@/components/button/action-button";
import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import {
  AllUserResponseModel,
  UserResponseModel,
} from "../store/models/response/users-response";
import { formatEnumLabel } from "@/utils/common/enum-convert";

interface UserTableHandlers {
  handleViewUserDetail: (user: UserResponseModel) => void;
  handleDeleteUser: (user: UserResponseModel) => void;
}

interface UserTableOptions {
  data: AllUserResponseModel | null;
  handlers: UserTableHandlers;
}

export const userCustomerTableColumns = ({
  data,
  handlers,
}: UserTableOptions): TableColumn<UserResponseModel>[] => {
  const { handleViewUserDetail, handleDeleteUser } = handlers;

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
      key: "avatar",
      label: "Avatar",
      minWidth: "10px",
      maxWidth: "400px",
      render: (user) => (
        <div className="h-12 w-12 rounded-md overflow-hidden bg-muted border border-border flex-shrink-0">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user?.firstName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/10 dark:bg-primary/20">
              <span className="text-xs font-semibold text-primary">
                {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          )}
        </div>
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
            ? user.roles.map((r: string) => formatEnumLabel(r) ?? r).join(", ")
            : formatEnumLabel(user.userType) ?? "---"}
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
        <span className="text-xs text-muted-foreground">
          {formatEnumLabel(user?.accountStatus) ?? "---"}
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
            onClick={() => handleViewUserDetail(user)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete User"
            onClick={() => handleDeleteUser(user)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
