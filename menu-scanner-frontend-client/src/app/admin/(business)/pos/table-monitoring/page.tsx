"use client";

import { useMemo, useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { formatCurrency } from "@/utils/common/currency-format";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";
import { useTableWebSocket } from "@/hooks/use-table-websocket";
import { CreateTableModal } from "@/components/admin/pos/table-monitoring/create-table-modal";
import { ReservationModal } from "@/components/admin/pos/table-monitoring/reservation-modal";
import { SettleBillModal } from "@/components/admin/pos/table-monitoring/settle-bill-modal";
import { TableOrderDetailModal } from "@/components/admin/pos/table-monitoring/table-order-detail-modal";
import { tableMonitoringColumns } from "@/features/business/table/table-monitoring-table";
import {
  setSelectedZone,
  setSelectedStatus,
  setSearchQuery,
  setSelectedTable,
  setIsPayModalOpen,
  setIsDetailModalOpen,
  setIsCreateModalOpen,
  setPaymentMethod,
  payBillSuccess,
  resetTableStatus,
  setTableReservation,
} from "@/features/business/store/slice/table-monitoring-slice";
import {
  fetchTablesThunk,
  updateTableStatusThunk,
} from "@/features/business/store/thunks/table-monitoring-thunks";
import {
  TableMonitoringItem,
  TableMonitoringStatus,
  ReservationInfo,
} from "@/features/business/store/models/type/table-monitoring-type";
import { Wifi, WifiOff, Wrench } from "lucide-react";

const ZONES = ["ALL", "Main Hall", "Terrace", "VIP Rooms"];

export default function TableMonitoringPage() {
  const dispatch = useAppDispatch();
  const businessSettings = useAppSelector(selectBusinessSettings);
  const businessId = businessSettings?.businessId;

  const {
    tables,
    selectedZone,
    selectedStatus,
    searchQuery,
    isLiveSync,
    selectedTable,
    isPayModalOpen,
    isDetailModalOpen,
    isCreateModalOpen,
    paymentMethod,
    isLoading,
  } = useAppSelector((state) => state.tableMonitoring);

  const [reservationModalTable, setReservationModalTable] = useState<TableMonitoringItem | null>(null);

  // ── Pagination State for DataTable ──
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── STOMP WebSocket Connection ──
  const handleTableWebSocketEvent = useCallback(
    (event: { type: string; tableId?: string; tableNumber?: string; status?: string }) => {
      if (!isLiveSync) return;

      if (event.type === "TABLE_BILL_PAID" && event.tableId) {
        dispatch(payBillSuccess(event.tableId));
        showToast.success(`Real-time Alert: Table #${event.tableNumber || ""} bill paid!`);
      } else if (event.type === "TABLE_RESET" && event.tableId) {
        dispatch(resetTableStatus({ tableId: event.tableId, status: "AVAILABLE" }));
      } else if (event.type === "TABLE_STATUS_UPDATED" && event.tableId && event.status) {
        dispatch(resetTableStatus({ tableId: event.tableId, status: event.status as TableMonitoringStatus }));
      } else {
        dispatch(fetchTablesThunk());
      }
    },
    [dispatch, isLiveSync]
  );

  const { isConnected: isWsConnected } = useTableWebSocket({
    businessId,
    onTableEvent: handleTableWebSocketEvent,
  });

  useEffect(() => {
    dispatch(fetchTablesThunk());
  }, [dispatch]);

  const handleStatusChange = useCallback(
    async (table: TableMonitoringItem, newStatus: TableMonitoringStatus) => {
      if (newStatus === "RESERVED") {
        setReservationModalTable(table);
        return;
      }

      try {
        await dispatch(
          updateTableStatusThunk({
            tableId: table.id,
            status: newStatus,
          })
        ).unwrap();
      } catch {
        dispatch(resetTableStatus({ tableId: table.id, status: newStatus }));
      }
      showToast.success(`Updated Table #${table.number} status to ${newStatus}`);
    },
    [dispatch]
  );

  const handleSaveReservation = useCallback(
    (reservation: ReservationInfo) => {
      if (!reservationModalTable) return;
      dispatch(
        setTableReservation({
          tableId: reservationModalTable.id,
          reservation,
        })
      );
      dispatch(
        updateTableStatusThunk({
          tableId: reservationModalTable.id,
          status: "RESERVED",
        })
      );
    },
    [dispatch, reservationModalTable]
  );

  const handleDownloadReceipt = useCallback((table: TableMonitoringItem) => {
    showToast.success(`Downloading Official Receipt for Table #${table.number}...`);
    const windowUrl = window.open("", "_blank");
    if (windowUrl) {
      windowUrl.document.write(`
        <html>
          <head>
            <title>Receipt - Table #${table.number}</title>
            <style>
              body { font-family: sans-serif; padding: 20px; line-height: 1.5; }
              .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 10px; }
              .total { font-weight: bold; font-size: 18px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>E-MENU PLATFORM RECEIPT</h2>
              <p>Table #${table.number} (${table.zone})</p>
              <p>Order #${table.activeOrder?.orderNumber || "1001"}</p>
            </div>
            <p><strong>Items:</strong> ${table.activeOrder?.itemsSummary || "Dine-in Order"}</p>
            <p class="total">Total Paid: ${formatCurrency(table.activeOrder?.totalAmount || 0)}</p>
            <p style="text-align:center; margin-top: 30px; font-size: 12px; color: #666;">Thank you for dining with us!</p>
          </body>
        </html>
      `);
      windowUrl.document.close();
      windowUrl.print();
    }
  }, []);

  const metrics = useMemo(() => {
    const total = tables.length;
    const available = tables.filter((t) => t.status === "AVAILABLE").length;
    const occupied = tables.filter((t) => t.status === "OCCUPIED").length;
    const reserved = tables.filter((t) => t.status === "RESERVED").length;
    const maintenance = tables.filter((t) => t.status === "MAINTENANCE").length;

    return { total, available, occupied, reserved, maintenance };
  }, [tables]);

  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchZone = selectedZone === "ALL" || t.zone === selectedZone;
      const matchStatus = selectedStatus === "ALL" || t.status === selectedStatus;
      const matchSearch =
        searchQuery === "" ||
        t.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.activeOrder?.orderId && t.activeOrder.orderId.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchZone && matchStatus && matchSearch;
    });
  }, [tables, selectedZone, selectedStatus, searchQuery]);

  const paginatedTables = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredTables.slice(startIndex, startIndex + pageSize);
  }, [filteredTables, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredTables.length / pageSize) || 1;

  const handleClearTable = useCallback(
    (table: TableMonitoringItem) => {
      dispatch(resetTableStatus({ tableId: table.id, status: "AVAILABLE" }));
      showToast.success(`Table #${table.number} cleared and reset to Available 🟢`);
    },
    [dispatch]
  );

  const handleViewDetails = useCallback(
    (table: TableMonitoringItem) => {
      dispatch(setSelectedTable(table));
      dispatch(setIsDetailModalOpen(true));
    },
    [dispatch]
  );

  const handlePayBill = useCallback(
    (table: TableMonitoringItem) => {
      dispatch(setSelectedTable(table));
      dispatch(setIsPayModalOpen(true));
    },
    [dispatch]
  );

  const columns = useMemo(
    () =>
      tableMonitoringColumns({
        currentPage,
        pageSize,
        handlers: {
          handleStatusChange,
          handlePayBill,
          handleDownloadReceipt,
          handleClearTable,
          handleViewDetails,
        },
      }),
    [currentPage, pageSize, handleStatusChange, handlePayBill, handleDownloadReceipt, handleClearTable, handleViewDetails]
  );

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      title: "Table Monitoring",
      subtitle: "Live dine-in occupancy & status monitoring",
      searchValue: searchQuery,
      searchPlaceholder: "Search table number or order ID...",
      onSearchChange: (e) => dispatch(setSearchQuery(e.target.value)),
      buttonText: "New Table",
      onButtonClick: () => dispatch(setIsCreateModalOpen(true)),
      onClearAll: () => {
        dispatch(setSelectedZone("ALL"));
        dispatch(setSelectedStatus("ALL"));
        dispatch(setSearchQuery(""));
      },
      extraActions: (
        <div
          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-all ${
            isWsConnected
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
          }`}
        >
          {isWsConnected ? (
            <Wifi className="w-3 h-3 animate-pulse text-emerald-500" />
          ) : (
            <WifiOff className="w-3 h-3 text-amber-500" />
          )}
          {isWsConnected ? "Live Sync" : "Connecting..."}
        </div>
      ),
      filters: [
        {
          id: "zone",
          type: "select",
          label: "Shop Zone",
          value: selectedZone,
          options: ZONES.map((z) => ({ value: z, label: z === "ALL" ? "All Zones" : z })),
          onChange: (val) => dispatch(setSelectedZone((val as string) || "ALL")),
        },
        {
          id: "status",
          type: "select",
          label: "Live Status",
          value: selectedStatus,
          options: [
            { value: "ALL", label: "All Statuses" },
            { value: "AVAILABLE", label: "🟢 Available Only" },
            { value: "OCCUPIED", label: "🔴 Occupied Only" },
            { value: "RESERVED", label: "🟣 Reserved Only" },
            { value: "MAINTENANCE", label: "🟡 Maintenance Only" },
          ],
          onChange: (val) => dispatch(setSelectedStatus((val as string) || "ALL")),
        },
      ],
    }),
    [dispatch, searchQuery, isWsConnected, selectedZone, selectedStatus]
  );

  const confirmPayment = useCallback(() => {
    if (!selectedTable) return;
    dispatch(payBillSuccess(selectedTable.id));
    showToast.success(`Payment settled for Table #${selectedTable.number}!`);
    dispatch(setIsPayModalOpen(false));
    dispatch(setSelectedTable(null));
  }, [dispatch, selectedTable]);

  return (
    <div className="flex flex-1 flex-col gap-4 px-1 pb-6 pt-2">
      <CollapsibleFilterPanel
        config={filterConfig}
        essentialFilterIds={["zone", "status"]}
      />

      {/* ── KPI Analytics Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Available</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {metrics.available} <span className="text-xs text-muted-foreground font-normal">/ {metrics.total}</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-sm">
            🟢
          </div>
        </div>

        <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Occupied</p>
            <p className="text-xl font-black text-red-600 dark:text-red-400">{metrics.occupied}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center justify-center font-bold text-sm">
            🔴
          </div>
        </div>

        <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Reserved</p>
            <p className="text-xl font-black text-purple-600 dark:text-purple-400">{metrics.reserved}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-sm">
            🟣
          </div>
        </div>

        <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-3.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Maintenance</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400">{metrics.maintenance}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-sm">
            <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* ── Table List View ── */}
      <DataTableWithPagination
        data={paginatedTables}
        columns={columns}
        loading={isLoading}
        emptyMessage="No tables found matching your search or filters"
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={filteredTables.length}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        getRowKey={(item) => item.id}
      />

      {/* ── Standalone Modals ── */}
      <CreateTableModal
        isOpen={isCreateModalOpen}
        onClose={() => dispatch(setIsCreateModalOpen(false))}
      />

      <ReservationModal
        isOpen={!!reservationModalTable}
        onClose={() => setReservationModalTable(null)}
        tableNumber={reservationModalTable?.number || ""}
        initialReservation={reservationModalTable?.reservation}
        onSaveReservation={handleSaveReservation}
      />

      <SettleBillModal
        isOpen={isPayModalOpen}
        onClose={() => dispatch(setIsPayModalOpen(false))}
        selectedTable={selectedTable}
        paymentMethod={paymentMethod}
        onSelectPaymentMethod={(method) => dispatch(setPaymentMethod(method))}
        onConfirmPayment={confirmPayment}
      />

      <TableOrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => dispatch(setIsDetailModalOpen(false))}
        selectedTable={selectedTable}
        onDownloadReceipt={handleDownloadReceipt}
      />
    </div>
  );
}
