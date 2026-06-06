"use client";

import { useEffect, useMemo, useState } from "react";
import { ROUTES } from "@/constants/app-routes/routes";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { usePagination } from "@/hooks/use-pagination";
import { useOrderAdminState } from "@/features/business/store/state/order-admin-state";
import {
  deleteOrderAdminService,
  fetchAllOrderAdminService,
} from "@/features/business/store/thunks/order-admin-thunks";
import {
  setPageNo,
  setSearchFilter,
  setOrderStatusFilter,
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
import { useAppSelector } from "@/store";
import { useDebounce } from "@/utils/debounce/debounce";
import {
  ORDER_STATUS_ADMIN_FILTER,
  PAYMENT_STATUS_ADMIN_FILTER,
} from "@/constants/status/filter-status";
import { useDownloadReceipt } from "@/hooks/use-download-receipt";
import { CollapsibleFilterPanel } from "@/features/business/components/collapsible-filter-panel";
import { FilterPanelConfig } from "@/features/business/components/filter-types";
import { useRouter } from "next/navigation";

export default function OrdersAdminPage() {
  useAdminCleanup(resetState);

  const router = useRouter();

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

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.ORDERS,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    const requestParams: Record<string, unknown> = {
      search: debouncedSearch,
      pageNo: filters.pageNo,
      pageSize: globalPageSize,
    };

    if (filters.orderStatus && filters.orderStatus !== "ALL") {
      requestParams.orderStatus = filters.orderStatus;
    }

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
    dispatch,
    debouncedSearch,
    filters.pageNo,
    filters.orderStatus,
    filters.paymentStatus,
    filters.startDate,
    filters.endDate,
    globalPageSize,
  ]);

  const handleViewOrder = (order: OrderResponse) => {
    setDetailModalState({ isOpen: true, orderId: order.id });
  };

  const handleEditOrder = (order: OrderResponse) => {
    setUpdateModalState({ isOpen: true, orderId: order.id });
  };

  const handleDeleteOrder = (order: OrderResponse) => {
    setDeleteState({ isOpen: true, order });
  };

  const tableHandlers = useMemo(
    () => ({
      handleViewOrder,
      handleEditOrder,
      handleDeleteOrder,
      handleDownloadReceipt,
    }),
    []
  );

  const columns = useMemo(
    () =>
      orderAdminTableColumns({
        data: orderData,
        handlers: tableHandlers,
        downloadingOrderId,
      }),
    [orderState, tableHandlers, downloadingOrderId]
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

  const handleDelete = async () => {
    if (!deleteState.order?.id) return;

    try {
      await dispatch(deleteOrderAdminService(deleteState.order.id)).unwrap();
      showToast.success(
        `Order #${deleteState.order.orderNumber ?? ""} deleted successfully`
      );
      closeDeleteModal();

      if (orderContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || "Failed to delete order");
    }
  };

  const closeDetailModal = () => {
    setDetailModalState({ isOpen: false, orderId: "" });
  };

  const handleUpdateOrderFromDetail = () => {
    const orderId = detailModalState.orderId;
    if (orderId) {
      closeDetailModal();
      setUpdateModalState({ isOpen: true, orderId });
    }
  };

  const closeUpdateModal = () => {
    setUpdateModalState({ isOpen: false, orderId: "" });
  };

  const closeDeleteModal = () => {
    setDeleteState({ isOpen: false, order: null });
  };

  const handleOrderStatusChange = (value: string | number | boolean | null | undefined) => {
    dispatch(setOrderStatusFilter(String(value ?? "")));
  };

  const handlePaymentStatusChange = (value: string | number | boolean | null | undefined) => {
    dispatch(setPaymentStatusFilter(String(value ?? "")));
  };

  const handleStartDateChange = (value: string | number | boolean | null | undefined) => {
    const dateString = String(value ?? "");
    dispatch(setStartDateFilter(dateString.trim() ? dateString : undefined));
  };

  const handleEndDateChange = (value: string | number | boolean | null | undefined) => {
    const dateString = String(value ?? "");
    dispatch(setEndDateFilter(dateString.trim() ? dateString : undefined));
  };

  const filterConfig = useMemo((): FilterPanelConfig => ({
    title: "Order Management",
    searchValue: filters.search,
    searchPlaceholder: "Search order...",
    onSearchChange: handleSearchChange,
    buttonText: "New Order",
    buttonDisabled: false,
    onButtonClick: () => router.push(ROUTES.ADMIN.POS),
    filters: [
      {
        id: "orderStatus",
        type: "select",
        label: "Order Status",
        placeholder: "All Status",
        value: filters.orderStatus || "ALL",
        onChange: handleOrderStatusChange,
        options: ORDER_STATUS_ADMIN_FILTER,
      },
      {
        id: "paymentStatus",
        type: "select",
        label: "Payment Status",
        placeholder: "All Payment",
        value: filters.paymentStatus || "ALL",
        onChange: handlePaymentStatusChange,
        options: PAYMENT_STATUS_ADMIN_FILTER,
      },
      {
        id: "startDate",
        type: "date",
        label: "From Date",
        placeholder: "Select start date",
        value: filters.startDate || "",
        onChange: handleStartDateChange,
      },
      {
        id: "endDate",
        type: "date",
        label: "To Date",
        placeholder: "Select end date",
        value: filters.endDate || "",
        onChange: handleEndDateChange,
      },
    ],
  }), [filters, router]);

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel
          config={filterConfig}
          essentialFilterIds={["orderStatus", "paymentStatus"]}
        />

        <DataTableWithPagination
          data={orderContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No orders found"
          getRowKey={(order) => order.id}
          currentPage={filters.pageNo}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      <OrderDetailModal
        orderId={detailModalState.orderId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
        onUpdateOrder={handleUpdateOrderFromDetail}
      />

      <OrderUpdateModal
        orderId={updateModalState.orderId}
        isOpen={updateModalState.isOpen}
        onClose={closeUpdateModal}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Order"
        description={`Are you sure you want to delete order #${
          deleteState.order?.orderNumber || ""
        }?`}
        itemName={deleteState.order?.orderNumber || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
