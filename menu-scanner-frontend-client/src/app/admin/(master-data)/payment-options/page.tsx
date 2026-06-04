"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { usePagination } from "@/hooks/use-pagination";
import { ModalMode, Status } from "@/constants/status/status";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppDispatch, useAppSelector } from "@/store";
import PaymentOptionsModal from "@/features/master-data/components/payment-options-modal";
import { PaymentOptionDetailModal } from "@/features/master-data/components/payment-options-detail-modal";
import { STATUS_FILTER } from "@/constants/status/filter-status";
import { usePaymentOptionsState } from "@/features/master-data/store/state/payment-options-state";
import {
  setPageNo,
  setSearchFilter,
  setStatusFilter,
  resetState,
} from "@/features/master-data/store/slice/payment-options-slice";
import {
  deletePaymentOptionService,
  fetchMyBusinessPaymentOptionsService,
  updatePaymentOptionService,
} from "@/features/master-data/store/thunks/payment-options-thunks";
import { paymentOptionsTableColumns } from "@/features/master-data/table/payment-options-table";
import { PaymentOptionResponse } from "@/features/master-data/store/models/response/payment-option-response";

export default function PaymentOptionsPage() {

  useAdminCleanup(resetState);


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


  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.PAYMENT_OPTIONS,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });


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
      showToast.success(Messages.payment.statusUpdated);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.payment.statusUpdateFailed);
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


      if (paymentOptionsContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.payment.deleteFailed);
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
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CardHeaderSection
          title="Payment Options Information"
          buttonTooltip="Create a new payment option"
          searchValue={filters.search}
          searchPlaceholder="Search payment options..."
          buttonIcon={<Plus className="w-2 h-2" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreatePaymentOption}
        >
          <div className="flex flex-wrap items-center gap-1">
            <CustomSelect
              options={STATUS_FILTER}
              value={filters.status}
              onValueChange={handleStatusChange}
              placeholder="All Status"
            />
          </div>
        </CardHeaderSection>

        {}
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

      {}
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
