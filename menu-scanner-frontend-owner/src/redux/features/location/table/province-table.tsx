import { ActionButton } from "@/components/button/action-button";
import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import {
  AllProvinceResponseModel,
  ProvinceResponseModel,
} from "../store/models/response/province-response";

interface ProvinceTableHandlers {
  handleEditProvince: (province: ProvinceResponseModel) => void;
  handleProvinceViewDetail: (province: ProvinceResponseModel) => void;
  handleDeleteProvince: (province: ProvinceResponseModel) => void;
}

interface CommuneTableOptions {
  data: AllProvinceResponseModel | null;
  handlers: ProvinceTableHandlers;
}

export const provinceTableColumns = ({
  data,
  handlers,
}: CommuneTableOptions): TableColumn<ProvinceResponseModel>[] => {
  const { handleEditProvince, handleProvinceViewDetail, handleDeleteProvince } =
    handlers;

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
      key: "provinceEn",
      label: "Province EN",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (province) => (
        <span className="text-xs text-muted-foreground">
          {province?.provinceEn || "—"}
        </span>
      ),
    },
    {
      key: "provinceKh",
      label: "Province KH",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (province) => (
        <span className="text-xs text-muted-foreground">
          {province?.provinceKh || "—"}
        </span>
      ),
    },
    {
      key: "provinceCode",
      label: "Province Code",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (province) => (
        <span className="text-xs text-muted-foreground">
          {province?.provinceCode || "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (province) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(province?.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (province) => (
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="w-3 h-3" />}
            tooltip="View Details"
            onClick={() => handleProvinceViewDetail(province)}
          />
          <ActionButton
            icon={<Edit className="w-3 h-3" />}
            tooltip="Edit Province"
            onClick={() => handleEditProvince(province)}
          />
          <ActionButton
            icon={<Trash className="w-3 h-3" />}
            tooltip="Delete Province"
            onClick={() => handleDeleteProvince(province)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
