import React from "react";
import { TableColumn } from "@/components/shared/common/data-table";
import { ActionButton } from "@/components/shared/button/custom-button";
import { formatCurrency } from "@/utils/common/currency-format";
import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { TableSessionItem } from "@/features/business/store/models/type/table-session-type";
import { Eye, Trash2, CheckCircle2, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TablePendingOrderRow {
  id: string;
  sessionId?: string;
  tableNumber: string;
  sessionNumber: string;
  round: number;
  items: TableSessionItem[];
  roundItemsCount: number;
  roundTotal: number;
  status: string;
  startedAt: string;
}

export interface TableSessionTableHandlers {
  handleViewSession: (row: TablePendingOrderRow) => void;
  handleDeleteSession: (row: TablePendingOrderRow) => void;
  handleApproveSession?: (row: TablePendingOrderRow) => void;
  handleSettleSession?: (row: TablePendingOrderRow) => void;
}

export interface TableSessionTableOptions {
  currentPage: number;
  pageSize: number;
  handlers: TableSessionTableHandlers;
}

export const getStatusBadgeStyle = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "text-amber-600 dark:text-amber-400 font-bold";
    case "ACTIVE":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
    case "CLOSED":
      return "bg-muted text-muted-foreground border border-border/60";
    case "CANCELLED":
      return "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border border-border/60";
  }
};

export const tableSessionColumns = ({
  currentPage,
  pageSize,
  handlers,
}: TableSessionTableOptions): TableColumn<TablePendingOrderRow>[] => {
  const { handleViewSession, handleDeleteSession, handleApproveSession, handleSettleSession } = handlers;

  return [
    {
      key: "index",
      label: "#",
      width: "60px",
      render: (_, index) => (
        <span className="font-bold text-xs text-muted-foreground">
          {indexDisplay(currentPage, pageSize, index + 1)}
        </span>
      ),
    },
    {
      key: "tableNumber",
      label: "Table",
      width: "120px",
      render: (row) => (
        <span className="font-bold text-xs text-foreground">
          {row.tableNumber?.startsWith("Table ") ? row.tableNumber : `Table ${row.tableNumber}`}
        </span>
      ),
    },
    {
      key: "round",
      label: "Order Round",
      width: "120px",
      render: (row) => (
        <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-primary/10 text-primary border border-primary/20">
          Round {row.round}
        </span>
      ),
    },
    {
      key: "sessionNumber",
      label: "Session #",
      width: "190px",
      render: (row) => {
        const formattedSessionNum = row.sessionNumber?.replace(/^(SESS-?|Session\s*)/i, "") || "";
        return (
          <span className="font-mono text-xs font-semibold text-foreground">
            {formattedSessionNum}
          </span>
        );
      },
    },
    {
      key: "roundItemsCount",
      label: "Round Items",
      width: "120px",
      render: (row) => (
        <span className="text-xs text-foreground font-semibold">
          {row.roundItemsCount || 0} {(row.roundItemsCount || 0) === 1 ? "item" : "items"}
        </span>
      ),
    },
    {
      key: "roundTotal",
      label: "Round Subtotal",
      width: "130px",
      render: (row) => (
        <span className="font-extrabold text-xs text-primary">
          {formatCurrency(row.roundTotal || 0)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "130px",
      render: (row) => (
        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider", getStatusBadgeStyle(row.status))}>
          {row.status}
        </span>
      ),
    },
    {
      key: "startedAt",
      label: "Date / Time",
      width: "160px",
      render: (row) => (
        <span className="text-xs text-muted-foreground font-mono">
          {dateTimeFormat(row.startedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "120px",
      isPinnedRight: true,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status === "PENDING" && handleApproveSession && (
            <ActionButton
              icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              tooltip="Approve Table Order Round"
              onClick={() => handleApproveSession(row)}
            />
          )}
          {handleSettleSession && (
            <ActionButton
              icon={<Receipt className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
              tooltip="Final Checkout / Settle Bill"
              onClick={() => handleSettleSession(row)}
            />
          )}
          <ActionButton
            icon={<Eye className="w-3.5 h-3.5 text-foreground" />}
            tooltip="View Table Session Details"
            onClick={() => handleViewSession(row)}
          />
          <ActionButton
            icon={<Trash2 className="w-3.5 h-3.5 text-destructive" />}
            tooltip="Delete Table Session"
            onClick={() => handleDeleteSession(row)}
          />
        </div>
      ),
    },
  ];
};
