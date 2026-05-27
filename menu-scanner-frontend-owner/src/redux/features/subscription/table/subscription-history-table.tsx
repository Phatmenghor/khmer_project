import { ActionButton } from "@/components/button/action-button";
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
        <span className="text-xs text-muted-foreground">{row.planName || "---"}</span>
      ),
    },
    {
      key: "planDurationType",
      label: "Duration",
      minWidth: "80px",
      maxWidth: "120px",
      render: (row) => (
        <span className="text-xs text-muted-foreground">{row.planDurationType || "---"}</span>
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
      render: (row) => (
        <span className="text-xs text-muted-foreground">{row.status || "---"}</span>
      ),
    },
    {
      key: "daysRemaining",
      label: "Days Left",
      minWidth: "80px",
      maxWidth: "100px",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.status === "EXPIRED" ? "—" : `${row.daysRemaining}d`}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment",
      minWidth: "100px",
      maxWidth: "140px",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.paymentStatus?.replace("_", " ") || "---"}
        </span>
      ),
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
