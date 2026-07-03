"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, Suspense } from "react";
import { useDebounce } from "@/utils/debounce/debounce";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import { DownloadTemplateButton, ImportSpreadsheetButton } from "@/components/shared/button/custom-button";
import { downloadDeliveryOptionTemplate } from "@/utils/excel/delivery-option-excel.utils";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { usePagination } from "@/hooks/use-pagination";
import { DELIVERY_OPTIONS_FILTER } from "@/constants/status/filter-status";
import { ModalMode, Status } from "@/constants/status/status";
import { useDeliveryOptionsState } from "@/features/master-data/store/state/delivery-options-state";
import { DeliveryOptionsResponseModel } from "@/features/master-data/store/models/response/delivery-options-response";
import {
  setPageNo,
  setSearchFilter,
  setStatusFilter,
  resetState,
} from "@/features/master-data/store/slice/delivery-options-slice";
import {
  deleteDeliveryOptionsService,
  fetchDeliveryOptionsByIdService,
  fetchMyBusinessDeliveryOptionsService,
  toggleDeliveryOptionsStatusService,
} from "@/features/master-data/store/thunks/delivery-options-thunks";
import { deliveryOptionsTableColumns } from "@/features/master-data/table/delivery-options-table";
import DeliveryOptionsModal from "@/features/master-data/components/delivery-options-modal";
import { DeliveryOptionsDetailModal } from "@/features/master-data/components/delivery-options-detail-modal";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";
import { selecDeliveryOptionsContent, selectSelectedDeliveryOptions } from "@/features/master-data/store/selectors/delivery-options-selector";
import { useActionRouting } from "@/hooks/use-action-routing";
import { useAdminFilterUrlSync } from "@/hooks/use-admin-filter-url-sync";

function DeliveryOptionsPageInner() {
  useAdminCleanup(resetState);
  const router = useRouter();

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

  const {
    viewId,
    editId,
    deleteId,
    createMode,
    openView,
    openEdit,
    openDelete,
    openCreate,
    closeModal,
  } = useActionRouting();

  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(filters.search, AppDefault.DEFAULT_DEBOUNCE_MS);

  // ── Sync filters ↔ URL ────────────────────────────────────────────────────
  useAdminFilterUrlSync({
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
  });

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.DELIVERY_OPTIONS,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    dispatch(
      fetchMyBusinessDeliveryOptionsService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        statuses: filters.status === Status.ALL ? [] : [filters.status],
      }),
    );
  }, [dispatch, debouncedSearch, filters.status, filters.pageNo, globalPageSize]);

  // ── Deep-link resolver ────────────────────────────────────────────────────
  const allDeliveryOptionsContent = useAppSelector(selecDeliveryOptionsContent);
  const selectedDeliveryOptions = useAppSelector(selectSelectedDeliveryOptions);

  const resolveDeliveryOptions = (id: string | null): DeliveryOptionsResponseModel | null => {
    if (!id) return null;
    return allDeliveryOptionsContent.find(d => d.id === id) || (selectedDeliveryOptions?.id === id ? selectedDeliveryOptions : null);
  };

  const deleteDeliveryOptions = resolveDeliveryOptions(deleteId);

  useEffect(() => {
    if (deleteId && !deleteDeliveryOptions) {
      dispatch(fetchDeliveryOptionsByIdService(deleteId));
    }
  }, [deleteId, deleteDeliveryOptions, dispatch]);

  // ── Table action handlers ─────────────────────────────────────────────────
  const handleCreateDeliveryOptions = () => openCreate();
  const handleEditDeliveryOptions = (deliveryOptions: DeliveryOptionsResponseModel) => openEdit(deliveryOptions.id || "");
  const handleDeliveryOptionsViewDetail = (deliveryOptions: DeliveryOptionsResponseModel) => openView(deliveryOptions.id || "");
  const handleDeleteDeliveryOptions = (deliveryOptions: DeliveryOptionsResponseModel) => openDelete(deliveryOptions.id || "");

  const handleToggleDeliveryOptionsStatus = (deliveryOption: DeliveryOptionsResponseModel) => {
    if (!deliveryOption?.id) return;
    try {
      dispatch(toggleDeliveryOptionsStatusService(deliveryOption));
      showToast.success(Messages.delivery.statusUpdated);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.delivery.statusUpdateFailed);
    }
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditDeliveryOptions,
      handleDeliveryOptionsViewDetail,
      handleDeleteDeliveryOptions,
      handleToggleDeliveryOptionsStatus,
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

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
  };

  const handleOpenImport = () => {
    router.push(ROUTES.ADMIN.DELIVERY_OPTIONS_IMPORT);
  };

  const filterConfig = useMemo((): FilterPanelConfig => ({
    title: "Delivery Options Information",
    searchValue: filters.search,
    searchPlaceholder: "Search delivery options...",
    onSearchChange: (e) => dispatch(setSearchFilter(e.target.value)),
    buttonText: "New",
    buttonTooltip: "Create a new delivery options",
    onButtonClick: handleCreateDeliveryOptions,
    extraActions: (
      <div className="flex items-center gap-1">
        <DownloadTemplateButton onDownload={downloadDeliveryOptionTemplate} />
        <ImportSpreadsheetButton onClick={handleOpenImport} title="Import delivery options from Excel" />
      </div>
    ),
    filters: [
      {
        id: "status",
        type: "select",
        label: "Delivery Options Status",
        placeholder: "All Status",
        value: filters.status,
        onChange: (value) => dispatch(setStatusFilter(value as Status)),
        options: DELIVERY_OPTIONS_FILTER,
      },
    ],
  }), [filters.search, filters.status]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteDeliveryOptionsService(deleteId)).unwrap();
      showToast.success(
        `Delivery options "${deleteDeliveryOptions?.name ?? ""}" deleted successfully`,
      );
      closeModal();
      if (deliveryOptionsContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.delivery.deleteFailed);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel config={filterConfig} essentialFilterIds={["status"]} />

        <DataTableWithPagination
          data={deliveryOptionsContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No Delivery options found"
          getRowKey={(deliveryOptions) => deliveryOptions.id}
          currentPage={pagination.currentPage}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      <DeliveryOptionsModal
        isOpen={createMode || !!editId}
        onClose={closeModal}
        deliveryOptionsId={editId || undefined}
        mode={createMode ? ModalMode.CREATE_MODE : ModalMode.UPDATE_MODE}
      />

      <DeliveryOptionsDetailModal
        deliveryOptionsId={viewId || undefined}
        isOpen={!!viewId}
        onClose={closeModal}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={closeModal}
        onDelete={handleDelete}
        title="Delete Delivery Options"
        description={`Are you sure you want to delete this Delivery Options ${
          deleteDeliveryOptions?.name || deleteDeliveryOptions?.description || ""
        }?`}
        itemName={deleteDeliveryOptions?.name || deleteDeliveryOptions?.description || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}

export default function DeliveryOptionsPage() {
  return (
    <Suspense>
      <DeliveryOptionsPageInner />
    </Suspense>
  );
}
