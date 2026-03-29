import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { ActionButton } from "@/components/shared/button/action-button";
import { Switch } from "@/components/ui/switch";
import {
  AllPaymentOptionResponseModel,
  PaymentOptionResponse,
} from "../store/models/response/payment-option-response";

interface PaymentOptionsTableHandlers {
  handleViewPaymentOption: (option: PaymentOptionResponse) => void;
  handleEditPaymentOption: (option: PaymentOptionResponse) => void;
  handleDeletePaymentOption: (option: PaymentOptionResponse) => void;
  handleTogglePaymentOptionStatus: (option: PaymentOptionResponse) => void;
}

interface PaymentOptionsTableOptions {
  data: AllPaymentOptionResponseModel | null;
  handlers: PaymentOptionsTableHandlers;
}

export const paymentOptionsTableColumns = ({
  data,
  handlers,
}: PaymentOptionsTableOptions): TableColumn<PaymentOptionResponse>[] => {
  const { handleViewPaymentOption, handleEditPaymentOption, handleDeletePaymentOption, handleTogglePaymentOptionStatus } = handlers;

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
      label: "Payment Method",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (option) => (
        <span className="text-xs text-muted-foreground">
          {option?.name || "---"}
        </span>
      ),
    },
    {
      key: "paymentOptionType",
      label: "Type",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (option) => {
        const type = option?.paymentOptionType || "";
        const typeLabel = type
          .split("_")
          .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
          .join(" ");
        return (
          <span className="text-xs text-muted-foreground">{typeLabel}</span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (option) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={option?.status === "ACTIVE"}
            onCheckedChange={() => handleTogglePaymentOptionStatus(option)}
          />
          <span className="text-xs text-muted-foreground">
            {option?.status ? formatEnumValue(option.status) : "---"}
          </span>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (option) => (
        <span className="text-sm text-muted-foreground">
          {dateTimeFormat(option?.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (option) => (
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            tooltip="View Details"
            onClick={() => handleViewPaymentOption(option)}
          />
          <ActionButton
            icon={<Edit className="w-4 h-4" />}
            tooltip="Edit Payment Option"
            onClick={() => handleEditPaymentOption(option)}
          />
          <ActionButton
            icon={<Trash className="w-4 h-4" />}
            tooltip="Delete Payment Option"
            onClick={() => handleDeletePaymentOption(option)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
