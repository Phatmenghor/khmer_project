"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, Suspense, useRef } from "react";
import { useDebounce } from "@/utils/debounce/debounce";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import { DownloadTemplateButton, ImportSpreadsheetButton } from "@/components/shared/button/custom-button";
import { downloadExchangeRateTemplate } from "@/utils/excel/exchange-rate-excel.utils";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { usePagination } from "@/hooks/use-pagination";
import { ExchangeRateStatus, ModalMode } from "@/constants/status/status";
import ExchangeRateModal from "@/features/master-data/components/exchange-rate-modal";
import { ExchangeRateDetailModal } from "@/features/master-data/components/exchange-rate-detail-modal";
import { useExchangeRateState } from "@/features/master-data/store/state/exchange-rate-state";
import { ExchangeRateResponseModel } from "@/features/master-data/store/models/response/exchange-rate-response";
import {
  deleteExchangeRateService,
  fetchAllMyBusinessExchangeRateService,
  fetchExchangeRateByIdService,
  toggleExchangeRateStatusService,
} from "@/features/master-data/store/thunks/exchange-rate-thunks";
import {
  setExchangeRateStatusFilter,
  resetState,
  setPageNo,
  setSearchFilter,
  updateExchangeRateInList,
} from "@/features/master-data/store/slice/exchange-rate-slice";
import { exchangeRateTableColumns } from "@/features/master-data/table/exchange-rate-table";
import { EXCHAGE_RATE_FILTER } from "@/constants/status/filter-status";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";
import { selectExchangeRateContent, selectSelectedExchangeRate } from "@/features/master-data/store/selectors/exchange-rate-selector";
import { useAdminTableUrlState } from "@/hooks/use-admin-table-url-state";

function ExchangeRatePageInner() {
  useAdminCleanup(resetState);
  const isInitialMount = useRef(true);
  const router = useRouter();

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
    baseRoute: ROUTES.ADMIN.EXCHANGE_RATE,
    filters: {
      search: filters.search,
      status: filters.isActive !== ExchangeRateStatus.ALL ? filters.isActive : "",
      pageNo: filters.pageNo,
      pageSize: globalPageSize !== AppDefault.PAGE_SIZE ? globalPageSize : "",
    },
    onInit: (params) => {
      if (params.search) dispatch(setSearchFilter(params.search));
      if (params.status) dispatch(setExchangeRateStatusFilter(params.status as ExchangeRateStatus));
      if (params.pageNo) dispatch(setPageNo(Number(params.pageNo)));
      if (params.pageSize) dispatch(setGlobalPageSize(Number(params.pageSize)));
    },
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    if (!isHydrated) return;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    debouncedSearch,
    filters.isActive,
    filters.pageNo,
    globalPageSize,
    isHydrated,
  ]);

  // ── Deep-link resolver ────────────────────────────────────────────────────
  const allExchangeRateContent = useAppSelector(selectExchangeRateContent);
  const selectedExchangeRate = useAppSelector(selectSelectedExchangeRate);

  const resolveExchangeRate = (id: string | null): ExchangeRateResponseModel | null => {
    if (!id) return null;
    return allExchangeRateContent.find(r => r.id === id) || (selectedExchangeRate?.id === id ? selectedExchangeRate : null);
  };

  const deleteRate = resolveExchangeRate(deleteId);
  const hasDeleteRate = !!deleteRate;

  useEffect(() => {
    if (deleteId && !hasDeleteRate) {
      dispatch(fetchExchangeRateByIdService(deleteId));
    }
  }, [deleteId, hasDeleteRate, dispatch]);

  // ── Table action handlers ─────────────────────────────────────────────────
  const handleCreateRate = () => openCreate();
  const handleEditRate = (rate: ExchangeRateResponseModel) => openEdit(rate.id || "");
  const handleViewRateDetail = (rate: ExchangeRateResponseModel) => openView(rate.id || "");

  const handleToggleExchangeRateStatus = async (rate: ExchangeRateResponseModel) => {
    if (!rate?.id) return;
    try {
      const result = await dispatch(toggleExchangeRateStatusService(rate)).unwrap();
      dispatch(updateExchangeRateInList(result));
      showToast.success(Messages.exchangeRate.updated);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.exchangeRate.updated);
    }
  };

  const handleDeleteRate = (rate: ExchangeRateResponseModel) => {
    if (exchangeRateContent.length === 1) {
      showToast.error(
        "Cannot delete the only exchange rate. At least one rate must exist."
      );
      return;
    }
    openDelete(rate.id || "");
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditRate,
      handleViewRateDetail,
      handleDeleteRate,
      handleToggleExchangeRateStatus,
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

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
  };

  const handleOpenImport = () => {
    router.push(ROUTES.ADMIN.EXCHANGE_RATE_IMPORT);
  };

  const filterConfig = useMemo((): FilterPanelConfig => ({
    title: "Exchange Rate",
    searchValue: filters.search,
    searchPlaceholder: "Search exchange rate...",
    onSearchChange: (e) => dispatch(setSearchFilter(e.target.value)),
    buttonText: "New",
    buttonTooltip: "Create a new exchange rate",
    onButtonClick: handleCreateRate,
    extraActions: (
      <div className="flex items-center gap-1">
        <DownloadTemplateButton onDownload={downloadExchangeRateTemplate} />
        <ImportSpreadsheetButton onClick={handleOpenImport} title="Import exchange rates from Excel" />
      </div>
    ),
    filters: [
      {
        id: "status",
        type: "select",
        label: "ExchangeRate Status",
        placeholder: "All Status",
        value: filters.isActive,
        onChange: (value) => dispatch(setExchangeRateStatusFilter(value as ExchangeRateStatus)),
        options: EXCHAGE_RATE_FILTER,
      },
    ],
  }), [filters.search, filters.isActive]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteExchangeRateService(deleteId)).unwrap();
      showToast.success(
        `Exchange Rate "${deleteRate?.usdToKhrRate ?? ""}" deleted successfully`,
      );
      closeModal();
      if (exchangeRateContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.exchangeRate.deleteFailed);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel config={filterConfig} essentialFilterIds={["status"]} />

        <DataTableWithPagination
          data={exchangeRateContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No Exchange Rate found"
          getRowKey={(exchange) => exchange.id}
          currentPage={pagination.currentPage}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      <ExchangeRateModal
        isOpen={createMode || !!editId}
        onClose={closeModal}
        exchangeRateId={editId || undefined}
        mode={createMode ? ModalMode.CREATE_MODE : ModalMode.UPDATE_MODE}
      />

      <ExchangeRateDetailModal
        exchangeRateId={viewId || undefined}
        isOpen={!!viewId}
        onClose={closeModal}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={closeModal}
        onDelete={handleDelete}
        title="Delete Exchange Rate"
        description={
          deleteRate?.status === "ACTIVE" && exchangeRateContent.filter(r => r.status === "ACTIVE").length === 1
            ? `This is the only ACTIVE exchange rate. When deleted, the next most recent exchange rate will be automatically activated to maintain business operations.`
            : `Are you sure you want to delete this exchange rate?`
        }
        itemName={
          deleteRate
            ? `USD to KHR: ${deleteRate.usdToKhrRate}${
                deleteRate.notes ? ` (${deleteRate.notes})` : ""
              }`
            : ""
        }
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}

export default function ExchangeRatePage() {
  return (
    <Suspense>
      <ExchangeRatePageInner />
    </Suspense>
  );
}
