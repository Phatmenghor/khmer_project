"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import PaymentOptionsModal from "@/redux/features/master-data/components/payment-options-modal";
import { PaymentOptionDetailModal } from "@/redux/features/master-data/components/payment-options-detail-modal";
import { STATUS_FILTER } from "@/constants/status/filter-status";
import { usePaymentOptionsState } from "@/redux/features/master-data/store/state/payment-options-state";
import {
  setPageNo,
  setSearchFilter,
  setStatusFilter,
  resetState,
} from "@/redux/features/master-data/store/slice/payment-options-slice";
import {
  deletePaymentOptionService,
  fetchMyBusinessPaymentOptionsService,
  updatePaymentOptionService,
} from "@/redux/features/master-data/store/thunks/payment-options-thunks";
import { paymentOptionsTableColumns } from "@/redux/features/master-data/table/payment-options-table";
import { PaymentOptionResponse } from "@/redux/features/master-data/store/models/response/payment-option-response";

export default function PaymentOptionsPage() {
  // Clean up state when leaving admin area
  useAdminCleanup(resetState);

  // Redux state
  const {
    paymentOptionsState,
    paymentOptionsData,
    paymentOptionsContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = usePaymentOptionsState();

  // Local UI state for modals only
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    paymentOption: null as PaymentOptionResponse | null,
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    paymentOption: null as PaymentOptionResponse | null,
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    paymentOption: null as PaymentOptionResponse | null,
  });

  // Global page size from global settings
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.PAYMENT_OPTIONS,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  // Fetch payment options for current user's business when filters change
  useEffect(() => {
    dispatch(
      fetchMyBusinessPaymentOptionsService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        ...(filters.status !== Status.ALL && { statuses: [filters.status] }),
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
  const handleCreatePaymentOption = () => {
    setModalState({
      isOpen: true,
      mode: ModalMode.CREATE_MODE,
      paymentOption: null,
    });
  };

  const handleEditPaymentOption = (paymentOption: PaymentOptionResponse) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      paymentOption: paymentOption,
    });
  };

  const handleDeletePaymentOption = (paymentOption: PaymentOptionResponse) => {
    setDeleteState({
      isOpen: true,
      paymentOption: paymentOption,
    });
  };

  const handleTogglePaymentOptionStatus = async (
    paymentOption: PaymentOptionResponse,
  ) => {
    try {
      const newStatus =
        paymentOption.status === Status.ACTIVE
          ? Status.INACTIVE
          : Status.ACTIVE;
      await dispatch(
        updatePaymentOptionService({
          id: paymentOption.id,
          payload: {
            name: paymentOption.name,
            paymentOptionType: paymentOption.paymentOptionType,
            status: newStatus,
          },
        }),
      ).unwrap();
      showToast.success("Payment option status updated");
    } catch (error: any) {
      showToast.error(error || "Failed to update payment option status");
    }
  };

  const handleViewPaymentOption = (
    paymentOption: PaymentOptionResponse,
  ) => {
    setDetailModalState({
      isOpen: true,
      paymentOption: paymentOption,
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleViewPaymentOption,
      handleEditPaymentOption,
      handleDeletePaymentOption,
      handleTogglePaymentOptionStatus,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      paymentOptionsTableColumns({
        data: paymentOptionsData,
        handlers: tableHandlers,
      }),
    [paymentOptionsData, tableHandlers],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleStatusChange = (status: string) => {
    dispatch(setStatusFilter(status as Status));
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
    if (!deleteState.paymentOption?.id) return;

    try {
      await dispatch(
        deletePaymentOptionService(deleteState.paymentOption.id),
      ).unwrap();

      showToast.success(
        `Payment option "${
          deleteState.paymentOption.name ?? ""
        }" deleted successfully`,
      );

      closeDeleteModal();

      // Navigate to previous page if this was the last item
      if (paymentOptionsContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete Payment option");
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      paymentOption: null,
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      paymentOption: null,
    });
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      paymentOption: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          title="Payment Options Information"
          buttonTooltip="Create a new payment option"
          searchValue={filters.search}
          searchPlaceholder="Search payment options..."
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreatePaymentOption}
        >
          <div className="flex flex-wrap items-center gap-2">
            <CustomSelect
              options={STATUS_FILTER}
              value={filters.status}
              onValueChange={handleStatusChange}
              placeholder="All Status"
            />
          </div>
        </CardHeaderSection>

        {/* Data Table */}
        <DataTableWithPagination
          data={paymentOptionsContent}
          columns={columns}
          loading={isLoading.fetch}
          emptyMessage="No payment options found"
          getRowKey={(option) => option.id}
          currentPage={pagination.currentPage}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      {/* Modals */}
      <PaymentOptionsModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        paymentOption={modalState.paymentOption}
        onClose={closeModal}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Payment Option"
        description={`Are you sure you want to delete the payment option "${deleteState.paymentOption?.name}"? This action cannot be undone.`}
      />

      <PaymentOptionDetailModal
        paymentOption={detailModalState.paymentOption}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />
    </div>
  );
}
