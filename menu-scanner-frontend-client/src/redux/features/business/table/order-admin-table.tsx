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
        <span className="text-xs font-mono font-medium">
          {order?.orderNumber || "---"}
        </span>
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
          <span className="text-xs">{order?.customerName || "---"}</span>
          <span className="text-xs text-muted-foreground">
            {order?.customerPhone || ""}
          </span>
        </div>
      ),
    },
    {
      key: "totalItems",
      label: "Items",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <span className="text-xs text-muted-foreground">
          {order?.pricing?.totalItems || 0}
        </span>
      ),
    },
    {
      key: "finalTotal",
      label: "Total",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <span className="text-xs font-medium">
          {formatCurrency(order?.pricing?.finalTotal || 0)}
        </span>
      ),
    },
    {
      key: "orderStatus",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <Badge variant={getStatusVariant(order?.orderStatus)}>
          {getOrderStatusLabel(order?.orderStatus)}
        </Badge>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      minWidth: "10px",
      maxWidth: "400px",
      render: (order) => (
        <Badge variant={getPaymentVariant(order?.payment?.paymentStatus)}>
          {order?.payment?.paymentStatus || "---"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
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
