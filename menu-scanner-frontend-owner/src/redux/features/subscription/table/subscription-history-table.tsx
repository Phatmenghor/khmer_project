import { ActionButton } from "@/components/button/action-button";
import { Badge } from "@/components/ui/badge";
import { indexDisplay } from "@/utils/common/common";
import { Eye } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import {
  AllSubscriptionHistoryResponseModel,
  SubscriptionHistoryResponseModel,
} from "../store/models/response/subscription-history-response";

interface SubscriptionHistoryTableHandlers {
  handleViewDetail: (row: SubscriptionHistoryResponseModel) => void;
}

interface SubscriptionHistoryTableOptions {
  data: AllSubscriptionHistoryResponseModel | null;
  handlers: SubscriptionHistoryTableHandlers;
}

function statusBadge(status: string) {
  const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
    ACTIVE: "default",
    EXPIRED: "destructive",
  };
  return (
    <Badge variant={variants[status] ?? "secondary"} className="text-xs">
      {status}
    </Badge>
  );
}

function paymentStatusBadge(status: string) {
  const colors: Record<string, string> = {
    PAID: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    UNPAID: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    PARTIALLY_PAID: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? colors.UNPAID}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export const subscriptionHistoryTableColumns = ({
  data,
  handlers,
}: SubscriptionHistoryTableOptions): TableColumn<SubscriptionHistoryResponseModel>[] => {
  const { handleViewDetail } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "60px",
      render: (_, index) => (
        <span className="font-medium text-xs">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 10, index + 1)}
        </span>
      ),
    },
    {
      key: "businessName",
      label: "Business",
      minWidth: "120px",
      maxWidth: "200px",
      truncate: true,
      render: (row) => (
        <span className="text-xs font-medium">{row.businessName || "---"}</span>
      ),
    },
    {
      key: "planName",
      label: "Plan",
      minWidth: "100px",
      maxWidth: "160px",
      truncate: true,
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium">{row.planName || "---"}</span>
          <span className="text-xs text-muted-foreground">{row.planDurationType}</span>
        </div>
      ),
    },
    {
      key: "planPrice",
      label: "Price",
      minWidth: "80px",
      maxWidth: "120px",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          ${row.planPrice?.toFixed(2) ?? "0.00"}
        </span>
      ),
    },
    {
      key: "startDate",
      label: "Start Date",
      minWidth: "100px",
      maxWidth: "140px",
      render: (row) => (
        <span className="text-xs text-muted-foreground">{row.startDate || "---"}</span>
      ),
    },
    {
      key: "endDate",
      label: "End Date",
      minWidth: "100px",
      maxWidth: "140px",
      render: (row) => (
        <span className="text-xs text-muted-foreground">{row.endDate || "---"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      minWidth: "80px",
      maxWidth: "120px",
      render: (row) => statusBadge(row.status),
    },
    {
      key: "daysRemaining",
      label: "Days Left",
      minWidth: "80px",
      maxWidth: "100px",
      render: (row) => (
        <span className={`text-xs font-medium ${row.daysRemaining > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
          {row.status === "EXPIRED" ? "—" : `${row.daysRemaining}d`}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      minWidth: "100px",
      maxWidth: "140px",
      render: (row) => paymentStatusBadge(row.paymentStatus),
    },
    {
      key: "totalPaid",
      label: "Total Paid",
      minWidth: "90px",
      maxWidth: "120px",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          ${row.totalPaid?.toFixed(2) ?? "0.00"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "60px",
      maxWidth: "80px",
      render: (row) => (
        <ActionButton
          icon={<Eye className="w-4 h-4" />}
          tooltip="View Detail"
          onClick={() => handleViewDetail(row)}
        />
      ),
    },
  ];
};
