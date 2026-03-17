"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { usePagination } from "@/redux/store/use-pagination";
import { ModalMode, Status } from "@/constants/status/status";
import {
  setPageNo,
  setSearchFilter,
  setStatusFilter,
  resetState,
} from "@/redux/features/master-data/store/slice/order-status-slice";
import {
  deleteDeliveryOptionsService,
  fetchAllDeliveryOptionsService,
} from "@/redux/features/master-data/store/thunks/delivery-options-thunks";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";
import { useOrderStatusState } from "@/redux/features/master-data/store/state/order-status-state";
import { OrderStatusResponseModel } from "@/redux/features/master-data/store/models/response/order-status-response";
import {
  deleteOrderStatusService,
  fetchAllOrderStatusService,
} from "@/redux/features/master-data/store/thunks/order-status-thunks";
import { orderStatusTableColumns } from "@/redux/features/master-data/table/order-status-table";
import {
  DELIVERY_OPTIONS_FILTER,
  ORDER_STATUS_FILTER,
} from "@/constants/status/filter-status";
import OrderStatusModal from "@/redux/features/master-data/components/order-status-modal";
import { OrderStatusDetailModal } from "@/redux/features/master-data/components/delivery-options-detail-modal";

export default function OrderStatusPage() {
  // Clean up state when leaving admin area (performance optimization)
  useAdminCleanup(resetState);
  const searchParams = useSearchParams();

  // Redux state
  const {
    orderStatusState,
    orderStatusData,
    orderStatusContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useOrderStatusState();

  // Local UI state for modals only
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    orderStatusId: "",
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    orderStatusId: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    orderStatus: null as OrderStatusResponseModel | null,
  });

  // Global page size from global settings (synced across all admin pages)
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.ORDER_STATUS,
  });

  // Initialize URL and Redux state on mount
  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;

    if (pageFromUrl !== pagination.currentPage) {
      dispatch(setPageNo(pageFromUrl));
    }
  }, [searchParams, filters.pageNo, dispatch]);

  // Fetch delivery options when filters change
  useEffect(() => {
    dispatch(
      fetchAllOrderStatusService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        statuses: filters.status == Status.ALL ? [] : [filters.status],
      }),
    );
  }, [
    dispatch,
    debouncedSearch,
    filters.status,
    filters.pageNo,
    globalPageSize,
  ]);

  // Event handlers
  const handleCreateDeliveryOptions = () => {
    setModalState({
      isOpen: true,
      mode: ModalMode.CREATE_MODE,
      orderStatusId: "",
    });
  };

  const handleEditOrderStatus = (orderStatus: OrderStatusResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      orderStatusId: orderStatus?.id || "",
    });
  };

  const handleOrderStatusViewDetail = (
    orderStatus: OrderStatusResponseModel,
  ) => {
    setDetailModalState({
      isOpen: true,
      orderStatusId: orderStatus.id || "",
    });
  };

  const handleDeleteOrderStatus = (orderStatus: OrderStatusResponseModel) => {
    setDeleteState({
      isOpen: true,
      orderStatus: orderStatus,
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditOrderStatus,
      handleOrderStatusViewDetail,
      handleDeleteOrderStatus,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      orderStatusTableColumns({
        data: orderStatusData,
        handlers: tableHandlers,
      }),
    [orderStatusState, tableHandlers],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleStatusChange = (status: Status) => {
    dispatch(setStatusFilter(status));
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
    if (!deleteState.orderStatus?.id) return;

    try {
      await dispatch(
        deleteOrderStatusService(deleteState.orderStatus.id),
      ).unwrap();

      showToast.success(
        `Order Status "${
          deleteState.orderStatus.name ?? ""
        }" deleted successfully`,
      );

      closeDeleteModal();

      // Navigate to previous page if this was the last item
      if (orderStatusContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete Order Status");
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      orderStatusId: "",
    });
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      orderStatusId: "",
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      orderStatus: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          breadcrumbs={[
            { label: "Dashboard", href: ROUTES.ADMIN.ROOT },
            { label: "Order Status", href: "" },
          ]}
          title="Order Status Information"
          buttonTooltip="Create a new order status"
          searchValue={filters.search}
          searchPlaceholder="Search order status..."
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreateDeliveryOptions}
        >
          <div className="flex flex-wrap items-center gap-2">
            <CustomSelect
              options={ORDER_STATUS_FILTER}
              value={filters.status}
              placeholder="All Status"
              onValueChange={(value) => handleStatusChange(value as Status)}
              label="Order Status"
            />
          </div>
        </CardHeaderSection>

        {/* Data Table with Pagination */}
        <DataTableWithPagination
          data={orderStatusContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No Order Status found"
          getRowKey={(orderStatus) => orderStatus.id}
          currentPage={filters.pageNo}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      {/* Modals Add/Edit */}
      <OrderStatusModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        orderStatusId={modalState.orderStatusId}
        mode={modalState.mode}
      />

      {/* Modals Order Status Detail */}
      <OrderStatusDetailModal
        orderStatusId={detailModalState.orderStatusId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {/* Modals Delete name platform */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Order Status"
        description={`Are you sure you want to delete this Order Status ${
          deleteState.orderStatus?.name
        }?`}
        itemName={deleteState.orderStatus?.name}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
