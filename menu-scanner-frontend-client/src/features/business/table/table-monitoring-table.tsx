import React from "react";
import { TableColumn } from "@/components/shared/common/data-table";
import { CustomButton, ActionButton } from "@/components/shared/button/custom-button";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { formatCurrency } from "@/utils/common/currency-format";
import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import {
  TableMonitoringItem,
  TableMonitoringStatus,
} from "@/features/business/store/models/type/table-monitoring-type";
import {
  CreditCard,
  Eye,
  Check,
  Download,
  UserCheck,
  QrCode,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { getCustomTableQr } from "@/utils/table/table-qr-storage";
import { ALL_TABLE_STATUS_OPTIONS } from "@/constants/status/status";

export interface TableMonitoringTableHandlers {
  handleStatusChange: (table: TableMonitoringItem, newStatus: TableMonitoringStatus) => void;
  handlePayBill: (table: TableMonitoringItem) => void;
  handleDownloadReceipt: (table: TableMonitoringItem) => void;
  handleClearTable: (table: TableMonitoringItem) => void;
  handleViewDetails: (table: TableMonitoringItem) => void;
  handleOpenQrModal?: (table: TableMonitoringItem) => void;
  handleDeleteTable?: (table: TableMonitoringItem) => void;
}

export interface TableMonitoringTableOptions {
  currentPage: number;
  pageSize: number;
  handlers: TableMonitoringTableHandlers;
}

export const tableMonitoringColumns = ({
  currentPage,
  pageSize,
  handlers,
}: TableMonitoringTableOptions): TableColumn<TableMonitoringItem>[] => {
  const {
    handleStatusChange,
    handlePayBill,
    handleDownloadReceipt,
    handleClearTable,
    handleViewDetails,
    handleOpenQrModal,
    handleDeleteTable,
  } = handlers;

  return [
    {
      key: "index",
      label: "#",
      width: "55px",
      render: (_, index) => (
        <span className="font-bold text-xs text-muted-foreground">
          {indexDisplay(currentPage, pageSize, index + 1)}
        </span>
      ),
    },
    {
      key: "number",
      label: "Table Code",
      width: "120px",
      render: (table) => {
        const hasCustomQr = Boolean(getCustomTableQr(table.number) || getCustomTableQr(table.id));
        const cleanNum = table.number?.startsWith("Table ") ? table.number.replace("Table ", "") : table.number;
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs text-foreground">
              Table {cleanNum}
            </span>
            {hasCustomQr && (
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                title="Custom Designed QR Saved"
              >
                QR
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "zone",
      label: "Shop Zone",
      width: "130px",
      render: (table) => (
        <span className="text-xs text-muted-foreground font-medium">
          {table.zone || "Main Hall"}
        </span>
      ),
    },
    {
      key: "capacity",
      label: "Capacity",
      width: "100px",
      render: (table) => (
        <span className="text-xs text-foreground font-semibold">
          {table.capacity || 4} Seats
        </span>
      ),
    },
    {
      key: "status",
      label: "Live Status",
      width: "170px",
      render: (table) => (
        <div className="w-38">
          <CustomSelect
            options={ALL_TABLE_STATUS_OPTIONS}
            value={table.status}
            onValueChange={(val) => handleStatusChange(table, val as TableMonitoringStatus)}
            size="sm"
            clearable={false}
          />
        </div>
      ),
    },
    {
      key: "activeOrder",
      label: "Active Order",
      width: "130px",
      render: (table) => {
        if (!table.activeOrder) return <span className="text-xs text-muted-foreground/60 italic">---</span>;
        return (
          <span className="font-mono text-xs font-bold text-foreground">
            #{table.activeOrder.orderNumber}
          </span>
        );
      },
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      width: "140px",
      render: (table) => {
        if (!table.activeOrder) return <span className="text-xs text-muted-foreground/60">---</span>;
        const isPaid = table.activeOrder.paymentStatus === "PAID";
        return (
          <div className="flex flex-col text-xs">
            <span className="font-black text-xs text-primary">
              {formatCurrency(table.activeOrder.totalAmount || 0)}
            </span>
            <span
              className={cn(
                "text-[10px] font-extrabold uppercase tracking-wider",
                isPaid
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-amber-600 dark:text-amber-400"
              )}
            >
              {isPaid ? "PAID" : "UNPAID"}
            </span>
          </div>
        );
      },
    },
    {
      key: "seatedMinutes",
      label: "Start / Seated Time",
      width: "170px",
      render: (table) => {
        const timeStr = table.seatedAt || table.activeOrder?.createdAt;
        if (!timeStr && !table.seatedMinutes) {
          return <span className="text-xs text-muted-foreground/60">---</span>;
        }
        return (
          <div className="flex flex-col text-xs">
            {timeStr && (
              <span className="font-mono font-semibold text-foreground">
                {dateTimeFormat(timeStr)}
              </span>
            )}
            {table.seatedMinutes ? (
              <span className="text-[11px] font-mono text-muted-foreground">
                ({table.seatedMinutes} mins)
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      width: "160px",
      isPinnedRight: true,
      render: (table) => {
        const isOccupied = table.status === "OCCUPIED";
        const isReserved = table.status === "RESERVED";
        const isOrderPaid = table.activeOrder?.paymentStatus === "PAID";

        return (
          <div className="flex items-center gap-1.5 justify-start">
            {isReserved && (
              <ActionButton
                icon={<UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                tooltip="Seat Guest"
                onClick={() => handleStatusChange(table, "OCCUPIED")}
              />
            )}



            {isOccupied && isOrderPaid && (
              <>
                <ActionButton
                  icon={<Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  tooltip="Download Official Receipt"
                  onClick={() => handleDownloadReceipt(table)}
                />
                <ActionButton
                  icon={<Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  tooltip="Clear & Reset Table to Available"
                  onClick={() => handleClearTable(table)}
                />
              </>
            )}

            {handleOpenQrModal && (
              <ActionButton
                icon={<QrCode className="w-3.5 h-3.5 text-primary" />}
                tooltip="View Table QR Code"
                onClick={() => handleOpenQrModal(table)}
              />
            )}

            <ActionButton
              icon={<Eye className="w-3.5 h-3.5 text-foreground" />}
              tooltip="View Live Dining Details"
              onClick={() => handleViewDetails(table)}
            />

            {handleDeleteTable && (
              <ActionButton
                icon={<Trash2 className="w-3.5 h-3.5 text-destructive" />}
                tooltip="Delete Table"
                onClick={() => handleDeleteTable(table)}
              />
            )}
          </div>
        );
      },
    },
  ];
};
