import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { convertEnumOrString } from "@/utils/common/enum-convert";
import { Edit, Eye, Trash } from "lucide-react";
import { ActionButton } from "@/components/button/action-button";
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
      maxWidth: "60px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 15, index + 1)}
        </span>
      ),
    },
    {
      key: "name",
      label: "Role Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (role) => (
        <span className="text-xs text-muted-foreground">
          {convertEnumOrString(role?.name)}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (role) => (
        <span className="text-xs text-muted-foreground">
          {role?.description || "---"}
        </span>
      ),
    },
    {
      key: "userType",
      label: "User Type",
      minWidth: "10px",
      maxWidth: "200px",
      render: (role) => (
        <span className="text-xs text-muted-foreground">
          {convertEnumOrString(role?.userType)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (role) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(role?.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "200px",
      render: (role) => (
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="w-3 h-3" />}
            tooltip="View Details"
            onClick={() => handleViewDetailItem(role)}
          />
          <ActionButton
            icon={<Edit className="w-3 h-3" />}
            tooltip="Edit Role"
            onClick={() => handleEditItem(role)}
          />
          <ActionButton
            icon={<Trash className="w-3 h-3" />}
            tooltip="Delete Role"
            onClick={() => handleDeleteItem(role)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
