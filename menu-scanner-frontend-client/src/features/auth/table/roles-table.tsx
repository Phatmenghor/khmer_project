import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { Edit, Eye, Trash } from "lucide-react";
import { ActionButton } from "@/components/shared/button/action-button";
import {
  AllRoleResponseModel,
  RoleResponseModel,
} from "../store/models/response/role-response";
import { TableColumn } from "@/components/shared/common/data-table";

interface RoleTableHandlers {
  handleEditItem: (role: RoleResponseModel) => void;
  handleViewDetailItem: (role: RoleResponseModel) => void;
  handleDeleteItem: (role: RoleResponseModel) => void;
}

interface RoleTableOptions {
  data: AllRoleResponseModel | null;
  handlers: RoleTableHandlers;
}

export const roleTableColumns = ({
  data,
  handlers,
}: RoleTableOptions): TableColumn<RoleResponseModel>[] => {
  const { handleEditItem, handleViewDetailItem, handleDeleteItem } = handlers;

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
      key: "name",
      label: "Role Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {formatEnumValue(user?.name)}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {user?.description || "---"}
        </span>
      ),
    },
    {
      key: "userType",
      label: "User Type",
      minWidth: "10px",
      maxWidth: "200px",
      render: (user) => (
        <span className="text-xs text-muted-foreground">
          {formatEnumValue(user?.userType)}
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
            tooltip="Edit Role"
            onClick={() => handleEditItem(user)}
          />
          <ActionButton
            icon={<Trash className="w-3 h-3" />}
            tooltip="Delete Role"
            onClick={() => handleDeleteItem(user)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
