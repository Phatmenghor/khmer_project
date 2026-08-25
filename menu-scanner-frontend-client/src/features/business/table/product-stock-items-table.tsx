import { indexDisplay } from "@/utils/common/common";
import { Eye, Plus } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/custom-button";
import { CustomSwitch } from "@/components/shared/common/custom-switch";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { TableImage } from "@/components/shared/table/table-image";
import { ProductStockItemDto, ProductStockItemsListResponse } from "../store/models/response/stock-response";

interface StockItemsTableHandlers {
  handleViewItem: (item: ProductStockItemDto) => void;
  handleEditStock?: (item: ProductStockItemDto) => void;
  handleToggleStockStatus?: (item: ProductStockItemDto) => void;
}

interface StockItemsTableOptions {
  data: ProductStockItemsListResponse | null;
  handlers: StockItemsTableHandlers;
}

function StockStatusBadge({ stock }: { stock: number | null | undefined }) {
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

export const stockItemsTableColumns = ({
  data,
  handlers,
}: StockItemsTableOptions): TableColumn<ProductStockItemDto>[] => {
  const { handleViewItem, handleEditStock, handleToggleStockStatus } = handlers;

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
      render: (item) => (
        <TableImage
          src={item?.mainImageUrl}
          previewSrc={item?.mainImageUrl}
          alt={item?.productName || "Stock item"}
          fallbackText={item?.productName}
        />
      ),
    },

    {
      key: "productName",
      label: "Product Name",
      minWidth: "160px",
      maxWidth: "320px",
      truncate: true,
      render: (item) => (
        <div className="flex flex-col gap-0.5 items-start">
          <span className="text-xs font-bold text-foreground truncate max-w-full">
            {item?.productName || "---"}
          </span>
          {item?.type === "SIZE" && item?.sizeName ? (
            <span className="text-[11px] font-medium text-primary">
              Size: {item.sizeName}
            </span>
          ) : (
            <span className="text-[11px] font-medium text-muted-foreground">
              No size
            </span>
          )}
        </div>
      ),
    },

    {
      key: "totalStock",
      label: "Total Stock",
      minWidth: "110px",
      maxWidth: "150px",
      render: (item) => <StockStatusBadge stock={item?.totalStock} />,
    },

    {
      key: "categoryName",
      label: "Category",
      minWidth: "100px",
      maxWidth: "150px",
      truncate: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground font-medium">
          {item?.categoryName || "---"}
        </span>
      ),
    },

    {
      key: "brandName",
      label: "Brand",
      minWidth: "100px",
      maxWidth: "150px",
      truncate: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground font-medium">
          {item?.brandName || "---"}
        </span>
      ),
    },

    {
      key: "sku",
      label: "SKU",
      minWidth: "90px",
      maxWidth: "120px",
      truncate: true,
      render: (item) => (
        <span className="text-xs font-mono text-muted-foreground">
          {item?.sku || "---"}
        </span>
      ),
    },

    {
      key: "barcode",
      label: "Barcode",
      minWidth: "100px",
      maxWidth: "150px",
      truncate: true,
      render: (item) => (
        <span className="text-xs font-mono text-muted-foreground">
          {item?.barcode || "---"}
        </span>
      ),
    },

    {
      key: "stockStatus",
      label: "Stock Status",
      minWidth: "130px",
      maxWidth: "160px",
      render: (item) => (
        <div className="flex items-center gap-2">
          {handleToggleStockStatus && (
            <CustomSwitch
              checked={item?.stockStatus === "ENABLED"}
              onCheckedChange={() => handleToggleStockStatus(item)}
            />
          )}
          <span
            className={`text-xs font-bold ${
              item?.stockStatus === "ENABLED"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            }`}
          >
            {item?.stockStatus ? formatEnumValue(item.stockStatus) : "---"}
          </span>
        </div>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "90px",
      maxWidth: "120px",
      render: (item) => (
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="w-3.5 h-3.5 text-primary" />}
            tooltip="View Details"
            onClick={() => handleViewItem(item)}
          />
          <ActionButton
            icon={<Plus className="w-3.5 h-3.5 text-emerald-600" />}
            tooltip="Create Stock"
            onClick={() => handleEditStock?.(item)}
            variant="secondary"
          />
        </div>
      ),
    },
  ];
};
