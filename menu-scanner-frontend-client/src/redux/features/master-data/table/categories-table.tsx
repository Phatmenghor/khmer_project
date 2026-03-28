import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { Switch } from "@/components/ui/switch";
import { formatEnumValue } from "@/utils/format/enum-formatter";
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
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 15, index + 1)}
        </span>
      ),
    },
    {
      key: "imageUrl",
      label: "Categories Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (categories) => {
        return (
          <div className="h-12 w-12 rounded-md overflow-hidden bg-muted border border-border flex-shrink-0">
            {categories.imageUrl ? (
              <img
                src={categories.imageUrl}
                alt={categories?.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10 dark:bg-primary/20">
                <span className="text-xs font-semibold text-primary">
                  {categories?.name?.charAt(0)?.toUpperCase() || "C"}
                </span>
              </div>
            )}
          </div>
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
          {categories?.totalProducts ?? "---"}
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
          {categories?.activeProducts ?? "---"}
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
        <div className="flex items-center gap-2">
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
        <span className="text-sm text-muted-foreground">
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
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleCategoriesViewDetail(categories)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Brand"
            onClick={() => handleEditCategories(categories)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Brand"
            onClick={() => handleDeleteCategories(categories)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
