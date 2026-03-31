import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash, Plus, Package } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  AllProductResponseModel,
  ProductDetailResponseModel,
} from "../store/models/response/product-response";

interface StockTableHandlers {
  handleViewProduct: (product: ProductDetailResponseModel) => void;
  handleCreateStock?: (product: ProductDetailResponseModel) => void;
  handleDeleteStock?: (product: ProductDetailResponseModel) => void;
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
 * StockStatusBadge - Display stock status with color coding
 */
function StockStatusBadge({ stock, hasSizes }: { stock: number | null; hasSizes: boolean }) {
  if (stock === null || stock === undefined) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Package className="w-3 h-3" />
        No Data
      </Badge>
    );
  }

  if (stock === 0) {
    return (
      <Badge className="gap-1 bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
        <Package className="w-3 h-3" />
        Out of Stock
      </Badge>
    );
  }

  if (stock < 10) {
    return (
      <Badge className="gap-1 bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">
        <Package className="w-3 h-3" />
        Low ({stock})
      </Badge>
    );
  }

  return (
    <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
      <Package className="w-3 h-3" />
      Available ({stock})
    </Badge>
  );
}

/**
 * SizesWithStockDisplay - Display product sizes with their individual stock
 */
function SizesWithStockDisplay({ sizes }: { sizes: any[] | undefined }) {
  if (!sizes || sizes.length === 0) {
    return <span className="text-xs text-muted-foreground">No sizes</span>;
  }

  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
      {sizes.map((size) => (
        <div
          key={size.id}
          className="px-2 py-1 rounded bg-gray-50 text-xs text-foreground whitespace-nowrap"
          style={{
            border: "0.5px solid #FCD34D",
          }}
        >
          {size.name} - Stock: {size.totalStock || 0}
        </div>
      ))}
    </div>
  );
}

export const stockTableColumns = ({
  data,
  handlers,
}: StockTableOptions): TableColumn<ProductDetailResponseModel>[] => {
  const { handleViewProduct, handleCreateStock, handleDeleteStock } = handlers;

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
      key: "displayPrice",
      label: "Price",
      minWidth: "10px",
      maxWidth: "100px",
      truncate: true,
      render: (product) => (
        <span className="text-xs font-semibold text-foreground">
          ${parseFloat(product?.displayPrice?.toString() || "0").toFixed(2)}
        </span>
      ),
    },

    {
      key: "totalStock",
      label: "Total Stock",
      minWidth: "10px",
      maxWidth: "150px",
      render: (product) => (
        <StockStatusBadge stock={product?.totalStock} hasSizes={product?.hasSizes || false} />
      ),
    },

    {
      key: "hasSizes",
      label: "Type",
      minWidth: "10px",
      maxWidth: "100px",
      truncate: true,
      render: (product) => (
        <Badge variant={product?.hasSizes ? "secondary" : "outline"}>
          {product?.hasSizes ? "With Sizes" : "Single"}
        </Badge>
      ),
    },

    {
      key: "sizes",
      label: "Size Stock",
      minWidth: "25px",
      maxWidth: "1000px",
      render: (product) => <SizesWithStockDisplay sizes={product?.sizes} />,
    },

    {
      key: "stockStatus",
      label: "Stock Status",
      minWidth: "10px",
      maxWidth: "120px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground">
          {product?.stockStatus || "---"}
        </span>
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
          {product?.status || "---"}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (product) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(product?.createdAt)}
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
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete"
            onClick={() => handleDeleteStock?.(product)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
