import { indexDisplay } from "@/utils/common/common";
import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import Image from "next/image";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getStockStatusLabel, getProductStatusLabel } from "@/constants/status/status";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import {
  AllProductResponseModel,
  ProductDetailResponseModel,
  ProductSize,
} from "../store/models/response/product-response";
import { ProductStockDto } from "../store/models/response/stock-response";

interface StockTableHandlers {
  handleViewProduct: (product: ProductDetailResponseModel) => void;
  handleCreateStock?: (product: ProductDetailResponseModel) => void;
  handleToggleStockStatus?: (product: ProductDetailResponseModel) => void;
}

interface StockTableOptions {
  data: AllProductResponseModel | null;
  handlers: StockTableHandlers;
}

interface StockHistoryTableHandlers {
  handleEditStock: (stock: ProductStockDto) => void;
  handleDeleteStock: (stock: ProductStockDto) => void;
  isDeleting: boolean;
}

/**
 * Get expiry date color and variant based on status
 * Green: Not expired, more than 10 days away
 * Yellow: Expiring within 10 days
 * Red: Already expired
 */
function getExpiryDateVariant(expiryDate: string): {
  variant: "default" | "secondary" | "destructive" | "outline";
  color: string;
} {
  if (!expiryDate) {
    return { variant: "secondary", color: "text-muted-foreground" };
  }

  const expiryDateObj = new Date(expiryDate);
  const today = new Date();

  expiryDateObj.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (expiryDateObj < today) {
    return { variant: "destructive", color: "text-red-600" };
  }

  const daysUntilExpiry = Math.floor(
    (expiryDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry > 0 && daysUntilExpiry <= 10) {
    return { variant: "secondary", color: "text-yellow-600" };
  }

  return { variant: "secondary", color: "text-green-600" };
}

/**
 * Format expiry date with time (DD/MM/YYYY, h:mm AM/PM)
 */
function formatExpiryDate(timestamp: string | null | undefined): string {
  if (!timestamp) return "---";

  try {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hour = String(date.getHours() % 12 || 12).padStart(1, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";

    return `${day}/${month}/${year}, ${hour}:${minute} ${ampm}`;
  } catch {
    return "---";
  }
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

/**
 * Stock History Table Columns - Display stock history with edit/delete actions
 */
export function createStockHistoryColumns(
  handleEditStock: (stock: ProductStockDto) => void,
  handleDeleteStock: (stock: ProductStockDto) => void,
  isDeleting: boolean
): TableColumn<ProductStockDto>[] {
  return [
    {
      key: "quantityOnHand",
      label: "Quantity",
      render: (stock: ProductStockDto) => (
        <Badge variant="secondary" className="text-sm">
          {stock.quantityOnHand} Items
        </Badge>
      ),
    },
    {
      key: "quantityAvailable",
      label: "Available",
      render: (stock: ProductStockDto) => (
        <span className="text-sm font-medium text-green-600">
          {stock.quantityAvailable || 0} Items
        </span>
      ),
    },
    {
      key: "priceIn",
      label: "Unit Price",
      render: (stock: ProductStockDto) => <span className="text-sm">${stock.priceIn.toFixed(2)}</span>,
    },
    {
      key: "inventoryValue",
      label: "Inventory Value",
      render: (stock: ProductStockDto) => (
        <span className="text-sm font-semibold text-blue-600">
          ${stock.inventoryValue || 0}
        </span>
      ),
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      render: (stock: ProductStockDto) =>
        stock.expiryDate ? (
          (() => {
            const { variant, color } = getExpiryDateVariant(stock.expiryDate);
            return (
              <Badge variant={variant} className={`text-xs ${color} font-medium`}>
                {formatExpiryDate(stock.expiryDate)}
              </Badge>
            );
          })()
        ) : (
          <span className="text-muted-foreground">---</span>
        ),
    },
    {
      key: "location",
      label: "Location",
      render: (stock: ProductStockDto) => (
        <span className="text-sm text-muted-foreground">{stock.location || "---"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Created Date",
      render: (stock: ProductStockDto) => <span className="text-xs text-muted-foreground">{dateTimeFormat(stock.createdAt)}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (stock: ProductStockDto) => (
        <div className="flex gap-1">
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Update Stock"
            onClick={() => handleEditStock(stock)}
          />
          <ActionButton
            icon={<Trash2 className="w-4 h-4" />}
            tooltip="Delete Stock"
            onClick={() => handleDeleteStock(stock)}
            disabled={isDeleting}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
}
