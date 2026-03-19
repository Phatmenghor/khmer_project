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
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";
import PaymentOptionsModal from "@/redux/features/master-data/components/payment-options-modal";
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
  fetchAllPaymentOptionsService,
} from "@/redux/features/master-data/store/thunks/payment-options-thunks";
import { paymentOptionsTableColumns } from "@/redux/features/master-data/table/payment-options-table";
import { PaymentOptionResponse } from "@/redux/features/master-data/store/models/response/payment-option-response";

export default function PaymentOptionsPage() {
  // Clean up state when leaving admin area
  useAdminCleanup(resetState);
  const searchParams = useSearchParams();

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
    paymentOptionId: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    paymentOption: null as PaymentOptionResponse | null,
  });

  // Global page size from global settings
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.PAYMENT_OPTIONS,
  });

  // Initialize URL and Redux state on mount
  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;

    if (pageFromUrl !== pagination.currentPage) {
      dispatch(setPageNo(pageFromUrl));
    }
  }, [searchParams, filters.pageNo, dispatch]);

  // Fetch payment options when filters change
  useEffect(() => {
    dispatch(
      fetchAllPaymentOptionsService({
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
  const handleCreatePaymentOption = () => {
    setModalState({
      isOpen: true,
      mode: ModalMode.CREATE_MODE,
      paymentOptionId: "",
    });
  };

  const handleEditPaymentOption = (
    paymentOption: PaymentOptionResponse,
  ) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      paymentOptionId: paymentOption?.id || "",
    });
  };

  const handleDeletePaymentOption = (
    paymentOption: PaymentOptionResponse,
  ) => {
    setDeleteState({
      isOpen: true,
      paymentOption: paymentOption,
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditPaymentOption,
      handleDeletePaymentOption,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      paymentOptionsTableColumns({
        data: paymentOptionsData,
        handlers: tableHandlers,
      }),
    [paymentOptionsState, tableHandlers],
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
      paymentOptionId: "",
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      paymentOption: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          breadcrumbs={[
            { label: "Dashboard", href: ROUTES.ADMIN.ROOT },
            { label: "Payment Options", href: "" },
          ]}
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
          columns={columns}
          data={paymentOptionsContent}
          isLoading={isLoading.fetch}
          pagination={{
            pageNo: pagination.currentPage,
            pageSize: pagination.pageSize,
            totalElements: pagination.totalElements,
            totalPages: pagination.totalPages,
          }}
          onPageChange={handlePageChangeWrapper}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Modals */}
      <PaymentOptionsModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        paymentOptionId={modalState.paymentOptionId}
        onClose={closeModal}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Payment Option"
        description={`Are you sure you want to delete the payment option "${deleteState.paymentOption?.name}"? This action cannot be undone.`}
        isLoading={operations.delete}
      />
    </div>
  );
}
