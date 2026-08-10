import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { ActionButton } from "@/components/shared/button/custom-button";
import { Switch } from "@/components/ui/switch";
import { TableImage } from "@/components/shared/table/table-image";
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
  handleToggleDeliveryOptionsStatus: (delivery: DeliveryOptionsResponseModel) => void;
}

interface DeliveryOptionsTableOptions {
  data: AllDeliveryOptionsResponseModel | null;
  handlers: DeliveryOptionsTableHandlers;
}

const isStorePickup = (name?: string) => {
  if (!name) return false;
  const n = name.trim().toLowerCase();
  return n === "store pickup" || n === "pickup";
};

export const deliveryOptionsTableColumns = ({
  data,
  handlers,
}: DeliveryOptionsTableOptions): TableColumn<DeliveryOptionsResponseModel>[] => {
  const {
    handleEditDeliveryOptions,
    handleDeliveryOptionsViewDetail,
    handleDeleteDeliveryOptions,
    handleToggleDeliveryOptionsStatus,
  } = handlers;

  return [
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
      key: "image",
      label: "Delivery options Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (deliveryOptions) => {
        return (
          <TableImage
            src={deliveryOptions.image?.sm}
            previewSrc={deliveryOptions.image?.o}
            alt={deliveryOptions?.name}
            fallbackText={deliveryOptions?.name || "D"}
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
      render: (deliveryOptions) => {
        const isPickup = isStorePickup(deliveryOptions?.name);
        return (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">
              {deliveryOptions?.name || "---"}
            </span>
            {isPickup && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                Default
              </span>
            )}
          </div>
        );
      },
    },

    {
      key: "price",
      label: "Price",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (deliveryOptions) => (
        <span className="text-xs text-muted-foreground">
          {deliveryOptions?.price != null ? `$${Number(deliveryOptions.price).toFixed(2)}` : "---"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (deliveryOptions) => {
        const isPickup = isStorePickup(deliveryOptions?.name);
        return (
          <div className="flex items-center gap-1.5">
            {!isPickup && (
              <Switch
                checked={deliveryOptions?.status === "ACTIVE"}
                onCheckedChange={() => handleToggleDeliveryOptionsStatus(deliveryOptions)}
              />
            )}
            <span className="text-xs font-medium text-muted-foreground">
              {deliveryOptions?.status ? formatEnumValue(deliveryOptions.status) : "---"}
            </span>
          </div>
        );
      },
    },

    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (deliveryOptions) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(deliveryOptions?.createdAt)}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (deliveryOptions) => {
        const isPickup = isStorePickup(deliveryOptions?.name);
        return (
          <div className="flex items-center gap-1">
            <ActionButton
              icon={<Eye className="w-3 h-3" />}
              tooltip="View Details"
              onClick={() => handleDeliveryOptionsViewDetail(deliveryOptions)}
            />
            <ActionButton
              icon={<Edit className="w-3 h-3" />}
              tooltip="Edit Delivery Options"
              onClick={() => handleEditDeliveryOptions(deliveryOptions)}
            />
            {!isPickup && (
              <ActionButton
                icon={<Trash className="w-3 h-3" />}
                tooltip="Delete Delivery Options"
                onClick={() => handleDeleteDeliveryOptions(deliveryOptions)}
                variant="destructive"
              />
            )}
          </div>
        );
      },
    },
  ];
};
