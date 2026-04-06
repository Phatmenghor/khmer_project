import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import { OrderResponse } from "@/redux/features/main/store/models/response/order-response";
import { AllOrderResponseModel } from "../store/models/response/order-admin-response";
import { getOrderStatusLabel } from "@/enums/order-status.enum";
import { formatCurrency } from "@/utils/common/currency-format";
import { Badge } from "@/components/ui/badge";

interface OrderTableHandlers {
  handleViewOrder: (order: OrderResponse) => void;
  handleEditOrder: (order: OrderResponse) => void;
  handleDeleteOrder: (order: OrderResponse) => void;
}

interface OrderTableOptions {
  data: AllOrderResponseModel | null;
  handlers: OrderTableHandlers;
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
    case "PENDING":
      return "secondary";
    case "REFUNDED":
      return "destructive";
    default:
      return "outline";
  }
};

const getOrderFromVariant = (orderFrom: string) => {
  switch (orderFrom) {
    case "CUSTOMER":
      return "outline";
    case "BUSINESS":
      return "secondary";
    default:
      return "outline";
  }
};

export const orderAdminTableColumns = ({
  data,
  handlers,
}: OrderTableOptions): TableColumn<OrderResponse>[] => {
  const { handleViewOrder, handleEditOrder, handleDeleteOrder } = handlers;

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
      key: "orderNumber",
      label: "Order #",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <div className="flex flex-col">
          <span className="text-xs font-mono font-medium">
            {order?.orderNumber || "---"}
          </span>
          <span className="text-xs text-muted-foreground">
            {order?.orderFrom === "CUSTOMER" ? "🛒 Public" : "🏪 POS"}
          </span>
        </div>
      ),
    },
    {
      key: "customerName",
      label: "Customer",
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
      key: "businessName",
      label: "Business",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (order) => (
        <span className="text-xs font-medium">
          {order?.businessName || "---"}
        </span>
      ),
    },
    {
      key: "items",
      label: "Items",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded">
          {order?.items?.length || 0} items
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
            {formatCurrency(
              order?.pricing?.after?.finalTotal ?? order?.pricing?.before?.finalTotal ?? 0
            )}
          </span>
          {order?.pricing?.hadOrderLevelChangeFromPOS && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(order?.pricing?.before?.finalTotal ?? 0)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "orderStatus",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case "COMPLETED":
            case "READY":
              return "text-green-600 font-medium";
            case "CANCELLED":
            case "FAILED":
              return "text-red-600 font-medium";
            case "PENDING":
            case "PREPARING":
              return "text-blue-600 font-medium";
            default:
              return "text-gray-600 font-medium";
          }
        };
        return (
          <span className={`text-xs ${getStatusColor(order?.orderStatus)}`}>
            {getOrderStatusLabel(order?.orderStatus)}
          </span>
        );
      },
    },
    {
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
            case "PENDING":
              return "text-orange-600 font-medium";
            case "REFUNDED":
              return "text-red-600 font-medium";
            default:
              return "text-gray-600 font-medium";
          }
        };
        return (
          <span className={`text-xs ${getPaymentColor(order?.payment?.paymentStatus)}`}>
            {order?.payment?.paymentStatus || "---"}
          </span>
        );
      },
    },
    {
      key: "deliveryOption",
      label: "Delivery",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <span className="text-xs font-medium">
          {order?.deliveryOption?.name || "---"}
        </span>
      ),
    },
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
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleViewOrder(order)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Order"
            onClick={() => handleEditOrder(order)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Order"
            onClick={() => handleDeleteOrder(order)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
