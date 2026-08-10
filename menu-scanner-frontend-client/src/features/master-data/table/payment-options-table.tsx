import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import { ActionButton } from "@/components/shared/button/custom-button";
import { Switch } from "@/components/ui/switch";
import { TableImage } from "@/components/shared/table/table-image";
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

const isCashOption = (name?: string, type?: string) => {
  if (type === "CASH") return true;
  if (!name) return false;
  return name.trim().toLowerCase() === "cash";
};

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
        <span className="text-xs text-muted-foreground">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 15, index + 1)}
        </span>
      ),
    },
    {
      key: "image",
      label: "Image",
      minWidth: "10px",
      maxWidth: "400px",
      render: (option) => {
        return (
          <TableImage
            src={option.image?.sm}
            previewSrc={option.image?.o}
            alt={option?.name}
            fallbackText={option?.name || "P"}
          />
        );
      },
    },
    {
      key: "name",
      label: "Payment Method",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (option) => {
        const isCash = isCashOption(option?.name, option?.paymentOptionType);
        return (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">
              {option?.name || "---"}
            </span>
            {isCash && (
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                Default
              </span>
            )}
          </div>
        );
      },
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
      render: (option) => {
        const isCash = isCashOption(option?.name, option?.paymentOptionType);
        return (
          <div className="flex items-center gap-1.5">
            {!isCash && (
              <Switch
                checked={option?.status === "ACTIVE"}
                onCheckedChange={() => handleTogglePaymentOptionStatus(option)}
              />
            )}
            <span className="text-xs font-medium text-muted-foreground">
              {option?.status ? formatEnumValue(option.status) : "---"}
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
      render: (option) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(option?.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (option) => {
        const isCash = isCashOption(option?.name, option?.paymentOptionType);
        return (
          <div className="flex items-center gap-1">
            <ActionButton
              icon={<Eye className="w-3 h-3" />}
              tooltip="View Details"
              onClick={() => handleViewPaymentOption(option)}
            />
            <ActionButton
              icon={<Edit className="w-3 h-3" />}
              tooltip="Edit Payment Option"
              onClick={() => handleEditPaymentOption(option)}
            />
            {!isCash && (
              <ActionButton
                icon={<Trash className="w-3 h-3" />}
                tooltip="Delete Payment Option"
                onClick={() => handleDeletePaymentOption(option)}
                variant="destructive"
              />
            )}
          </div>
        );
      },
    },
  ];
};
