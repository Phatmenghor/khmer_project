import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { formatProductCount } from "@/utils/format/product-count-formatter";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/custom-button";
import { Switch } from "@/components/ui/switch";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { TableImage } from "@/components/shared/table/table-image";
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
    handleToggleBrandStatus,
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
      label: "Brand Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (brand) => {
        return (
          <TableImage
            src={brand.image?.sm}
            previewSrc={brand.image?.o}
            alt={brand?.name}
            fallbackText={brand?.name || "B"}
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
      render: (brand) => (
        <span className="text-xs text-muted-foreground">
          {brand?.name || "---"}
        </span>
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
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (brand) => (
        <div className="flex items-center gap-1">
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
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (banner) => (
        <span className="text-xs text-muted-foreground">
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
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="w-3 h-3" />}
            tooltip="View Details"
            onClick={() => handleBrandViewDetail(brand)}
          />
          <ActionButton
            icon={<Edit className="w-3 h-3" />}
            tooltip="Edit Brand"
            onClick={() => handleEditBrand(brand)}
          />
          <ActionButton
            icon={<Trash className="w-3 h-3" />}
            tooltip="Delete Brand"
            onClick={() => handleDeleteBrand(brand)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
