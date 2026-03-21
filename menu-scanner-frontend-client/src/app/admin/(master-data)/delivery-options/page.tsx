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
import { DELIVERY_OPTIONS_FILTER } from "@/constants/status/filter-status";
import { ModalMode, Status } from "@/constants/status/status";
import { useDeliveryOptionsState } from "@/redux/features/master-data/store/state/delivery-options-state";
import { DeliveryOptionsResponseModel } from "@/redux/features/master-data/store/models/response/delivery-options-response";
import {
  setPageNo,
  setSearchFilter,
  setStatusFilter,
  resetState,
} from "@/redux/features/master-data/store/slice/delivery-options-slice";
import {
  deleteDeliveryOptionsService,
  fetchAllDeliveryOptionsService,
} from "@/redux/features/master-data/store/thunks/delivery-options-thunks";
import { deliveryOptionsTableColumns } from "@/redux/features/master-data/table/delivery-options-table";
import DeliveryOptionsModal from "@/redux/features/master-data/components/delivery-options-modal";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";

export default function DeliveryOptionsPage() {
  // Clean up state when leaving admin area (performance optimization)
  useAdminCleanup(resetState);
  const searchParams = useSearchParams();

  // Redux state
  const {
    deliveryOptionsState,
    deliveryOptionsData,
    deliveryOptionsContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useDeliveryOptionsState();

  // Local UI state for modals only
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    deliveryOptionsId: "",
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    deliveryOptionsId: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    deliveryOptions: null as DeliveryOptionsResponseModel | null,
  });

  // Global page size from global settings (synced across all admin pages)
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.EXCHANGE_RATE,
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
      fetchAllDeliveryOptionsService({
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
      deliveryOptionsId: "",
    });
  };

  const handleEditDeliveryOptions = (
    deliveryOptions: DeliveryOptionsResponseModel,
  ) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      deliveryOptionsId: deliveryOptions?.id || "",
    });
  };

  const handleDeliveryOptionsViewDetail = (
    deliveryOptions: DeliveryOptionsResponseModel,
  ) => {
    setDetailModalState({
      isOpen: true,
      deliveryOptionsId: deliveryOptions.id || "",
    });
  };

  const handleDeleteDeliveryOptions = (
    deliveryOptions: DeliveryOptionsResponseModel,
  ) => {
    setDeleteState({
      isOpen: true,
      deliveryOptions: deliveryOptions,
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditDeliveryOptions,
      handleDeliveryOptionsViewDetail,
      handleDeleteDeliveryOptions,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      deliveryOptionsTableColumns({
        data: deliveryOptionsData,
        handlers: tableHandlers,
      }),
    [deliveryOptionsState, tableHandlers],
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
    if (!deleteState.deliveryOptions?.id) return;

    try {
      await dispatch(
        deleteDeliveryOptionsService(deleteState.deliveryOptions.id),
      ).unwrap();

      showToast.success(
        `Delivery options "${
          deleteState.deliveryOptions.name ?? ""
        }" deleted successfully`,
      );

      closeDeleteModal();

      // Navigate to previous page if this was the last item
      if (deliveryOptionsContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete Delivery options");
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      deliveryOptionsId: "",
    });
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      deliveryOptionsId: "",
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      deliveryOptions: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          breadcrumbs={[
            { label: "Dashboard", href: ROUTES.ADMIN.ROOT },
            { label: "Delivery Options", href: "" },
          ]}
          title="Delivery Options Information"
          buttonTooltip="Create a new delivery options"
          searchValue={filters.search}
          searchPlaceholder="Search delivery options..."
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreateDeliveryOptions}
        >
          <div className="flex flex-wrap items-center gap-2">
            <CustomSelect
              options={DELIVERY_OPTIONS_FILTER}
              value={filters.status}
              placeholder="All Status"
              onValueChange={(value) => handleStatusChange(value as Status)}
              label="Delivery Options Status"
            />
          </div>
        </CardHeaderSection>

        {/* Data Table with Pagination */}
        <DataTableWithPagination
          data={deliveryOptionsContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No Delivery options found"
          getRowKey={(deliveryOptions) => deliveryOptions.id}
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
      <DeliveryOptionsModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        deliveryOptionsId={modalState.deliveryOptionsId}
        mode={modalState.mode}
      />

{/* Modals Delete name platform */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Delivery Options"
        description={`Are you sure you want to delete this Delivery Options ${
          deleteState.deliveryOptions?.name ||
          deleteState.deliveryOptions?.description
        }?`}
        itemName={
          deleteState.deliveryOptions?.name ||
          deleteState.deliveryOptions?.description
        }
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
