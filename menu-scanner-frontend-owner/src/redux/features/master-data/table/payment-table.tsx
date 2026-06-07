import { ActionButton } from "@/components/button/action-button";
import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import {
  AllPaymentResponseModel,
  PaymentResponseModel,
} from "../store/models/response/payment-response";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";

interface PaymentTableHandlers {
  handleEditPayment: (business: PaymentResponseModel) => void;
  handlePaymentViewDetail: (business: PaymentResponseModel) => void;
  handleDeletePayment: (business: PaymentResponseModel) => void;
}

interface PaymentTableOptions {
  data: AllPaymentResponseModel | null;
  handlers: PaymentTableHandlers;
}

export const paymentTableColumns = ({
  data,
  handlers,
}: PaymentTableOptions): TableColumn<PaymentResponseModel>[] => {
  const { handleEditPayment, handlePaymentViewDetail, handleDeletePayment } =
    handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="text-xs text-muted-foreground">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 10, index + 1)}
        </span>
      ),
    },
    {
      key: "formattedAmount",
      label: "Amount Dollar",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (payment) => (
        <span className="text-xs text-muted-foreground">
          {payment?.formattedAmount || "—"}
        </span>
      ),
    },
    {
      key: "formattedAmountKhr",
      label: "Amount KHR",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (payment) => (
        <span className="text-xs text-muted-foreground">
          {payment?.formattedAmountKhr || "—"}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (payment) => (
        <span className="text-xs text-muted-foreground">
          {payment?.paymentMethod || "—"}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (payment) => (
        <span className="text-xs text-muted-foreground">
          {payment?.status || "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (payment) => (
        <span className="text-xs text-muted-foreground">
          {dateTimeFormat(payment?.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (payment) => (
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="w-3 h-3" />}
            tooltip="View Details"
            onClick={() => handlePaymentViewDetail(payment)}
          />
          <ActionButton
            icon={<Edit className="w-3 h-3" />}
            tooltip="Edit Payment"
            onClick={() => handleEditPayment(payment)}
          />
          <ActionButton
            icon={<Trash className="w-3 h-3" />}
            tooltip="Delete Payment"
            onClick={() => handleDeletePayment(payment)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
