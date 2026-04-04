import { Edit, Trash2 } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { Badge } from "@/components/ui/badge";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { ProductStockDto } from "../store/models/response/stock-response";

interface SizeStockHistoryTableHandlers {
  handleEditStock: (stock: ProductStockDto) => void;
  handleDeleteStock: (stock: ProductStockDto) => void;
  isDeleting: boolean;
}

/**
 * Get expiry date background color based on status
 * Primary: Not expired, more than 10 days away
 * Orange: Expiring within 10 days
 * Red: Already expired
 */
function getExpiryDateVariant(expiryDate: string): {
  bgClass: string;
} {
  if (!expiryDate) {
    return { bgClass: "bg-muted" };
  }

  const expiryDateObj = new Date(expiryDate);
  const today = new Date();

  expiryDateObj.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (expiryDateObj < today) {
    return { bgClass: "bg-red-500" };
  }

  const daysUntilExpiry = Math.floor(
    (expiryDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysUntilExpiry > 0 && daysUntilExpiry <= 10) {
    return { bgClass: "bg-orange-500" };
  }

  return { bgClass: "bg-primary" };
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
 * Size Stock History Table Columns - Display size stock history with edit/delete actions
 */
export function createSizeStockHistoryColumns(
  handleEditStock: (stock: ProductStockDto) => void,
  handleDeleteStock: (stock: ProductStockDto) => void,
  isDeleting: boolean,
): TableColumn<ProductStockDto>[] {
  return [
    {
      key: "productSizeName",
      label: "Size Name",
      render: (stock: ProductStockDto) => (
        <span className="text-sm">{stock.sizeName}</span>
      ),
    },
    {
      key: "quantityOnHand",
      label: "Quantity",
      render: (stock: ProductStockDto) => (
        <Badge variant="secondary" className="text-sm bg-primary/10 border-primary text-primary hover:bg-primary/10 hover:border-primary hover:text-primary">
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
      render: (stock: ProductStockDto) => (
        <span className="text-sm">${stock.priceIn.toFixed(2)}</span>
      ),
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
            const { bgClass } = getExpiryDateVariant(stock.expiryDate);
            return (
              <span className={`text-xs ${bgClass} text-foreground font-medium px-2 py-1 rounded inline-block`}>
                {formatExpiryDate(stock.expiryDate)}
              </span>
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
        <span className="text-sm text-muted-foreground">
          {stock.location || "---"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created Date",
      render: (stock: ProductStockDto) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(stock.createdAt)}
        </span>
      ),
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
