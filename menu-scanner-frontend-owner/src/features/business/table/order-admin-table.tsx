import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash, Download } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/custom-button";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { AllOrderResponseModel } from "../store/models/response/order-admin-response";
import { getOrderStatusLabel, ORDER_STATUS_BADGE_CONFIG } from "@/enums/order-status.enum";
import { formatCurrency } from "@/utils/common/currency-format";
import { Badge } from "@/components/ui/badge";

interface OrderTableHandlers {
  handleViewOrder: (order: OrderResponse) => void;
  handleEditOrder: (order: OrderResponse) => void;
  handleDeleteOrder: (order: OrderResponse) => void;
  handleDownloadReceipt: (order: OrderResponse) => void;
}

interface OrderTableOptions {
  data: AllOrderResponseModel | null;
  handlers: OrderTableHandlers;
  downloadingOrderId?: string | null;
  hideDelivery?: boolean;
  hidePayment?: boolean;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "COMPLETED":
    case "READY":
      return "default";
    case "CANCELLED":
    case "FAILED":
      return "destructive";
    case "PENDING":
    case "PREPARING":
      return "secondary";
    default:
      return "outline";
  }
};

const getPaymentVariant = (status: string) => {
  switch (status) {
    case "PAID":
      return "default";
    case "UNPAID":
      return "secondary";
    case "REFUNDED":
      return "destructive";
    default:
      return "outline";
  }
};


export const orderAdminTableColumns = ({
  data,
  handlers,
  downloadingOrderId,
  hideDelivery = false,
  hidePayment = false,
}: OrderTableOptions): TableColumn<OrderResponse>[] => {
  const { handleViewOrder, handleEditOrder, handleDeleteOrder, handleDownloadReceipt } = handlers;

  const cols: TableColumn<OrderResponse>[] = [
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
      key: "orderNumber",
      label: "Order #",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <span className="text-xs font-mono font-medium">
          {order?.orderNumber || "---"}
        </span>
      ),
    },
    {
      key: "source",
      label: "Type",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => {
        const name = order?.customerName || "";
        const phone = order?.customerPhone || "";
        const note = order?.customerNote || "";
        const isTable = phone === "Table Service" || name.startsWith("Table ") || note.includes("[Table ");

        if (isTable) {
          return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              🪑 TABLE
            </span>
          );
        }

        if (order?.source === "POS" || (order as any)?.orderFrom === "BUSINESS") {
          return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              🖥️ POS
            </span>
          );
        }

        if (order?.customerId) {
          return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
              👤 CUSTOMER
            </span>
          );
        }

        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            🛵 GUEST
          </span>
        );
      },
    },
    {
      key: "customerName",
      label: "Customer / Table",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (order) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium">{order?.customerName || "Walk-in"}</span>
          <span className="text-xs text-muted-foreground">
            {order?.customerPhone || "No phone"}
          </span>
        </div>
      ),
    },
    {
      key: "items",
      label: "Items",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <span className="text-xs font-medium">
          {order?.items?.length || 0}
        </span>
      ),
    },
    {
      key: "finalTotal",
      label: "Total",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-green-600">
            {formatCurrency(order?.pricing?.finalTotal ?? 0)}
          </span>
        </div>
      ),
    },
    {
      key: "orderStatus",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => {
        const textClass = ORDER_STATUS_BADGE_CONFIG[order?.orderStatus]?.text || "text-gray-600";
        return (
          <span className={`text-xs ${textClass} font-medium`}>
            {getOrderStatusLabel(order?.orderStatus)}
          </span>
        );
      },
    },
  ];

  if (!hidePayment) {
    cols.push({
      key: "paymentStatus",
      label: "Payment",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => {
        const getPaymentColor = (status: string) => {
          switch (status) {
            case "PAID":
              return "text-green-600 font-medium";
            case "UNPAID":
              return "text-orange-600 font-medium";
            case "REFUNDED":
              return "text-red-600 font-medium";
            default:
              return "text-gray-600 font-medium";
          }
        };
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium">
              {order?.payment?.paymentMethod || "---"}
            </span>
            <span className={`text-xs ${getPaymentColor(order?.payment?.paymentStatus)}`}>
              {order?.payment?.paymentStatus || "---"}
            </span>
          </div>
        );
      },
    });
  }

  if (!hideDelivery) {
    cols.push({
      key: "deliveryOption",
      label: "Delivery",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <span className="text-xs font-medium">
          {order?.deliveryOption?.name || "---"}
        </span>
      ),
    });
  }

  cols.push(
    {
      key: "createdAt",
      label: "Created",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(order?.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="w-3 h-3" />}
            tooltip="View Details"
            onClick={() => handleViewOrder(order)}
          />
          <ActionButton
            icon={<Download className="w-3 h-3" />}
            tooltip="Download Receipt"
            onClick={() => handleDownloadReceipt(order)}
            disabled={downloadingOrderId === order.id}
            loading={downloadingOrderId === order.id}
          />
          <ActionButton
            icon={<Edit className="w-3 h-3" />}
            tooltip="Edit Order"
            onClick={() => handleEditOrder(order)}
          />
          <ActionButton
            icon={<Trash className="w-3 h-3" />}
            tooltip="Delete Order"
            onClick={() => handleDeleteOrder(order)}
            variant="destructive"
          />
        </div>
      ),
    }
  );

  return cols;
};
