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
import { ExchangeRateStatus, ModalMode } from "@/constants/status/status";
import ExchangeRateModal from "@/redux/features/master-data/components/exchange-rate-modal";
import { ExchangeRateDetailModal } from "@/redux/features/master-data/components/exchange-rate-detail-modal";
import { useExchangeRateState } from "@/redux/features/master-data/store/state/exchange-rate-state";
import { ExchangeRateResponseModel } from "@/redux/features/master-data/store/models/response/exchange-rate-response";
import {
  deleteExchangeRateService,
  fetchAllMyBusinessExchangeRateService,
} from "@/redux/features/master-data/store/thunks/exchange-rate-thunks";
import {
  setExchangeRateStatusFilter,
  resetState,
  setPageNo,
  setSearchFilter,
} from "@/redux/features/master-data/store/slice/exchange-rate-slice";
import { exchangeRateTableColumns } from "@/redux/features/master-data/table/exchange-rate-table";
import { EXCHAGE_RATE_FILTER } from "@/constants/status/filter-status";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/redux/store";

export default function ExchangeRatePage() {
  // Clean up state when leaving admin area (performance optimization)
  useAdminCleanup(resetState);

  // Redux state
  const {
    exchangeRateState,
    exchangeRateData,
    exchangeRateContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useExchangeRateState();

  // Local UI state for modals only
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    exchangeRate: null as ExchangeRateResponseModel | null,
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    exchangeRate: null as ExchangeRateResponseModel | null,
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    exchage: null as ExchangeRateResponseModel | null,
  });

  // Global page size from global settings (synced across all admin pages)
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.EXCHANGE_RATE,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  // Fetch exchange rate when filters change
  useEffect(() => {
    dispatch(
      fetchAllMyBusinessExchangeRateService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        status:
          filters.isActive === ExchangeRateStatus.ALL
            ? undefined
            : (filters.isActive as "ACTIVE" | "INACTIVE"),
      }),
    );
  }, [
    dispatch,
    debouncedSearch,
    filters.isActive,
    filters.pageNo,
    globalPageSize,
  ]);

  // Event handlers
  const handleCreateUser = () => {
    setModalState({
      isOpen: true,
      mode: ModalMode.CREATE_MODE,
      exchangeRate: null,
    });
  };

  const handleEditRate = (exchage: ExchangeRateResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      exchangeRate: exchage,
    });
  };

  const handleViewRateDetail = (exchage: ExchangeRateResponseModel) => {
    setDetailModalState({
      isOpen: true,
      exchangeRate: exchage,
    });
  };

  const handleDeleteRate = (exchage: ExchangeRateResponseModel) => {
    // Check if this is the only rate total for the business
    if (exchangeRateContent.length === 1) {
      showToast.error(
        "Cannot delete the only exchange rate. At least one rate must exist."
      );
      return;
    }

    setDeleteState({
      isOpen: true,
      exchage: exchage,
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditRate,
      handleViewRateDetail,
      handleDeleteRate,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      exchangeRateTableColumns({
        data: exchangeRateData,
        handlers: tableHandlers,
      }),
    [exchangeRateState, tableHandlers],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleStatusChange = (status: ExchangeRateStatus) => {
    dispatch(setExchangeRateStatusFilter(status));
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
    if (!deleteState.exchage?.id) return;

    try {
      await dispatch(
        deleteExchangeRateService(deleteState.exchage.id),
      ).unwrap();

      showToast.success(
        `Exchange Rate "${
          deleteState.exchage.usdToKhrRate ?? ""
        }" deleted successfully`,
      );

      closeDeleteModal();

      // Navigate to previous page if this was the last item
      if (exchangeRateContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: any) {
      showToast.error(error || "Failed to delete Exchange Rate");
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      exchangeRate: null,
    });
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      exchangeRate: null,
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      exchage: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CardHeaderSection
          title="Exchange Rate"
          buttonTooltip="Create a new exchange rate"
          searchValue={filters.search}
          searchPlaceholder="Search exchange rate..."
          buttonIcon={<Plus className="w-3 h-3" />}
          buttonText="New"
          onSearchChange={handleSearchChange}
          openModal={handleCreateUser}
        >
          <div className="flex flex-wrap items-center gap-2">
            <CustomSelect
              options={EXCHAGE_RATE_FILTER}
              value={filters.isActive}
              placeholder="All Status"
              onValueChange={(value) =>
                handleStatusChange(value as ExchangeRateStatus)
              }
              label="ExchangeRate Status"
            />
          </div>
        </CardHeaderSection>

        {/* Data Table with Pagination */}
        <DataTableWithPagination
          data={exchangeRateContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No Exchange Rate found"
          getRowKey={(exchange) => exchange.id}
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
      <ExchangeRateModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        exchangeRate={modalState.exchangeRate}
        mode={modalState.mode}
      />

      {/* Modals exchange rate platform Detail */}
      <ExchangeRateDetailModal
        exchangeRate={detailModalState.exchangeRate}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {/* Modals Delete exchange rate */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Exchange Rate"
        description={
          deleteState.exchage?.status === "ACTIVE" && exchangeRateContent.filter(r => r.status === "ACTIVE").length === 1
            ? `This is the only ACTIVE exchange rate. When deleted, the next most recent exchange rate will be automatically activated to maintain business operations.`
            : `Are you sure you want to delete this exchange rate?`
        }
        itemName={
          deleteState.exchage
            ? `USD to KHR: ${deleteState.exchage.usdToKhrRate}${
                deleteState.exchage.notes ? ` (${deleteState.exchage.notes})` : ""
              }`
            : ""
        }
        isSubmitting={operations.isDeleting}
        maxWidth="lg"
      />
    </div>
  );
}
