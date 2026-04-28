import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { Switch } from "@/components/ui/switch";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import {
  SubcategoriesResponseModel,
} from "../store/models/response/subcategories-response";

interface SubcategoriesTableHandlers {
  handleEditSubcategory: (subcategory: SubcategoriesResponseModel) => void;
  handleSubcategoryViewDetail: (subcategory: SubcategoriesResponseModel) => void;
  handleDeleteSubcategory: (subcategory: SubcategoriesResponseModel) => void;
  handleToggleSubcategoryStatus: (subcategory: SubcategoriesResponseModel) => void;
}

interface SubcategoriesTableOptions {
  handlers: SubcategoriesTableHandlers;
}

export const subcategoriesTableColumns = ({
  handlers,
}: SubcategoriesTableOptions): TableColumn<SubcategoriesResponseModel>[] => {
  const {
    handleEditSubcategory,
    handleSubcategoryViewDetail,
    handleDeleteSubcategory,
    handleToggleSubcategoryStatus,
  } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(1, 15, index + 1)}
        </span>
      ),
    },
    {
      key: "imageUrl",
      label: "Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (subcategory) => {
        return (
          <div className="h-12 w-12 rounded-md overflow-hidden bg-muted border border-border flex-shrink-0">
            {subcategory.imageUrl ? (
              <img
                src={subcategory.imageUrl}
                alt={subcategory?.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10 dark:bg-primary/20">
                <span className="text-xs font-semibold text-primary">
                  {subcategory?.name?.charAt(0)?.toUpperCase() || "S"}
                </span>
              </div>
            )}
          </div>
        );
      },
    },

    {
      key: "name",
      label: "Subcategory Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (subcategory) => (
        <span className="text-xs text-muted-foreground">
          {subcategory?.name || "---"}
        </span>
      ),
    },

    {
      key: "categoryName",
      label: "Category",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (subcategory) => (
        <span className="text-xs text-muted-foreground">
          {subcategory?.categoryName || "---"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (subcategory) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={subcategory?.status === "ACTIVE"}
            onCheckedChange={() => handleToggleSubcategoryStatus(subcategory)}
          />
          <span className="text-xs text-muted-foreground">
            {subcategory?.status ? formatEnumValue(subcategory.status) : "---"}
          </span>
        </div>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (subcategory) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(subcategory?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (subcategory) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleSubcategoryViewDetail(subcategory)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Subcategory"
            onClick={() => handleEditSubcategory(subcategory)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Subcategory"
            onClick={() => handleDeleteSubcategory(subcategory)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
