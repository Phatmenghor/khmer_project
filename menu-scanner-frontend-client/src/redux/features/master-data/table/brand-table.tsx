import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatProductCount } from "@/utils/format/product-count-formatter";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { Switch } from "@/components/ui/switch";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import {
  AllBrandResponseModel,
  BrandResponseModel,
} from "../store/models/response/brand-response";

interface BrandTableHandlers {
  handleEditBrand: (brand: BrandResponseModel) => void;
  handleBrandViewDetail: (brand: BrandResponseModel) => void;
  handleDeleteBrand: (brand: BrandResponseModel) => void;
  handleToggleBrandStatus?: (brand: BrandResponseModel) => void;
}

interface BrandTableOptions {
  data: AllBrandResponseModel | null;
  handlers: BrandTableHandlers;
}

export const brandTableColumns = ({
  data,
  handlers,
}: BrandTableOptions): TableColumn<BrandResponseModel>[] => {
  const {
    handleEditBrand,
    handleBrandViewDetail,
    handleDeleteBrand,
    handleToggleBrandStatus
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
      label: "Brand Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (brand) => {
        return (
          <div className="h-12 w-12 rounded-md overflow-hidden bg-muted border border-border flex-shrink-0">
            {brand.imageUrl ? (
              <img
                src={brand.imageUrl}
                alt={brand?.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10 dark:bg-primary/20">
                <span className="text-xs font-semibold text-primary">
                  {brand?.name?.charAt(0)?.toUpperCase() || "B"}
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
      render: (brand) => (
        <span className="text-xs text-muted-foreground">
          {brand?.name || "---"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (brand) => (
        <div className="flex items-center gap-2">
          {handleToggleBrandStatus && (
            <Switch
              checked={brand?.status === "ACTIVE"}
              onCheckedChange={() => handleToggleBrandStatus(brand)}
            />
          )}
          <span className="text-xs text-muted-foreground">
            {brand?.status ? formatEnumValue(brand.status) : "---"}
          </span>
        </div>
      ),
    },

    {
      key: "totalProducts",
      label: "Total Products",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (brand) => (
        <span className="text-xs text-muted-foreground">
          {formatProductCount(brand?.totalProducts)}
        </span>
      ),
    },

    {
      key: "activeProducts",
      label: "Active Products",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (brand) => (
        <span className="text-xs text-muted-foreground">
          {formatProductCount(brand?.activeProducts)}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (banner) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(banner?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (brand) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleBrandViewDetail(brand)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Brand"
            onClick={() => handleEditBrand(brand)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Brand"
            onClick={() => handleDeleteBrand(brand)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
