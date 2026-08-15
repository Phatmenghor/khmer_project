"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { ROUTES } from "@/constants/app-routes/routes";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { useOrderAdminState } from "@/features/business/store/state/order-admin-state";
import {
  deleteOrderAdminService,
  fetchAllOrderAdminService,
} from "@/features/business/store/thunks/order-admin-thunks";
import {
  setPageNo,
  setSearchFilter,
  setPaymentStatusFilter,
  setStartDateFilter,
  setEndDateFilter,
  resetState,
} from "@/features/business/store/slice/order-admin-slice";
import { orderAdminTableColumns } from "@/features/business/table/order-admin-table";
import { OrderDetailModal } from "@/features/business/components/order-detail-modal";
import { OrderUpdateModal } from "@/features/business/components/order-update-modal";
import { OrderResponse } from "@/features/main/store/models/response/order-response";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";
import { useAppSelector } from "@/store";
import { useDebounce } from "@/utils/debounce/debounce";
import { PAYMENT_STATUS_ADMIN_FILTER } from "@/constants/status/filter-status";
import { useDownloadReceipt } from "@/hooks/use-download-receipt";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { useRouter } from "next/navigation";
import { useAdminTableUrlState } from "@/hooks/use-admin-table-url-state";
import { TablePosNavTabs } from "@/components/admin/pos/table-pos-nav-tabs";
import { useTableWebSocket } from "@/hooks/use-table-websocket";

function TablePendingOrdersPageInner() {
  useAdminCleanup(resetState);

  const router = useRouter();
  const businessSettings = useAppSelector(selectBusinessSettings);
  const businessId = businessSettings?.businessId || AppDefault.BUSINESS_ID;

  const {
    orderState,
    orderData,
    orderContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useOrderAdminState();

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    orderId: "",
  });

  const [updateModalState, setUpdateModalState] = useState({
    isOpen: false,
    orderId: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    order: null as OrderResponse | null,
  });

  const { handleDownloadReceipt, downloadingOrderId } = useDownloadReceipt();

  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(filters.search, 400);

  const {
    isHydrated,
    viewId,
    editId,
    deleteId,
    openView,
    openEdit,
    openDelete,
    closeModal: closeRouteModal,
    updateUrlWithPage,
    handlePageChange,
  } = useAdminTableUrlState({
    baseRoute: ROUTES.ADMIN.TABLE_PENDING_ORDERS,
    filters: {
      search: filters.search,
      paymentStatus: filters.paymentStatus && filters.paymentStatus !== "ALL" ? filters.paymentStatus : "",
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
      pageNo: filters.pageNo,
      pageSize: globalPageSize !== AppDefault.PAGE_SIZE ? globalPageSize : "",
    },
    onInit: (params) => {
      if (params.search) dispatch(setSearchFilter(params.search));
      if (params.paymentStatus) dispatch(setPaymentStatusFilter(params.paymentStatus));
      if (params.startDate) dispatch(setStartDateFilter(params.startDate));
      if (params.endDate) dispatch(setEndDateFilter(params.endDate));
      if (params.pageNo) dispatch(setPageNo(Number(params.pageNo)));
      if (params.pageSize) dispatch(setGlobalPageSize(Number(params.pageSize)));
    },
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  const loadPendingTableOrders = useCallback(() => {
    if (!isHydrated) return;

    const requestParams: Record<string, unknown> = {
      search: debouncedSearch,
      pageNo: filters.pageNo,
      pageSize: globalPageSize,
      orderStatus: "PENDING",
    };

    if (filters.paymentStatus && filters.paymentStatus !== "ALL") {
      requestParams.paymentStatus = filters.paymentStatus;
    }

    if (filters.startDate && filters.startDate.trim()) {
      requestParams.startDate = filters.startDate;
    }

    if (filters.endDate && filters.endDate.trim()) {
      requestParams.endDate = filters.endDate;
    }

    dispatch(fetchAllOrderAdminService(requestParams));
  }, [
    isHydrated,
    dispatch,
    debouncedSearch,
    filters.pageNo,
    filters.paymentStatus,
    filters.startDate,
    filters.endDate,
    globalPageSize,
  ]);

  useEffect(() => {
    loadPendingTableOrders();
  }, [loadPendingTableOrders]);

  // STOMP WebSocket Live Connection — NO setInterval polling!
  const handleTableWebSocketEvent = useCallback(() => {
    loadPendingTableOrders();
    showToast.success("🔔 New table order event received!");
  }, [loadPendingTableOrders]);

  const { isConnected } = useTableWebSocket({
    businessId,
    onTableEvent: handleTableWebSocketEvent,
  });

  // Filter strictly for PENDING Table Orders
  const pendingTableOrdersContent = useMemo(() => {
    return orderContent.filter((ord) => {
      const name = ord.customerName || "";
      const phone = ord.customerPhone || "";
      const note = ord.customerNote || "";
      const isTable = phone === "Table Service" || name.startsWith("Table ") || note.includes("[Table ");
      return isTable && ord.orderStatus === "PENDING";
    });
  }, [orderContent]);

  const handleViewOrder = (order: OrderResponse) => {
    openView(order.id);
  };

  const handleEditOrder = (order: OrderResponse) => {
    openEdit(order.id);
  };

  const handleDeleteOrder = (order: OrderResponse) => {
    setDeleteState({ isOpen: true, order });
    openDelete(order.id);
  };

  const tableHandlers = useMemo(
    () => ({
      handleViewOrder,
      handleEditOrder,
      handleDeleteOrder,
      handleDownloadReceipt,
    }),
    [openView, openEdit, openDelete]
  );

  const columns = useMemo(
    () =>
      orderAdminTableColumns({
        data: orderData,
        handlers: tableHandlers,
        downloadingOrderId,
        hideDelivery: true,
        hidePayment: true,
      }),
    [orderData, tableHandlers, downloadingOrderId]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
  };

  const orderToDelete = useMemo(() => {
    if (deleteState.order) return deleteState.order;
    if (deleteId) {
      return orderContent.find((o) => o.id === deleteId) || null;
    }
    return null;
  }, [deleteState.order, deleteId, orderContent]);

  const handleDelete = async () => {
    const activeId = deleteId || deleteState.order?.id;
    if (!activeId) return;

    try {
      await dispatch(deleteOrderAdminService(activeId)).unwrap();
      showToast.success(
        `Order #${orderToDelete?.orderNumber ?? ""} deleted successfully`
      );
      closeDeleteModal();
      closeRouteModal();

      if (orderContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error(
        (error as { message?: string })?.message || "Failed to delete order"
      );
    }
  };

  const closeDetailModal = () => {
    setDetailModalState({ isOpen: false, orderId: "" });
  };

  const handleUpdateOrderFromDetail = () => {
    const orderId = viewId || detailModalState.orderId;
    if (orderId) {
      closeDetailModal();
      closeRouteModal();
      openEdit(orderId);
    }
  };

  const closeUpdateModal = () => {
    setUpdateModalState({ isOpen: false, orderId: "" });
  };

  const closeDeleteModal = () => {
    setDeleteState({ isOpen: false, order: null });
  };

  const handleClearAllFilters = () => {
    dispatch(setSearchFilter(""));
  };

  const filterConfig = useMemo((): FilterPanelConfig => ({
    title: "Table Pending Orders",
    searchValue: filters.search,
    searchPlaceholder: "Search pending table order...",
    onSearchChange: handleSearchChange,
    onClearAll: handleClearAllFilters,
    filters: [],
  }), [filters]);

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel
          config={filterConfig}
        />

        <DataTableWithPagination
          data={pendingTableOrdersContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No pending table orders found"
          getRowKey={(order) => order.id}
          currentPage={filters.pageNo}
          totalElements={pendingTableOrdersContent.length}
          totalPages={Math.ceil(pendingTableOrdersContent.length / globalPageSize) || 1}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      <OrderDetailModal
        orderId={viewId || detailModalState.orderId}
        isOpen={!!viewId || detailModalState.isOpen}
        onClose={() => {
          closeDetailModal();
          closeRouteModal();
        }}
        onUpdateOrder={handleUpdateOrderFromDetail}
      />

      <OrderUpdateModal
        orderId={editId || updateModalState.orderId}
        isOpen={!!editId || updateModalState.isOpen}
        onClose={() => {
          closeUpdateModal();
          closeRouteModal();
        }}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId || deleteState.isOpen}
        onClose={() => {
          closeDeleteModal();
          closeRouteModal();
        }}
        onDelete={handleDelete}
        title="Delete Order"
        description={`Are you sure you want to delete order #${
          orderToDelete?.orderNumber || ""
        }?`}
        itemName={orderToDelete?.orderNumber || ""}
        isSubmitting={operations.isDeleting}
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
