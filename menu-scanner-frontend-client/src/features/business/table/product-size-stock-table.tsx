import { indexDisplay } from "@/utils/common/common";
import { Eye, Plus } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { Switch } from "@/components/ui/switch";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { TableImage } from "@/components/shared/table/table-image";
import { getStockStatusLabel, getProductStatusLabel } from "@/constants/status/status";
import {
  AllProductResponseModel,
  ProductDetailResponseModel,
  ProductSize,
} from "../store/models/response/product-response";

interface SizeStockTableHandlers {
  handleViewProduct: (product: ProductDetailResponseModel) => void;
  handleCreateStock?: (product: ProductDetailResponseModel) => void;
  handleToggleStockStatus?: (product: ProductDetailResponseModel) => void;
}

interface SizeStockTableOptions {
  data: AllProductResponseModel | null;
  handlers: SizeStockTableHandlers;
}




function StockStatusBadge({
  stock,
  hasSizes,
}: {
  stock: number | null;
  hasSizes: boolean;
}) {
  if (stock === null || stock === undefined) {
    return <span className="text-xs text-muted-foreground">No Data</span>;
  }

  if (stock === 0) {
    return <span className="text-xs font-medium text-red-600">{stock} Items</span>;
  }

  if (stock < 10) {
    return <span className="text-xs font-medium text-yellow-600">{stock} Items</span>;
  }

  return <span className="text-xs font-medium text-green-600">{stock} Items</span>;
}


function SizesDisplay({ sizes }: { sizes: ProductSize[] | undefined }) {
  if (!sizes || sizes.length === 0) {
    return <span className="text-xs text-muted-foreground">No sizes</span>;
  }

  const getBorderColor = (stock: number) => {
    if (stock === 0) return "#DC2626";
    if (stock < 10) return "#FCD34D";
    return "#16A34A";
  };

  return (
    <div className="flex flex-nowrap gap-1 overflow-x-auto pb-1">
      {sizes.map((size) => (
        <div
          key={size.id}
          className="px-1 py-1 rounded bg-gray-50 text-xs text-foreground whitespace-nowrap"
          style={{
            border: `0.5px solid ${getBorderColor(size.totalStock)}`,
          }}
        >
          {size.name} ({size.totalStock})
        </div>
      ))}
    </div>
  );
}


export const sizeStockTableColumns = ({
  data,
  handlers,
}: SizeStockTableOptions): TableColumn<ProductDetailResponseModel>[] => {
  const { handleViewProduct, handleCreateStock, handleToggleStockStatus } = handlers;

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
      key: "imageUrl",
      label: "Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (product) => (
        <TableImage src={product.mainImage?.sm} previewSrc={product.mainImage?.o} alt={product.name} fallbackText={product.name} />
      ),
    },

    {
      key: "name",
      label: "Product Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.name || "---"}
        </span>
      ),
    },

    {
      key: "categoryName",
      label: "Category",
      minWidth: "10px",
      maxWidth: "150px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.categoryName || "---"}
        </span>
      ),
    },

    {
      key: "brandName",
      label: "Brand",
      minWidth: "10px",
      maxWidth: "150px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.brandName || "---"}
        </span>
      ),
    },

    {
      key: "sku",
      label: "SKU",
      minWidth: "10px",
      maxWidth: "120px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.sku || "---"}
        </span>
      ),
    },

    {
      key: "sizes",
      label: "Sizes",
      minWidth: "200px",
      maxWidth: "350px",
      render: (product) => (
        <SizesDisplay sizes={product?.sizes} />
      ),
    },

    {
      key: "totalStock",
      label: "Total Stock (All Sizes)",
      minWidth: "10px",
      maxWidth: "150px",
      render: (product) => (
        <StockStatusBadge
          stock={product?.totalStock}
          hasSizes={true}
        />
      ),
    },

    {
      key: "stockStatus",
      label: "Stock Status",
      minWidth: "10px",
      maxWidth: "150px",
      render: (product) => (
        <div className="flex items-center gap-1">
          {handleToggleStockStatus && (
            <Switch
              checked={product?.stockStatus === "ENABLED"}
              onCheckedChange={() => handleToggleStockStatus(product)}
            />
          )}
          <span className="text-xs text-muted-foreground">
            {product?.stockStatus ? formatEnumValue(product.stockStatus) : "---"}
          </span>
        </div>
      ),
    },

    {
      key: "status",
      label: "Product Status",
      minWidth: "10px",
      maxWidth: "120px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.status ? getProductStatusLabel(product.status) : "---"}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (product) => (
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="w-3 h-3" />}
            tooltip="View Details"
            onClick={() => handleViewProduct(product)}
          />
          <ActionButton
            icon={<Plus className="w-3 h-3" />}
            tooltip="Create Size Stock"
            onClick={() => handleCreateStock?.(product)}
            variant="secondary"
          />
        </div>
      ),
    },
  ];
};
