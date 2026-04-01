import { indexDisplay } from "@/utils/common/common";
import { Eye, Plus } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { Switch } from "@/components/ui/switch";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getStockStatusLabel, getProductStatusLabel } from "@/constants/status/status";
import {
  AllProductResponseModel,
  ProductDetailResponseModel,
  ProductSize,
} from "../store/models/response/product-response";

interface StockTableHandlers {
  handleViewProduct: (product: ProductDetailResponseModel) => void;
  handleCreateStock?: (product: ProductDetailResponseModel) => void;
  handleToggleStockStatus?: (product: ProductDetailResponseModel) => void;
}

interface StockTableOptions {
  data: AllProductResponseModel | null;
  handlers: StockTableHandlers;
}

/**
 * ProductImagePreview - Display product image with preview styling
 */
function ProductImagePreview({
  product,
}: {
  product: ProductDetailResponseModel;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="relative w-14 h-14 flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-all duration-300">
      {!imageError && product?.mainImageUrl ? (
        <>
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
          )}
          <Image
            src={product.mainImageUrl}
            alt={product.name}
            width={56}
            height={56}
            className={cn(
              "w-full h-full object-cover transition-all duration-300 hover:scale-105",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </>
      ) : (
        <span className="text-lg font-bold text-primary/80 hover:text-primary transition-colors">
          {product?.name?.charAt(0).toUpperCase() || "P"}
        </span>
      )}
    </div>
  );
}

/**
 * StockStatusBadge - Display stock status with simple color coding
 */
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

/**
 * SizesDisplay - Display product sizes horizontally with stock color-coded borders
 */
function SizesDisplay({ sizes }: { sizes: ProductSize[] | undefined }) {
  if (!sizes || sizes.length === 0) {
    return <span className="text-xs text-muted-foreground">No sizes</span>;
  }

  const getBorderColor = (stock: number) => {
    if (stock === 0) return "#DC2626"; // red
    if (stock < 10) return "#FCD34D"; // yellow
    return "#16A34A"; // green
  };

  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
      {sizes.map((size) => (
        <div
          key={size.id}
          className="px-2 py-1 rounded bg-gray-50 text-xs text-foreground whitespace-nowrap"
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

export const stockTableColumns = ({
  data,
  handlers,
}: StockTableOptions): TableColumn<ProductDetailResponseModel>[] => {
  const { handleViewProduct, handleCreateStock, handleToggleStockStatus } = handlers;

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
      label: "Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (product) => {
        return <ProductImagePreview product={product} />;
      },
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
      key: "barcode",
      label: "Barcode",
      minWidth: "10px",
      maxWidth: "150px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.barcode || "---"}
        </span>
      ),
    },

    {
      key: "totalStock",
      label: "Total Stock",
      minWidth: "10px",
      maxWidth: "150px",
      render: (product) => (
        <StockStatusBadge
          stock={product?.totalStock}
          hasSizes={product?.hasSizes || false}
        />
      ),
    },

    {
      key: "stockStatus",
      label: "Stock Status",
      minWidth: "10px",
      maxWidth: "150px",
      render: (product) => (
        <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleViewProduct(product)}
          />
          <ActionButton
            icon={<Plus className="w-4 h-4" />}
            tooltip="Create Stock"
            onClick={() => handleCreateStock?.(product)}
            variant="secondary"
          />
        </div>
      ),
    },
  ];
};

/**
 * Size Stock Table Columns - Specialized for products with size variants
 */
export const sizeStockTableColumns = ({
  data,
  handlers,
}: StockTableOptions): TableColumn<ProductDetailResponseModel>[] => {
  const { handleViewProduct, handleCreateStock, handleToggleStockStatus } = handlers;

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
      label: "Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (product) => {
        return <ProductImagePreview product={product} />;
      },
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
        <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleViewProduct(product)}
          />
          <ActionButton
            icon={<Plus className="w-4 h-4" />}
            tooltip="Create Size Stock"
            onClick={() => handleCreateStock?.(product)}
            variant="secondary"
          />
        </div>
      ),
    },
  ];
};
