"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, Suspense, useRef } from "react";
import { useDebounce } from "@/utils/debounce/debounce";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import { DownloadTemplateButton, ImportSpreadsheetButton } from "@/components/shared/button/custom-button";
import { downloadPaymentOptionTemplate } from "@/utils/excel/payment-option-excel.utils";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { usePagination } from "@/hooks/use-pagination";
import { ModalMode, Status } from "@/constants/status/status";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";
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
  fetchPaymentOptionByIdService,
  updatePaymentOptionService,
} from "@/features/master-data/store/thunks/payment-options-thunks";
import { paymentOptionsTableColumns } from "@/features/master-data/table/payment-options-table";
import { PaymentOptionResponse } from "@/features/master-data/store/models/response/payment-option-response";
import {
  selectPaymentOptionsContent,
  selectSelectedPaymentOption,
} from "@/features/master-data/store/selectors/payment-options-selectors";
import { useAdminTableUrlState } from "@/hooks/use-admin-table-url-state";

function PaymentOptionsPageInner() {
  useAdminCleanup(resetState);
  const isInitialMount = useRef(true);
  const router = useRouter();

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

  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(filters.search, AppDefault.DEFAULT_DEBOUNCE_MS);

  const {
    isHydrated,
    viewId,
    editId,
    deleteId,
    createMode,
    openView,
    openEdit,
    openDelete,
    openCreate,
    closeModal,
    updateUrlWithPage,
    handlePageChange,
  } = useAdminTableUrlState({
    baseRoute: ROUTES.ADMIN.PAYMENT_OPTIONS,
    filters: {
      search: filters.search,
      status: filters.status !== Status.ALL ? filters.status : "",
      pageNo: filters.pageNo,
      pageSize: globalPageSize !== AppDefault.PAGE_SIZE ? globalPageSize : "",
    },
    onInit: (params) => {
      if (params.search) dispatch(setSearchFilter(params.search));
      if (params.status) dispatch(setStatusFilter(params.status as Status));
      if (params.pageNo) dispatch(setPageNo(Number(params.pageNo)));
      if (params.pageSize) dispatch(setGlobalPageSize(Number(params.pageSize)));
    },
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    if (!isHydrated) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (paymentOptionsContent && paymentOptionsContent.length > 0) {
        return;
      }
    }

    dispatch(
      fetchMyBusinessPaymentOptionsService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        ...(filters.status !== Status.ALL && { statuses: [filters.status] }),
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, debouncedSearch, filters.status, filters.pageNo, globalPageSize, isHydrated]);

  // ── Deep-link resolver ────────────────────────────────────────────────────
  const allPaymentOptionsContent = useAppSelector(selectPaymentOptionsContent);
  const selectedPaymentOption = useAppSelector(selectSelectedPaymentOption);

  const resolvePaymentOption = (id: string | null): PaymentOptionResponse | null => {
    if (!id) return null;
    return allPaymentOptionsContent.find(p => p.id === id) || (selectedPaymentOption?.id === id ? selectedPaymentOption : null);
  };

  const deletePaymentOption = resolvePaymentOption(deleteId);
  const hasDeletePaymentOption = !!deletePaymentOption;

  useEffect(() => {
    if (deleteId && !hasDeletePaymentOption) {
      dispatch(fetchPaymentOptionByIdService(deleteId));
    }
  }, [deleteId, hasDeletePaymentOption, dispatch]);

  // ── Table action handlers ─────────────────────────────────────────────────
  const handleCreatePaymentOption = () => openCreate();
  const handleEditPaymentOption = (paymentOption: PaymentOptionResponse) => openEdit(paymentOption.id || "");
  const handleViewPaymentOption = (paymentOption: PaymentOptionResponse) => openView(paymentOption.id || "");
  const handleDeletePaymentOption = (paymentOption: PaymentOptionResponse) => openDelete(paymentOption.id || "");

  const handleTogglePaymentOptionStatus = async (paymentOption: PaymentOptionResponse) => {
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
            image: paymentOption.image,
            status: newStatus,
          },
        }),
      ).unwrap();
      showToast.success(Messages.payment.statusUpdated);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.payment.statusUpdateFailed);
    }
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

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
  };

  const handleOpenImport = () => {
    router.push(ROUTES.ADMIN.PAYMENT_OPTIONS_IMPORT);
  };

  const filterConfig = useMemo((): FilterPanelConfig => ({
    title: "Payment Options Information",
    searchValue: filters.search,
    searchPlaceholder: "Search payment options...",
    onSearchChange: (e) => dispatch(setSearchFilter(e.target.value)),
    buttonText: "New",
    buttonTooltip: "Create a new payment option",
    onButtonClick: handleCreatePaymentOption,
    extraActions: (
      <div className="flex items-center gap-1">
        <DownloadTemplateButton onDownload={downloadPaymentOptionTemplate} />
        <ImportSpreadsheetButton onClick={handleOpenImport} title="Import payment options from Excel" />
      </div>
    ),
    filters: [
      {
        id: "status",
        type: "select",
        label: "Payment Options Status",
        placeholder: "All Status",
        value: filters.status,
        onChange: (value) => dispatch(setStatusFilter(value as Status)),
        options: STATUS_FILTER,
      },
    ],
  }), [filters.search, filters.status]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deletePaymentOptionService(deleteId)).unwrap();
      showToast.success(
        `Payment option "${deletePaymentOption?.name ?? ""}" deleted successfully`,
      );
      closeModal();
      if (paymentOptionsContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.payment.deleteFailed);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel config={filterConfig} essentialFilterIds={["status"]} />

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

      <PaymentOptionsModal
        isOpen={createMode || !!editId}
        mode={createMode ? ModalMode.CREATE_MODE : ModalMode.UPDATE_MODE}
        paymentOptionId={editId || undefined}
        onClose={closeModal}
      />

      <PaymentOptionDetailModal
        paymentOptionId={viewId || undefined}
        isOpen={!!viewId}
        onClose={closeModal}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={closeModal}
        onDelete={handleDelete}
        title="Delete Payment Option"
        description={`Are you sure you want to delete the payment option "${deletePaymentOption?.name || ""}"? This action cannot be undone.`}
        itemName={deletePaymentOption?.name || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}

export default function PaymentOptionsPage() {
  return (
    <Suspense>
      <PaymentOptionsPageInner />
    </Suspense>
  );
}
