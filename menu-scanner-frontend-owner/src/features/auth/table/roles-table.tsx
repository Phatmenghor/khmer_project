import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { convertEnumOrString } from "@/utils/common/enum-convert";
import { TableActionButtons } from "@/components/shared/button/custom-button";
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
        <span className="text-xs text-muted-foreground font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 15, index + 1)}
        </span>
      ),
    },
    {
      key: "name",
      label: "Role Name",
      minWidth: "10px",
      maxWidth: "300px",
      truncate: true,
      render: (role) => (
        <span className="text-xs font-semibold text-foreground">
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
          {role?.description || "—"}
        </span>
      ),
    },
    {
      key: "userType",
      label: "User Type",
      minWidth: "10px",
      maxWidth: "200px",
      render: (role) => (
        <span className="text-xs font-medium text-foreground">
          {convertEnumOrString(role?.userType)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "300px",
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
      maxWidth: "150px",
      render: (role) => {
        const isPlatformOwner = role?.name === "PLATFORM_OWNER";

        return (
          <TableActionButtons
            onView={() => handleViewDetailItem(role)}
            onEdit={() => handleEditItem(role)}
            onDelete={isPlatformOwner ? undefined : () => handleDeleteItem(role)}
            viewTooltip="View Details"
            editTooltip="Edit Role"
            deleteTooltip="Delete Role"
          />
        );
      },
    },
  ];
};
