"use client";

import { useEffect, useMemo, useState, useCallback, useRef, Suspense } from "react";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { ApproveConfirmationModal } from "@/components/shared/modal/approve-confirmation-modal";
import { SettleConfirmationModal, PaymentMethodType } from "@/components/shared/modal/settle-confirmation-modal";
import { TableSessionDetailsModal } from "@/features/business/modal/table-session-details-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import {
  tableSessionColumns,
  TablePendingOrderRow,
} from "@/features/business/table/table-session-table";
import { TableSession } from "@/features/business/store/models/type/table-session-type";
import {
  fetchMyBusinessTableSessionsThunk,
  deleteTableSessionThunk,
  approveTableSessionThunk,
  fetchTableSessionByIdThunk,
  settleTableSessionThunk,
} from "@/features/business/store/thunks/table-session-thunks";
import { AppDefault } from "@/constants/app-resource/default/default";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";
import { useAppDispatch, useAppSelector } from "@/store";
import { useDebounce } from "@/utils/debounce/debounce";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { useTableWebSocket } from "@/hooks/use-table-websocket";

function TablePendingOrdersPageInner() {
  const dispatch = useAppDispatch();
  const businessSettings = useAppSelector(selectBusinessSettings);
  const businessId = businessSettings?.businessId || AppDefault.BUSINESS_ID;

  const [tableSessions, setTableSessions] = useState<TablePendingOrderRow[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNo, setPageNo] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const activeFetchRef = useRef<string | null>(null);

  const [deleteState, setDeleteState] = useState<{
    isOpen: boolean;
    session: TableSession | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    session: null,
    isDeleting: false,
  });

  const [approveState, setApproveState] = useState<{
    isOpen: boolean;
    row: TablePendingOrderRow | null;
    isApproving: boolean;
  }>({
    isOpen: false,
    row: null,
    isApproving: false,
  });

  const [settleState, setSettleState] = useState<{
    isOpen: boolean;
    row: TablePendingOrderRow | null;
    session: TableSession | null;
    isSettling: boolean;
  }>({
    isOpen: false,
    row: null,
    session: null,
    isSettling: false,
  });

  const [detailsModalState, setDetailsModalState] = useState<{
    isOpen: boolean;
    session: TableSession | null;
    selectedRound?: number;
  }>({
    isOpen: false,
    session: null,
    selectedRound: undefined,
  });

  const globalPageSize = Number(useAppSelector(selectGlobalPageSize)) || AppDefault.PAGE_SIZE;
  const debouncedSearch = useDebounce(search, 400);

  const loadPendingTableSessions = useCallback(async () => {
    const fetchKey = `${debouncedSearch}-PENDING-${pageNo}-${globalPageSize}`;
    if (activeFetchRef.current === fetchKey) {
      return;
    }
    activeFetchRef.current = fetchKey;
    setIsLoading(true);
    try {
      const res = await dispatch(
        fetchMyBusinessTableSessionsThunk({
          search: debouncedSearch,
          status: "PENDING",
          pageNo,
          pageSize: globalPageSize,
        })
      ).unwrap();
      setTableSessions((res.content as any) || []);
      setTotalElements(res.totalElements || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      showToast.error(err || "Failed to load table sessions");
    } finally {
      setIsLoading(false);
      activeFetchRef.current = null;
    }
  }, [dispatch, pageNo, globalPageSize, debouncedSearch]);

  useEffect(() => {
    loadPendingTableSessions();
  }, [loadPendingTableSessions]);

  const handleTableWebSocketEvent = useCallback(() => {
    loadPendingTableSessions();
    showToast.success("🔔 Table session update received!");
  }, [loadPendingTableSessions]);

  useTableWebSocket({
    businessId,
    onTableEvent: handleTableWebSocketEvent,
  });

  const handleViewSession = useCallback(async (row: TablePendingOrderRow) => {
    const targetId = row.sessionId || row.id.split("-round-")[0];
    try {
      const fullSession = await dispatch(fetchTableSessionByIdThunk(targetId)).unwrap();
      if (fullSession) {
        setDetailsModalState({ isOpen: true, session: fullSession, selectedRound: row.round });
        return;
      }
    } catch {
      // Fallback
    }
    const sessionObj: any = {
      id: targetId,
      sessionNumber: row.sessionNumber,
      tableNumber: row.tableNumber,
      status: row.status,
      startedAt: row.startedAt,
      items: row.items || [],
      totalItems: row.roundItemsCount,
      totalAmount: row.roundTotal,
    };
    setDetailsModalState({ isOpen: true, session: sessionObj, selectedRound: row.round });
  }, [dispatch]);

  const handleDeleteSession = useCallback((row: TablePendingOrderRow) => {
    const sessionObj: any = {
      id: row.sessionId || row.id.split("-round-")[0],
      sessionNumber: row.sessionNumber,
    };
    setDeleteState({ isOpen: true, session: sessionObj, isDeleting: false });
  }, []);

  const confirmDeleteSession = async () => {
    if (!deleteState.session) return;
    setDeleteState((prev) => ({ ...prev, isDeleting: true }));
    try {
      await dispatch(deleteTableSessionThunk(deleteState.session.id)).unwrap();
      showToast.success(`Table session #${deleteState.session.sessionNumber} deleted`);
      setDeleteState({ isOpen: false, session: null, isDeleting: false });
      loadPendingTableSessions();
    } catch (err: any) {
      showToast.error(err || "Failed to delete table session");
      setDeleteState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleApproveSession = useCallback((row: TablePendingOrderRow) => {
    setApproveState({ isOpen: true, row, isApproving: false });
  }, []);

  const confirmApproveSession = async () => {
    if (!approveState.row) return;
    const row = approveState.row;
    setApproveState((prev) => ({ ...prev, isApproving: true }));
    try {
      const targetId = row.sessionId || row.id.split("-round-")[0];
      await dispatch(approveTableSessionThunk({ id: targetId, round: row.round })).unwrap();
      showToast.success(`Round ${row.round} approved for table ${row.tableNumber}!`);
      setApproveState({ isOpen: false, row: null, isApproving: false });
      loadPendingTableSessions();
    } catch (err: any) {
      showToast.error(err || "Failed to approve table session round");
      setApproveState((prev) => ({ ...prev, isApproving: false }));
    }
  };

  const handleSettleSession = useCallback(async (row: TablePendingOrderRow) => {
    const targetId = row.sessionId || row.id.split("-round-")[0];
    try {
      const fullSession = await dispatch(fetchTableSessionByIdThunk(targetId)).unwrap();
      setSettleState({ isOpen: true, row, session: fullSession || null, isSettling: false });
    } catch {
      setSettleState({ isOpen: true, row, session: null, isSettling: false });
    }
  }, [dispatch]);

  const confirmSettleSession = async (paymentMethod: PaymentMethodType) => {
    if (!settleState.row && !settleState.session) return;
    const targetId = settleState.session?.tableId || settleState.session?.id || settleState.row?.sessionId || settleState.row?.id.split("-round-")[0] || "";
    setSettleState((prev) => ({ ...prev, isSettling: true }));
    try {
      await dispatch(
        settleTableSessionThunk({
          tableId: targetId,
          paymentMethod,
        })
      ).unwrap();
      showToast.success(`Session #${settleState.session?.sessionNumber || settleState.row?.sessionNumber || ""} settled & finalized!`);
      setSettleState({ isOpen: false, row: null, session: null, isSettling: false });
      loadPendingTableSessions();
    } catch (err: any) {
      showToast.error(err || "Failed to settle table session");
      setSettleState((prev) => ({ ...prev, isSettling: false }));
    }
  };

  const tableHandlers = useMemo(
    () => ({
      handleViewSession,
      handleDeleteSession,
      handleApproveSession,
      handleSettleSession,
    }),
    [handleViewSession, handleDeleteSession, handleApproveSession, handleSettleSession]
  );

  const columns = useMemo(
    () =>
      tableSessionColumns({
        currentPage: pageNo,
        pageSize: globalPageSize,
        handlers: tableHandlers,
      }),
    [pageNo, globalPageSize, tableHandlers]
  );

  const filterConfig = useMemo((): FilterPanelConfig => ({
    title: "Table Pending Orders",
    searchValue: search,
    searchPlaceholder: "Search table number or session code...",
    onSearchChange: (e) => setSearch(e.target.value),
    onClearAll: () => setSearch(""),
    filters: [],
  }), [search]);

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel config={filterConfig} />

        <DataTableWithPagination
          data={tableSessions}
          columns={columns}
          loading={isLoading}
          emptyMessage="No table session orders found"
          getRowKey={(row) => row.id}
          currentPage={pageNo}
          totalElements={totalElements}
          totalPages={totalPages}
          onPageChange={(page) => setPageNo(page)}
          pageSize={globalPageSize}
          onPageSizeChange={() => setPageNo(1)}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      <TableSessionDetailsModal
        isOpen={detailsModalState.isOpen}
        onClose={() => setDetailsModalState({ isOpen: false, session: null, selectedRound: undefined })}
        session={detailsModalState.session}
        selectedRound={detailsModalState.selectedRound}
        onSettleSession={(sess) => {
          setDetailsModalState({ isOpen: false, session: null, selectedRound: undefined });
          setSettleState({ isOpen: true, row: null, session: sess, isSettling: false });
        }}
      />

      <SettleConfirmationModal
        isOpen={settleState.isOpen}
        onClose={() => setSettleState({ isOpen: false, row: null, session: null, isSettling: false })}
        onSettle={confirmSettleSession}
        title="Final Checkout & Settle Bill"
        tableNumber={settleState.session?.tableNumber || settleState.row?.tableNumber}
        sessionNumber={settleState.session?.sessionNumber || settleState.row?.sessionNumber}
        subtotal={settleState.session?.subtotal || settleState.row?.roundTotal || 0}
        taxRate={settleState.session?.taxRate || 0}
        taxAmount={settleState.session?.taxAmount || 0}
        grandTotal={settleState.session?.grandTotal || settleState.session?.totalAmount || settleState.row?.roundTotal || 0}
        isSubmitting={settleState.isSettling}
      />

      <ApproveConfirmationModal
        isOpen={approveState.isOpen}
        onClose={() => setApproveState({ isOpen: false, row: null, isApproving: false })}
        onApprove={confirmApproveSession}
        title="Approve Order Round"
        description={`Are you sure you want to approve Round ${approveState.row?.round || 1} for ${approveState.row?.tableNumber || "Table"}?`}
        itemName={`${approveState.row?.tableNumber || "Table"} — Round ${approveState.row?.round || 1} (${approveState.row?.roundItemsCount || 0} items)`}
        confirmButtonText="Approve Round"
        isSubmitting={approveState.isApproving}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState({ isOpen: false, session: null, isDeleting: false })}
        onDelete={confirmDeleteSession}
        title="Delete Table Session"
        description={`Are you sure you want to delete table session #${deleteState.session?.sessionNumber || ""}?`}
        itemName={deleteState.session?.sessionNumber || ""}
        isSubmitting={deleteState.isDeleting}
      />
    </div>
  );
}

export default function TablePendingOrdersPage() {
  return (
    <Suspense>
      <TablePendingOrdersPageInner />
    </Suspense>
  );
}
