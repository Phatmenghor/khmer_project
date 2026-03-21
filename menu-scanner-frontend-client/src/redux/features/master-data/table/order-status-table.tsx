import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import {
  AllOrderStatusResponseModel,
  OrderStatusResponseModel,
} from "../store/models/response/order-status-response";

interface OrderStatusTableHandlers {
  handleEditOrderStatus: (orderStatus: OrderStatusResponseModel) => void;
  handleOrderStatusViewDetail: (orderStatus: OrderStatusResponseModel) => void;
  handleDeleteOrderStatus: (orderStatus: OrderStatusResponseModel) => void;
}

interface OrderStatusTableOptions {
  data: AllOrderStatusResponseModel | null;
  handlers: OrderStatusTableHandlers;
}

export const orderStatusTableColumns = ({
  data,
  handlers,
}: OrderStatusTableOptions): TableColumn<OrderStatusResponseModel>[] => {
  const {
    handleEditOrderStatus,
    handleOrderStatusViewDetail,
    handleDeleteOrderStatus,
  } = handlers;

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
      key: "name",
      label: "Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (orderStatus) => (
        <span className="text-xs text-muted-foreground">
          {orderStatus?.name || "---"}
        </span>
      ),
    },

    {
      key: "description",
      label: "Description",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (orderStatus) => (
        <span className="text-xs text-muted-foreground">
          {orderStatus?.description || "---"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (orderStatus) => (
        <span className="text-xs text-muted-foreground">
          {orderStatus?.status || "---"}
        </span>
      ),
    },

    {
      key: "order",
      label: "Sort Order",
      minWidth: "10px",
      maxWidth: "100px",
      render: (orderStatus) => (
        <span className="text-xs font-semibold text-primary">
          {orderStatus?.order || "---"}
        </span>
      ),
    },

    {
      key: "isInitial",
      label: "Initial",
      minWidth: "10px",
      maxWidth: "400px",
      render: (orderStatus) => (
        <span className="text-xs">
          {orderStatus?.isInitial ? (
            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">
              ⭐ Initial
            </span>
          ) : (
            <span className="text-muted-foreground">---</span>
          )}
        </span>
      ),
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (deliveryOptions) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(deliveryOptions?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (orderStatus) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleOrderStatusViewDetail(orderStatus)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Order Status"
            onClick={() => handleEditOrderStatus(orderStatus)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Order Status"
            onClick={() => handleDeleteOrderStatus(orderStatus)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
