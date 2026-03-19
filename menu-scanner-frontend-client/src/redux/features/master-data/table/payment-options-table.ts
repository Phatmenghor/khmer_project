import { ColumnDef } from "@tanstack/react-table";
import { PaymentOptionResponse } from "../store/models/response/payment-option-response";
import { Edit2, Trash2 } from "lucide-react";
import { DataTableRowActions } from "@/components/shared/common/data-table-row-actions";
import { Badge } from "@/components/ui/badge";

interface PaymentOptionsTableProps {
  data: PaymentOptionResponse[];
  handlers: {
    handleEditPaymentOption: (option: PaymentOptionResponse) => void;
    handleDeletePaymentOption: (option: PaymentOptionResponse) => void;
  };
}

export const paymentOptionsTableColumns = (
  props: PaymentOptionsTableProps
): ColumnDef<PaymentOptionResponse>[] => {
  const { handlers } = props;

  return [
    {
      accessorKey: "name",
      header: "Payment Method",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        return (
          <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
            {status === "ACTIVE" ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div className="text-xs text-muted-foreground">
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const option = row.original;
        return (
          <DataTableRowActions
            actions={[
              {
                label: "Edit",
                icon: Edit2,
                onClick: () => handlers.handleEditPaymentOption(option),
              },
              {
                label: "Delete",
                icon: Trash2,
                onClick: () => handlers.handleDeletePaymentOption(option),
                className: "text-destructive hover:bg-destructive/10",
              },
            ]}
          />
        );
      },
    },
  ];
};
