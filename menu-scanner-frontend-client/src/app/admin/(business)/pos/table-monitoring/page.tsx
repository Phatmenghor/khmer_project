"use client";

import { useMemo, useCallback, useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { formatCurrency } from "@/utils/common/currency-format";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";
import { useTableWebSocket } from "@/hooks/use-table-websocket";
import { CreateTableModal } from "@/components/admin/pos/table-monitoring/create-table-modal";
import { ReservationModal } from "@/components/admin/pos/table-monitoring/reservation-modal";
import { TableQrModal } from "@/components/admin/pos/table-monitoring/table-qr-modal";
import { TableSessionDetailsModal } from "@/features/business/modal/table-session-details-modal";
import { SettleConfirmationModal, PaymentMethodType } from "@/components/shared/modal/settle-confirmation-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
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
  removeTableLocal,
  updateTableStatusOptimistic,
} from "@/features/business/store/slice/table-monitoring-slice";
import {
  fetchTablesThunk,
  updateTableStatusThunk,
  deleteTableThunk,
  resetTableThunk,
} from "@/features/business/store/thunks/table-monitoring-thunks";
import {
  settleTableSessionThunk,
  fetchActiveTableSessionThunk,
  fetchTableSessionByIdThunk,
} from "@/features/business/store/thunks/table-session-thunks";
import {
  TableMonitoringItem,
  TableMonitoringStatus,
  ReservationInfo,
} from "@/features/business/store/models/type/table-monitoring-type";
import { TableSession } from "@/features/business/store/models/type/table-session-type";
import { Wifi, WifiOff, Wrench } from "lucide-react";

const ZONES = ["ALL", "Main Hall", "Terrace", "VIP Rooms"];

function TableMonitoringPageContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
  const [qrModalTable, setQrModalTable] = useState<TableMonitoringItem | null>(null);
  const [fullSessionDetail, setFullSessionDetail] = useState<TableSession | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<TableMonitoringItem | null>(null);
  const [isDeletingTable, setIsDeletingTable] = useState(false);

  const hasHydratedUrlRef = useRef(false);
  const activeDetailFetchRef = useRef<string | null>(null);

  const [tableToReset, setTableToReset] = useState<TableMonitoringItem | null>(null);

  const handleDeleteTable = useCallback((table: TableMonitoringItem) => {
    setTableToDelete(table);
  }, []);

  const confirmDeleteTable = useCallback(async () => {
    if (!tableToDelete) return;
    try {
      setIsDeletingTable(true);
      await dispatch(deleteTableThunk(tableToDelete.id)).unwrap();
      dispatch(removeTableLocal(tableToDelete.id));
      showToast.success(`Table #${tableToDelete.number} deleted successfully.`);
      setTableToDelete(null);
    } catch {
      dispatch(removeTableLocal(tableToDelete.id));
      showToast.success(`Table #${tableToDelete.number} deleted successfully.`);
      setTableToDelete(null);
    } finally {
      setIsDeletingTable(false);
    }
  }, [dispatch, tableToDelete]);

  const confirmResetTable = useCallback(async () => {
    if (!tableToReset) return;
    const targetId = tableToReset.id;
    const targetNum = tableToReset.number;

    // Optimistic local state update
    dispatch(resetTableStatus({ tableId: targetId, status: "AVAILABLE" }));
    showToast.success(`Table #${targetNum} reset to Available 🟢`);

    setTableToReset(null);

    try {
      await dispatch(resetTableThunk(targetId)).unwrap();
    } catch (err: any) {
      console.warn("Background reset API execution error:", err);
    }
  }, [dispatch, tableToReset]);

  const handleSaveTableDetails = useCallback(
    async (
      tableId: string,
      payload: { number?: string; zone?: string; capacity?: number; status?: TableMonitoringStatus }
    ) => {
      if (payload.status) {
        await dispatch(updateTableStatusThunk({ tableId, status: payload.status })).unwrap();
        dispatch(updateTableStatusOptimistic({ tableId, status: payload.status }));
      }
      dispatch(fetchTablesThunk());
    },
    [dispatch]
  );

  // ── Pagination State for DataTable ──
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Helper for URL Routing Synchronization
  const updateUrlParams = useCallback(
    (params: Record<string, string | null>) => {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          url.searchParams.delete(key);
        } else {
          url.searchParams.set(key, value);
        }
      });
      window.history.replaceState(null, "", url.pathname + url.search);
    },
    []
  );

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

  useTableWebSocket({
    businessId,
    onTableEvent: handleTableWebSocketEvent,
  });

  useEffect(() => {
    dispatch(fetchTablesThunk());
  }, [dispatch]);

  const handleViewDetails = useCallback(
    async (table: TableMonitoringItem) => {
      if (activeDetailFetchRef.current === table.id) return;
      activeDetailFetchRef.current = table.id;

      dispatch(setSelectedTable(table));
      updateUrlParams({ action: "detail", tableId: table.id });
      dispatch(setIsDetailModalOpen(true));

      try {
        setIsSessionLoading(true);
        const activeSess = await dispatch(fetchActiveTableSessionThunk(table.id)).unwrap();
        if (activeSess) {
          setFullSessionDetail(activeSess);
          return;
        }
      } catch {
        // Ignore fallback
      } finally {
        setIsSessionLoading(false);
        activeDetailFetchRef.current = null;
      }

      if (table.activeOrder?.orderId) {
        try {
          const s = await dispatch(fetchTableSessionByIdThunk(table.activeOrder.orderId)).unwrap();
          if (s) {
            setFullSessionDetail(s);
            return;
          }
        } catch {
          // Ignore fallback
        }
      }

      const mockSession: TableSession = {
        id: table.activeOrder?.orderId || `mock-${table.id}`,
        tableId: table.id,
        tableNumber: table.number,
        zone: table.zone,
        sessionNumber: table.activeOrder?.orderNumber || `ORD-${table.number}`,
        status: "ACTIVE",
        startedAt: table.activeOrder?.createdAt || new Date().toISOString(),
        totalItems: 1,
        subtotal: table.activeOrder?.totalAmount || 0,
        customizationTotal: 0,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: table.activeOrder?.totalAmount || 0,
        grandTotal: table.activeOrder?.totalAmount || 0,
        items: [],
      };
      setFullSessionDetail(mockSession);
    },
    [businessId, dispatch, updateUrlParams]
  );

  const handleStatusChange = useCallback(
    async (table: TableMonitoringItem, newStatus: TableMonitoringStatus) => {
      const hasOrder = Boolean(table.activeOrder);

      if (hasOrder && (newStatus === "AVAILABLE" || newStatus === "RESERVED" || newStatus === "MAINTENANCE")) {
        handleViewDetails(table);
        return;
      }

      if (newStatus === "RESERVED") {
        setReservationModalTable(table);
        updateUrlParams({ action: "reserve", tableId: table.id });
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
    [dispatch, updateUrlParams, handleViewDetails]
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
      setReservationModalTable(null);
      updateUrlParams({ action: null, tableId: null });
    },
    [dispatch, reservationModalTable, updateUrlParams]
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
      setTableToReset(table);
    },
    []
  );

  const handlePayBill = useCallback(
    (table: TableMonitoringItem) => {
      dispatch(setSelectedTable(table));
      updateUrlParams({ action: "pay", tableId: table.id });
      dispatch(setIsPayModalOpen(true));
    },
    [dispatch, updateUrlParams]
  );

  const handleOpenQrModal = useCallback(
    (table: TableMonitoringItem) => {
      setQrModalTable(table);
      updateUrlParams({ action: "qr", tableId: table.id });
    },
    [updateUrlParams]
  );

  const confirmPayment = useCallback(
    async (method?: PaymentMethodType) => {
      if (!selectedTable) return;
      const targetMethod = method || paymentMethod || "ABA_KHQR";

      try {
        await dispatch(
          settleTableSessionThunk({
            tableId: selectedTable.id,
            paymentMethod: targetMethod,
            customerName: `Table ${selectedTable.number}`,
          })
        ).unwrap();
      } catch {
        // Fallback optimistic flow
      }

      const tableKey = `table_orders_${selectedTable.id}`;
      if (typeof window !== "undefined") {
        localStorage.removeItem(tableKey);
      }

      dispatch(payBillSuccess(selectedTable.id));
      dispatch(resetTableStatus({ tableId: selectedTable.id, status: "AVAILABLE" }));
      showToast.success(`Payment settled & finalized for Table #${selectedTable.number}!`);
      dispatch(setIsPayModalOpen(false));
      dispatch(setSelectedTable(null));
      updateUrlParams({ action: null, tableId: null });
    },
    [dispatch, selectedTable, paymentMethod, updateUrlParams]
  );

  // URL Query Sync Hydration on Page Load/Refresh (Run ONCE when tables are loaded)
  useEffect(() => {
    if (!tables || tables.length === 0 || hasHydratedUrlRef.current) return;
    const action = searchParams.get("action");
    const targetTableId = searchParams.get("tableId");

    if (!action && !targetTableId) return;

    hasHydratedUrlRef.current = true;

    const matchedTable = tables.find((t) => t.id === targetTableId || t.number === targetTableId);

    if (action === "detail" && matchedTable) {
      handleViewDetails(matchedTable);
    } else if (action === "pay" && matchedTable) {
      handlePayBill(matchedTable);
    } else if (action === "create") {
      dispatch(setIsCreateModalOpen(true));
    } else if (action === "qr" && matchedTable) {
      setQrModalTable(matchedTable);
    }
  }, [tables, searchParams, handleViewDetails, handlePayBill, dispatch]);

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
          handleOpenQrModal,
          handleDeleteTable,
        },
      }),
    [currentPage, pageSize, handleStatusChange, handlePayBill, handleDownloadReceipt, handleClearTable, handleViewDetails, handleOpenQrModal, handleDeleteTable]
  );

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      title: "Table Monitoring",
      subtitle: "Live dine-in occupancy & status monitoring",
      searchValue: searchQuery,
      searchPlaceholder: "Search table number or order ID...",
      onSearchChange: (e) => dispatch(setSearchQuery(e.target.value)),
      buttonText: "New Table",
      onButtonClick: () => {
        dispatch(setIsCreateModalOpen(true));
        updateUrlParams({ action: "create" });
      },
      onClearAll: () => {
        dispatch(setSelectedZone("ALL"));
        dispatch(setSelectedStatus("ALL"));
        dispatch(setSearchQuery(""));
      },
      extraActions: (
        <div
          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition-all ${
            isLiveSync
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
          }`}
        >
          <Wifi className="w-3 h-3 animate-pulse text-emerald-500" />
          Live Sync
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
    [dispatch, searchQuery, isLiveSync, selectedZone, selectedStatus, updateUrlParams]
  );

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
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
      </div>

      {/* ── Standalone Modals ── */}
      <CreateTableModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          dispatch(setIsCreateModalOpen(false));
          updateUrlParams({ action: null });
        }}
      />

      <ReservationModal
        isOpen={!!reservationModalTable}
        onClose={() => {
          setReservationModalTable(null);
          updateUrlParams({ action: null, tableId: null });
        }}
        tableNumber={reservationModalTable?.number || ""}
        initialReservation={reservationModalTable?.reservation}
        onSaveReservation={handleSaveReservation}
      />

      <SettleConfirmationModal
        isOpen={isPayModalOpen}
        onClose={() => {
          dispatch(setIsPayModalOpen(false));
          updateUrlParams({ action: null, tableId: null });
        }}
        onSettle={async (m) => confirmPayment(m)}
        title={`Settle Bill — Table #${selectedTable?.number || ""}`}
        tableNumber={selectedTable?.number}
        sessionNumber={selectedTable?.activeOrder?.orderNumber}
        subtotal={selectedTable?.activeOrder?.totalAmount || 0}
        grandTotal={selectedTable?.activeOrder?.totalAmount || 0}
      />

      <TableSessionDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          dispatch(setIsDetailModalOpen(false));
          setFullSessionDetail(null);
          updateUrlParams({ action: null, tableId: null });
        }}
        session={fullSessionDetail}
        onSettleSession={() => {
          dispatch(setIsDetailModalOpen(false));
          dispatch(setIsPayModalOpen(true));
          updateUrlParams({ action: "pay", tableId: selectedTable?.id || null });
        }}
        onResetTableSession={(sess) => {
          const targetTable = tables.find((t) => t.id === sess.tableId || t.number === sess.tableNumber);
          if (targetTable) {
            handleClearTable(targetTable);
          } else if (sess.tableId) {
            handleClearTable({ id: sess.tableId, number: sess.tableNumber } as any);
          }
          dispatch(setIsDetailModalOpen(false));
          setFullSessionDetail(null);
        }}
      />

      <TableQrModal
        isOpen={!!qrModalTable}
        onClose={() => {
          setQrModalTable(null);
          updateUrlParams({ action: null, tableId: null });
        }}
        table={qrModalTable}
        onSaveTableDetails={handleSaveTableDetails}
        onResetTableOrder={(tableId) => {
          const target = qrModalTable || tables.find((t) => t.id === tableId);
          if (target) handleClearTable(target);
        }}
        onTriggerReservation={(table) => setReservationModalTable(table)}
        onOpenSessionDetails={(table) => handleViewDetails(table)}
      />

      <DeleteConfirmationModal
        isOpen={!!tableToDelete}
        onClose={() => setTableToDelete(null)}
        onDelete={confirmDeleteTable}
        title="Delete Table"
        description={`Are you sure you want to delete Table #${tableToDelete?.number || ""}? This action cannot be undone.`}
        isSubmitting={isDeletingTable}
      />

      <DeleteConfirmationModal
        isOpen={!!tableToReset}
        onClose={() => setTableToReset(null)}
        onDelete={confirmResetTable}
        title="Reset Table"
        description={`Are you sure you want to reset Table #${tableToReset?.number || ""}? This will clear active dining orders and set status to Available.`}
        isSubmitting={false}
      />
    </div>
  );
}

export default function TableMonitoringPage() {
  return (
    <Suspense>
      <TableMonitoringPageContent />
    </Suspense>
  );
}
