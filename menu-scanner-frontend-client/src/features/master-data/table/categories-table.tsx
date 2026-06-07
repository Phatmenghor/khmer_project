import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { Switch } from "@/components/ui/switch";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { formatProductCount } from "@/utils/format/product-count-formatter";
import { TableImage } from "@/components/shared/table/table-image";
import {
  AllCategoriesResponseModel,
  CategoriesResponseModel,
} from "../store/models/response/categories-response";

interface CategoriesTableHandlers {
  handleEditCategories: (brand: CategoriesResponseModel) => void;
  handleCategoriesViewDetail: (brand: CategoriesResponseModel) => void;
  handleDeleteCategories: (brand: CategoriesResponseModel) => void;
  handleToggleCategoryStatus: (category: CategoriesResponseModel) => void;
}

interface CategoriesTableOptions {
  data: AllCategoriesResponseModel | null;
  handlers: CategoriesTableHandlers;
}

export const categoriesTableColumns = ({
  data,
  handlers,
}: CategoriesTableOptions): TableColumn<CategoriesResponseModel>[] => {
  const {
    handleEditCategories,
    handleCategoriesViewDetail,
    handleDeleteCategories,
    handleToggleCategoryStatus,
  } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="text-xs text-muted-foreground">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 15, index + 1)}
        </span>
      ),
    },
    {
      key: "image",
      label: "Categories Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (categories) => {
        return (
          <TableImage
            src={categories.image?.sm || categories.image?.md || categories.image?.o}
            alt={categories?.name}
            fallbackText={categories?.name || "C"}
          />
        );
      },
    },

    {
      key: "name",
      label: "Brand Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (categories) => (
        <span className="text-xs text-muted-foreground">
          {categories?.name || "---"}
        </span>
      ),
    },

    {
      key: "totalProducts",
      label: "Total Products",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (categories) => (
        <span className="text-xs text-muted-foreground">
          {formatProductCount(categories?.totalProducts)}
        </span>
      ),
    },

    {
      key: "activeProducts",
      label: "Active Products",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (categories) => (
        <span className="text-xs text-muted-foreground">
          {formatProductCount(categories?.activeProducts)}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (categories) => (
        <div className="flex items-center gap-1">
          <Switch
            checked={categories?.status === "ACTIVE"}
            onCheckedChange={() => handleToggleCategoryStatus(categories)}
          />
          <span className="text-xs text-muted-foreground">
            {categories?.status ? formatEnumValue(categories.status) : "---"}
          </span>
        </div>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (categories) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(categories?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (categories) => (
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="w-3 h-3" />}
            tooltip="View Details"
            onClick={() => handleCategoriesViewDetail(categories)}
          />
          <ActionButton
            icon={<Edit className="w-3 h-3" />}
            tooltip="Edit Brand"
            onClick={() => handleEditCategories(categories)}
          />
          <ActionButton
            icon={<Trash className="w-3 h-3" />}
            tooltip="Delete Brand"
            onClick={() => handleDeleteCategories(categories)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
