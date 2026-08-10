import { Edit, Trash2 } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/custom-button";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { ProductStockDto } from "../store/models/response/stock-response";

interface StockHistoryTableHandlers {
  handleEditStock: (stock: ProductStockDto) => void;
  handleDeleteStock: (stock: ProductStockDto) => void;
  isDeleting: boolean;
}

function getExpiryDateVariant(expiryDate: string): {
  textClass: string;
} {
  if (!expiryDate) {
    return { textClass: "text-muted-foreground" };
  }

  const expiryDateObj = new Date(expiryDate);
  const today = new Date();

  expiryDateObj.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (expiryDateObj < today) {
    return { textClass: "text-red-600 dark:text-red-400 font-semibold" };
  }

  const daysUntilExpiry = Math.floor(
    (expiryDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry > 0 && daysUntilExpiry <= 10) {
    return { textClass: "text-amber-600 dark:text-amber-400 font-semibold" };
  }

  return { textClass: "text-emerald-600 dark:text-emerald-400 font-semibold" };
}

function formatExpiryDate(timestamp: string | null | undefined): string {
  if (!timestamp) return "---";

  try {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return timestamp || "---";
  }
}

export function createStockHistoryColumns(
  handleEditStock: (stock: ProductStockDto) => void,
  handleDeleteStock: (stock: ProductStockDto) => void,
  isDeleting: boolean
): TableColumn<ProductStockDto>[] {
  return [
    {
      key: "stockCode",
      label: "Stock ID",
      minWidth: "140px",
      render: (stock: ProductStockDto) => {
        const shortId = stock.id ? stock.id.slice(0, 4).toUpperCase() : "0000";
        const dateStr = stock.createdAt
          ? stock.createdAt.slice(0, 10).replace(/-/g, "")
          : "BATCH";
        return (
          <span className="text-xs font-mono font-bold text-primary">
            STK-{dateStr}-{shortId}
          </span>
        );
      },
    },
    {
      key: "quantityOnHand",
      label: "Total Stock",
      minWidth: "90px",
      render: (stock: ProductStockDto) => (
        <span className="text-xs font-bold text-foreground">
          {stock.quantityOnHand} Items
        </span>
      ),
    },
    {
      key: "quantityAvailable",
      label: "Available",
      minWidth: "90px",
      render: (stock: ProductStockDto) => {
        const available = stock.quantityAvailable ?? 0;
        return (
          <span className={`text-xs font-semibold ${
            available === 0
              ? "text-red-600 dark:text-red-400"
              : available < 10
              ? "text-amber-600 dark:text-amber-400"
              : "text-emerald-600 dark:text-emerald-400"
          }`}>
            {available} Items
          </span>
        );
      },
    },
    {
      key: "priceIn",
      label: "Unit Price",
      minWidth: "90px",
      render: (stock: ProductStockDto) => (
        <span className="text-xs font-semibold text-foreground">
          ${stock.priceIn.toFixed(2)}
        </span>
      ),
    },
    {
      key: "inventoryValue",
      label: "Inventory Value",
      minWidth: "110px",
      render: (stock: ProductStockDto) => (
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
          ${(stock.inventoryValue || (stock.quantityOnHand * stock.priceIn)).toFixed(2)}
        </span>
      ),
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      minWidth: "140px",
      render: (stock: ProductStockDto) =>
        stock.expiryDate ? (
          (() => {
            const { textClass } = getExpiryDateVariant(stock.expiryDate);
            return (
              <span className={`text-xs ${textClass}`}>
                {formatExpiryDate(stock.expiryDate)}
              </span>
            );
          })()
        ) : (
          <span className="text-xs text-muted-foreground">---</span>
        ),
    },
    {
      key: "location",
      label: "Location",
      minWidth: "110px",
      render: (stock: ProductStockDto) => (
        <span className="text-xs text-muted-foreground">
          {stock.location || "---"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created Date",
      minWidth: "140px",
      render: (stock: ProductStockDto) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(stock.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "80px",
      render: (stock: ProductStockDto) => (
        <div className="flex gap-1.5 items-center">
          <ActionButton
            icon={<Edit className="w-3.5 h-3.5" />}
            tooltip="Update Stock"
            onClick={() => handleEditStock(stock)}
            variant="outline"
            className="text-foreground hover:text-primary hover:border-primary hover:bg-primary/10 transition-all"
          />
          <ActionButton
            icon={<Trash2 className="w-3.5 h-3.5 text-destructive" />}
            tooltip="Delete Stock"
            onClick={() => handleDeleteStock(stock)}
            disabled={isDeleting}
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all"
          />
        </div>
      ),
    },
  ];
}
