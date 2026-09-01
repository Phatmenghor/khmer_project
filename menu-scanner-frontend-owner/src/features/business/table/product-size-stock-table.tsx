import { indexDisplay } from "@/utils/common/common";
import { Eye, Plus } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/custom-button";
import { CustomSwitch } from "@/components/shared/common/custom-switch";
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
    return <span className="text-xs text-muted-foreground">---</span>;
  }

  if (stock === 0) {
    return <span className="text-xs font-semibold text-red-600 dark:text-red-400">0 Items</span>;
  }

  if (stock < 10) {
    return <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{stock} Items</span>;
  }

  return <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{stock} Items</span>;
}


function SizesDisplay({ sizes }: { sizes: ProductSize[] | undefined }) {
  if (!sizes || sizes.length === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/50">
        No sizes
      </span>
    );
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return { bg: "bg-red-50", border: "border-red-300", text: "text-red-600", dot: "bg-red-500" };
    if (stock < 10) return { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", dot: "bg-yellow-400" };
    return { bg: "bg-green-50", border: "border-green-300", text: "text-green-700", dot: "bg-green-500" };
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {sizes.map((size) => {
        const total = size.totalStock ?? 0;
        const color = getStockColor(total);
        return (
          <div
            key={size.id}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] ${color.bg} ${color.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color.dot}`} />
            <span className="font-semibold text-foreground">{size.name}</span>
            <span className={`font-bold ${color.text}`}>({total})</span>
          </div>
        );
      })}
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
      minWidth: "260px",
      maxWidth: "480px",
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
            <CustomSwitch
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
