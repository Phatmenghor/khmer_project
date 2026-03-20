import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/action-button";
import {
  AllPaymentOptionResponseModel,
  PaymentOptionResponse,
} from "../store/models/response/payment-option-response";

interface PaymentOptionsTableHandlers {
  handleEditPaymentOption: (option: PaymentOptionResponse) => void;
  handleDeletePaymentOption: (option: PaymentOptionResponse) => void;
}

interface PaymentOptionsTableOptions {
  data: AllPaymentOptionResponseModel | null;
  handlers: PaymentOptionsTableHandlers;
}

export const paymentOptionsTableColumns = ({
  data,
  handlers,
}: PaymentOptionsTableOptions): TableColumn<PaymentOptionResponse>[] => {
  const { handleEditPaymentOption, handleDeletePaymentOption } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_option, index) => (
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
        <span
          className={`text-xs font-medium ${
            option?.status === "ACTIVE"
              ? "text-green-600"
              : "text-gray-500"
          }`}
        >
          {option?.status === "ACTIVE" ? "Active" : "Inactive"}
        </span>
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
