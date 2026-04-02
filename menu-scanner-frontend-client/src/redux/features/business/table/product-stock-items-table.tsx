import { indexDisplay } from "@/utils/common/common";
import { Eye, Plus } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { getStockStatusLabel, getProductStatusLabel } from "@/constants/status/status";
import { formatCurrency } from "@/utils/common/currency-format";
import { Badge } from "@/components/ui/badge";
import { ProductStockItemDto, ProductStockItemsListResponse } from "../store/models/response/stock-response";

interface StockItemsTableHandlers {
  handleViewItem: (item: ProductStockItemDto) => void;
  handleEditStock?: (item: ProductStockItemDto) => void;
}

interface StockItemsTableOptions {
  data: ProductStockItemsListResponse | null;
  handlers: StockItemsTableHandlers;
}

/**
 * Product Stock Items Table Columns - Display flattened product/size items
 * Each product or product-size is displayed as a separate row
 */
export const stockItemsTableColumns = ({
  data,
  handlers,
}: StockItemsTableOptions): TableColumn<ProductStockItemDto>[] => {
  const { handleViewItem, handleEditStock } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "50px",
      maxWidth: "80px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 15, index + 1)}
        </span>
      ),
    },

    {
      key: "productName",
      label: "Product Name",
      minWidth: "150px",
      maxWidth: "250px",
      truncate: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {item?.productName || "---"}
        </span>
      ),
    },

    {
      key: "categoryName",
      label: "Category",
      minWidth: "120px",
      maxWidth: "180px",
      truncate: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground">
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
        <span className="text-xs text-muted-foreground">
          {item?.brandName || "---"}
        </span>
      ),
    },

    {
      key: "sku",
      label: "SKU",
      minWidth: "100px",
      maxWidth: "150px",
      truncate: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground">
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
        <span className="text-xs text-muted-foreground">
          {item?.barcode || "---"}
        </span>
      ),
    },

    {
      key: "price",
      label: "Price",
      minWidth: "100px",
      maxWidth: "150px",
      render: (item) => {
        if (!item?.price) return <span className="text-xs text-muted-foreground">---</span>;
        const basePrice = parseFloat(item.price);
        return (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium">
              {formatCurrency(basePrice)}
            </span>
            {item.hasPromotion && item.displayPrice && (
              <span className="text-xs font-bold text-green-600">
                {formatCurrency(item.displayPrice)}
              </span>
            )}
          </div>
        );
      },
    },

    {
      key: "hasPromotion",
      label: "Promotion",
      minWidth: "120px",
      maxWidth: "180px",
      render: (item) => {
        if (!item?.hasPromotion) {
          return <span className="text-xs text-muted-foreground">No Promotion</span>;
        }
        return (
          <Badge variant="destructive" className="text-xs">
            {item.displayPromotionType === "PERCENTAGE"
              ? `${item.displayPromotionValue}% OFF`
              : `Save ${formatCurrency(item.displayPromotionValue || 0)}`}
          </Badge>
        );
      },
    },

    {
      key: "sizeName",
      label: "Size",
      minWidth: "80px",
      maxWidth: "120px",
      truncate: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {item?.sizeName || "---"}
        </span>
      ),
    },

    {
      key: "totalStock",
      label: "Total Stock",
      minWidth: "100px",
      maxWidth: "150px",
      render: (item) => {
        const stock = item?.totalStock;
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
      },
    },

    {
      key: "quantityAvailable",
      label: "Available",
      minWidth: "100px",
      maxWidth: "150px",
      render: (item) => {
        const available = item?.quantityAvailable;
        if (available === null || available === undefined) {
          return <span className="text-xs text-muted-foreground">---</span>;
        }
        return <span className="text-xs font-medium text-green-600">{available} Items</span>;
      },
    },

    {
      key: "quantityReserved",
      label: "Reserved",
      minWidth: "100px",
      maxWidth: "150px",
      render: (item) => {
        const reserved = item?.quantityReserved;
        if (reserved === null || reserved === undefined) {
          return <span className="text-xs text-muted-foreground">---</span>;
        }
        return <span className="text-xs font-medium text-orange-600">{reserved} Items</span>;
      },
    },

    {
      key: "quantityOnHand",
      label: "On Hand",
      minWidth: "100px",
      maxWidth: "150px",
      render: (item) => {
        const onHand = item?.quantityOnHand;
        if (onHand === null || onHand === undefined) {
          return <span className="text-xs text-muted-foreground">---</span>;
        }
        return <span className="text-xs font-medium">{onHand} Items</span>;
      },
    },

    {
      key: "status",
      label: "Product Status",
      minWidth: "100px",
      maxWidth: "150px",
      truncate: true,
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {item?.status ? getProductStatusLabel(item.status) : "---"}
        </span>
      ),
    },

    {
      key: "stockStatus",
      label: "Stock Status",
      minWidth: "100px",
      maxWidth: "150px",
      render: (item) => (
        <span className="text-xs text-muted-foreground">
          {item?.stockStatus ? formatEnumValue(item.stockStatus) : "---"}
        </span>
      ),
    },

    {
      key: "type",
      label: "Type",
      minWidth: "80px",
      maxWidth: "120px",
      render: (item) => (
        <span className={`text-xs font-medium px-2 py-1 rounded ${
          item?.type === "PRODUCT"
            ? "bg-blue-100 text-blue-700"
            : "bg-purple-100 text-purple-700"
        }`}>
          {item?.type || "---"}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "100px",
      maxWidth: "150px",
      render: (item) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleViewItem(item)}
          />
          <ActionButton
            icon={<Plus className="w-4 h-4" />}
            tooltip="Edit Stock"
            onClick={() => handleEditStock?.(item)}
            variant="secondary"
          />
        </div>
      ),
    },
  ];
};
