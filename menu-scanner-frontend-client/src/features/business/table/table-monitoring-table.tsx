import React from "react";
import { TableColumn } from "@/components/shared/common/data-table";
import { CustomButton, ActionButton } from "@/components/shared/button/custom-button";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { formatCurrency } from "@/utils/common/currency-format";
import { indexDisplay } from "@/utils/common/common";
import {
  TableMonitoringItem,
  TableMonitoringStatus,
} from "@/features/business/store/models/type/table-monitoring-type";
import {
  Clock,
  CreditCard,
  Eye,
  Building2,
  Check,
  Download,
  UserCheck,
  QrCode,
} from "lucide-react";

import { getCustomTableQr } from "@/utils/table/table-qr-storage";

export const STATUS_SELECT_OPTIONS = [
  { value: "AVAILABLE", label: "🟢 Available" },
  { value: "OCCUPIED", label: "🔴 Occupied" },
  { value: "RESERVED", label: "🟣 Reserved" },
  { value: "MAINTENANCE", label: "🟡 Maintenance" },
];

export interface TableMonitoringTableHandlers {
  handleStatusChange: (table: TableMonitoringItem, newStatus: TableMonitoringStatus) => void;
  handlePayBill: (table: TableMonitoringItem) => void;
  handleDownloadReceipt: (table: TableMonitoringItem) => void;
  handleClearTable: (table: TableMonitoringItem) => void;
  handleViewDetails: (table: TableMonitoringItem) => void;
  handleOpenQrModal?: (table: TableMonitoringItem) => void;
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
  } = handlers;

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
      key: "number",
      label: "Table Code",
      width: "130px",
      render: (table) => {
        const hasCustomQr = Boolean(getCustomTableQr(table.number) || getCustomTableQr(table.id));
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs text-foreground">#{table.number}</span>
            {hasCustomQr && (
              <span
                className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
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
      label: "Zone / Section",
      width: "140px",
      render: (table) => (
        <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
          <Building2 className="w-3.5 h-3.5 text-muted-foreground" /> {table.zone}
        </span>
      ),
    },
    {
      key: "capacity",
      label: "Capacity",
      width: "110px",
      render: (table) => (
        <span className="text-xs text-foreground font-semibold">
          {table.capacity} Guests
        </span>
      ),
    },
    {
      key: "status",
      label: "Live Status",
      width: "200px",
      render: (table) => (
        <div className="w-44">
          <CustomSelect
            options={STATUS_SELECT_OPTIONS}
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
      label: "Active Order / Amount",
      width: "220px",
      render: (table) => {
        if (!table.activeOrder) return <span className="text-xs text-muted-foreground">---</span>;
        const isPaid = table.activeOrder.paymentStatus === "PAID";
        return (
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-foreground">#{table.activeOrder.orderNumber}</span>
            <span className="font-extrabold text-xs text-primary">{formatCurrency(table.activeOrder.totalAmount)}</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold border ${
              isPaid ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"
            }`}>
              {isPaid ? "PAID" : "UNPAID"}
            </span>
          </div>
        );
      },
    },
    {
      key: "seatedMinutes",
      label: "Seated Time",
      width: "130px",
      render: (table) => (
        table.seatedMinutes ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
            <Clock className="w-3.5 h-3.5" /> {table.seatedMinutes} mins
          </span>
        ) : <span className="text-xs text-muted-foreground">---</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "200px",
      isPinnedRight: true,
      render: (table) => {
        const isOccupied = table.status === "OCCUPIED";
        const isReserved = table.status === "RESERVED";
        const isOrderPaid = table.activeOrder?.paymentStatus === "PAID";

        return (
          <div className="flex items-center gap-1.5 justify-start">
            {isReserved && (
              <CustomButton
                variant="primary"
                size="sm"
                className="h-7 text-[11px] font-bold gap-1 bg-red-600 hover:bg-red-700 text-white shrink-0"
                onClick={() => handleStatusChange(table, "OCCUPIED")}
              >
                <UserCheck className="w-3.5 h-3.5" /> Seat Guest
              </CustomButton>
            )}

            {isOccupied && table.activeOrder && !isOrderPaid && (
              <CustomButton
                variant="primary"
                size="sm"
                className="h-7 text-[11px] font-bold gap-1 bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                onClick={() => handlePayBill(table)}
              >
                <CreditCard className="w-3.5 h-3.5" /> Pay {formatCurrency(table.activeOrder.totalAmount)}
              </CustomButton>
            )}

            {isOccupied && isOrderPaid && (
              <>
                <ActionButton
                  icon={<Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  tooltip="Download Receipt"
                  onClick={() => handleDownloadReceipt(table)}
                />
                <ActionButton
                  icon={<Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  tooltip="Clear & Reset Table"
                  onClick={() => handleClearTable(table)}
                />
              </>
            )}

            {handleOpenQrModal && (
              <ActionButton
                icon={<QrCode className="w-3.5 h-3.5 text-primary" />}
                tooltip="View Table QR & Link"
                onClick={() => handleOpenQrModal(table)}
              />
            )}

            <ActionButton
              icon={<Eye className="w-3.5 h-3.5" />}
              tooltip="View Live Dining Details"
              onClick={() => handleViewDetails(table)}
            />
          </div>
        );
      },
    },
  ];
};
