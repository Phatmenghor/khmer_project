import { ActionButton } from "@/components/button/action-button";
import { indexDisplay } from "@/utils/common/common";
import { formatDate } from "@/utils/date/date-time-format";
import { formatEnumLabel } from "@/utils/common/enum-convert";
import { Eye, ShieldCheck, ShieldAlert } from "lucide-react";
import { TableColumn } from "@/components/shared/common/data-table";
import { TableImage } from "@/components/shared/table/table-image";
import { SubscriptionConfig } from "@/constants/app-resource/default/default";
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
      minWidth: "40px",
      maxWidth: "60px",
      render: (_, index) => (
        <span className="text-xs text-muted-foreground">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 10, index + 1)}
        </span>
      ),
    },
    {
      key: "businessName",
      label: "Business",
      minWidth: "160px",
      maxWidth: "240px",
      truncate: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <TableImage
            src={row.logoBusinessUrl}
            alt={row.businessName}
            className="h-10 w-10 rounded-[10px]"
            fallbackText={row.businessName}
          />
          <span className="text-xs font-bold text-foreground truncate">
            {row.businessName || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "planName",
      label: "Plan",
      minWidth: "100px",
      maxWidth: "160px",
      truncate: true,
      render: (row) => (
        <span className="text-xs font-semibold text-foreground">{row.planName || "—"}</span>
      ),
    },
    {
      key: "planDurationType",
      label: "Duration",
      minWidth: "90px",
      maxWidth: "120px",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {formatEnumLabel(row.planDurationType) || "—"}
        </span>
      ),
    },
    {
      key: "planPrice",
      label: "Price",
      minWidth: "80px",
      maxWidth: "110px",
      render: (row) => (
        <span className="text-xs font-semibold text-foreground tabular-nums">
          ${row.planPrice?.toFixed(2) ?? "0.00"}
        </span>
      ),
    },
    {
      key: "startDate",
      label: "Start Date",
      minWidth: "100px",
      maxWidth: "130px",
      render: (row) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.startDate)}</span>
      ),
    },
    {
      key: "endDate",
      label: "End Date",
      minWidth: "100px",
      maxWidth: "130px",
      render: (row) => (
        <span className="text-xs text-muted-foreground">{formatDate(row.endDate)}</span>
      ),
    },
    {
      key: "autoRenew",
      label: "Auto Renew",
      minWidth: "90px",
      maxWidth: "120px",
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${
            row.autoRenew ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
          }`}
        >
          {row.autoRenew ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Enabled
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground" />
              Disabled
            </>
          )}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      minWidth: "100px",
      maxWidth: "130px",
      render: (row) => {
        const status = row.status?.toUpperCase();
        const textStyle =
          status === "ACTIVE"
            ? "text-emerald-600 dark:text-emerald-400"
            : status === "CANCELLED"
            ? "text-amber-600 dark:text-amber-400"
            : status === "CHANGE_PLAN"
            ? "text-blue-600 dark:text-blue-400"
            : "text-rose-600 dark:text-rose-400";

        return (
          <span className={`text-xs font-bold ${textStyle}`}>
            {formatEnumLabel(row.status) || "—"}
          </span>
        );
      },
    },
    {
      key: "daysRemaining",
      label: "Days Left",
      minWidth: "85px",
      maxWidth: "110px",
      render: (row) => {
        if (row.status === "EXPIRED" || row.status === "CANCELLED") {
          return <span className="text-xs text-muted-foreground">—</span>;
        }
        const days = row.daysRemaining ?? 0;
        const textStyle =
          days <= SubscriptionConfig.EXPIRY_CRITICAL_DAYS
            ? "text-rose-600 dark:text-rose-400 font-bold"
            : days <= SubscriptionConfig.EXPIRY_WARNING_DAYS
            ? "text-amber-600 dark:text-amber-400 font-bold"
            : "text-emerald-600 dark:text-emerald-400 font-bold";

        return <span className={`text-xs ${textStyle}`}>{days}d</span>;
      },
    },
    {
      key: "paymentStatus",
      label: "Payment",
      minWidth: "110px",
      maxWidth: "140px",
      render: (row) => {
        const paymentStatus = row.paymentStatus?.toUpperCase();
        const textStyle =
          paymentStatus === "PAID" || paymentStatus === "COMPLETED"
            ? "text-emerald-600 dark:text-emerald-400"
            : paymentStatus === "PENDING" || paymentStatus === "PARTIALLY_PAID"
            ? "text-amber-600 dark:text-amber-400"
            : "text-rose-600 dark:text-rose-400";

        return (
          <span className={`text-xs font-bold ${textStyle}`}>
            {formatEnumLabel(row.paymentStatus) || "—"}
          </span>
        );
      },
    },
    {
      key: "totalPaid",
      label: "Total Paid",
      minWidth: "90px",
      maxWidth: "120px",
      render: (row) => (
        <span className="text-xs font-semibold text-foreground tabular-nums">
          ${row.totalPaid?.toFixed(2) ?? "0.00"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "60px",
      maxWidth: "80px",
      isPinnedRight: true,
      render: (row) => (
        <ActionButton
          icon={<Eye className="w-3.5 h-3.5" />}
          tooltip="View Subscription Detail"
          onClick={() => handleViewDetail(row)}
        />
      ),
    },
  ];
};
