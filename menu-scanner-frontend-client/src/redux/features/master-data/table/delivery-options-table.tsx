import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";

import { ActionButton } from "@/components/shared/button/action-button";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import {
  AllDeliveryOptionsResponseModel,
  DeliveryOptionsResponseModel,
} from "../store/models/response/delivery-options-response";

interface DeliveryOptionsTableHandlers {
  handleEditDeliveryOptions: (delivery: DeliveryOptionsResponseModel) => void;
  handleDeliveryOptionsViewDetail: (
    delivery: DeliveryOptionsResponseModel
  ) => void;
  handleDeleteDeliveryOptions: (delivery: DeliveryOptionsResponseModel) => void;
}

interface DeliveryOptionsTableOptions {
  data: AllDeliveryOptionsResponseModel | null;
  handlers: DeliveryOptionsTableHandlers;
}

export const deliveryOptionsTableColumns = ({
  data,
  handlers,
}: DeliveryOptionsTableOptions): TableColumn<DeliveryOptionsResponseModel>[] => {
  const {
    handleEditDeliveryOptions,
    handleDeliveryOptionsViewDetail,
    handleDeleteDeliveryOptions,
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
      key: "imageUrl",
      label: "Delivery options Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (deliveryOptions) => {
        return (
          <CustomAvatar
            imageUrl={deliveryOptions.imageUrl}
            name={deliveryOptions?.name}
            size="md"
          />
        );
      },
    },
    {
      key: "name",
      label: "Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (deliveryOptions) => (
        <span className="text-xs text-muted-foreground">
          {deliveryOptions?.name || "---"}
        </span>
      ),
    },

    {
      key: "price",
      label: "Price",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (deliveryOptions) => (
        <span className="text-xs text-muted-foreground">
          {deliveryOptions?.price || "---"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (deliveryOptions) => (
        <span className="text-xs text-muted-foreground">
          {deliveryOptions?.status || "---"}
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
      render: (deliveryOptions) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleDeliveryOptionsViewDetail(deliveryOptions)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Delivery Options"
            onClick={() => handleEditDeliveryOptions(deliveryOptions)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Delivery Options"
            onClick={() => handleDeleteDeliveryOptions(deliveryOptions)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
