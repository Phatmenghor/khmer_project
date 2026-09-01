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

interface StockTableHandlers {
  handleViewProduct: (product: ProductDetailResponseModel) => void;
  handleCreateStock?: (product: ProductDetailResponseModel) => void;
  handleToggleStockStatus?: (product: ProductDetailResponseModel) => void;
}

interface StockTableOptions {
  data: AllProductResponseModel | null;
  handlers: StockTableHandlers;
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
    if (stock === 0) return { bg: "bg-red-50 dark:bg-red-950/40", border: "border-red-200 dark:border-red-800/40", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" };
    if (stock < 10) return { bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800/40", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" };
    return { bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800/40", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" };
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {sizes.map((size) => {
        const total = size.totalStock ?? 0;
        const color = getStockColor(total);
        return (
          <div
            key={size.id}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] ${color.bg} ${color.border}`}
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
      maxWidth: "60px",
      render: (_, index) => (
        <span className="text-xs font-medium text-muted-foreground">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 15, index + 1)}
        </span>
      ),
    },
    {
      key: "imageUrl",
      label: "Image",
      minWidth: "50px",
      maxWidth: "80px",
      render: (product) => (
        <TableImage src={product.mainImage?.sm} previewSrc={product.mainImage?.o} alt={product.name} fallbackText={product.name} />
      ),
    },

    {
      key: "name",
      label: "Product Name",
      minWidth: "150px",
      maxWidth: "300px",
      truncate: true,
      render: (product) => (
        <span className="text-xs font-bold text-foreground">
          {product?.name || "---"}
        </span>
      ),
    },

    {
      key: "categoryName",
      label: "Category",
      minWidth: "100px",
      maxWidth: "150px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground font-medium">
          {product?.categoryName || "---"}
        </span>
      ),
    },

    {
      key: "brandName",
      label: "Brand",
      minWidth: "100px",
      maxWidth: "150px",
      truncate: true,
      render: (product) => (
        <span className="text-xs text-muted-foreground font-medium">
          {product?.brandName || "---"}
        </span>
      ),
    },

    {
      key: "sku",
      label: "SKU",
      minWidth: "90px",
      maxWidth: "120px",
      truncate: true,
      render: (product) => (
        <span className="text-xs font-mono text-muted-foreground">
          {product?.sku || "---"}
        </span>
      ),
    },

    {
      key: "sizes",
      label: "Sizes",
      minWidth: "240px",
      maxWidth: "480px",
      render: (product) => (
        <SizesDisplay sizes={product?.sizes} />
      ),
    },

    {
      key: "barcode",
      label: "Barcode",
      minWidth: "100px",
      maxWidth: "150px",
      truncate: true,
      render: (product) => (
        <span className="text-xs font-mono text-muted-foreground">
          {product?.barcode || "---"}
        </span>
      ),
    },

    {
      key: "totalStock",
      label: "Total Stock",
      minWidth: "110px",
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
      minWidth: "130px",
      maxWidth: "160px",
      render: (product) => (
        <div className="flex items-center gap-2">
          {handleToggleStockStatus && (
            <CustomSwitch
              checked={product?.stockStatus === "ENABLED"}
              onCheckedChange={() => handleToggleStockStatus(product)}
            />
          )}
          <span className={`text-xs font-bold ${product?.stockStatus === "ENABLED" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
            {product?.stockStatus ? formatEnumValue(product.stockStatus) : "---"}
          </span>
        </div>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "90px",
      maxWidth: "120px",
      render: (product) => (
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="w-3.5 h-3.5 text-primary" />}
            tooltip="View Details"
            onClick={() => handleViewProduct(product)}
          />
          <ActionButton
            icon={<Plus className="w-3.5 h-3.5 text-emerald-600" />}
            tooltip="Create Stock"
            onClick={() => handleCreateStock?.(product)}
            variant="secondary"
          />
        </div>
      ),
    },
  ];
};
