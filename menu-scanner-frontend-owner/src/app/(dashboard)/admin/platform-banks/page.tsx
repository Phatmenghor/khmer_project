"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { AppDefault } from "@/constants/app-resource/default/default";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { usePagination } from "@/hooks/use-pagination";
import { usePlatformBankState } from "@/features/platform-bank/store/state/use-platform-bank-state";
import {
  setPageNo,
  setSearchFilter,
  setStatusFilter,
} from "@/features/platform-bank/store/slice/platform-bank-slice";
import {
  deletePlatformBankService,
  fetchAllPlatformBanksService,
} from "@/features/platform-bank/store/thunks/platform-bank-thunks";
import { platformBankTableColumns } from "@/features/platform-bank/table/platform-bank-table";
import { PlatformBankResponseModel } from "@/features/platform-bank/store/models/response/platform-bank-response";
import { PlatformBankModal } from "@/features/platform-bank/components/platform-bank-modal";

export default function PlatformBanksPage() {
  const searchParams = useSearchParams();

  const {
    dispatch,
    data,
    isLoading,
    filters,
    operations,
  } = usePlatformBankState();

  const [modalState, setModalState] = useState({
    isOpen: false,
    bankToEdit: null as PlatformBankResponseModel | null,
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    bank: null as PlatformBankResponseModel | null,
  });

  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.PLATFORM_BANKS || "/admin/platform-banks",
    defaultPageSize: 15,
  });

  const currentPage = data?.pageNo ?? filters.pageNo ?? 1;
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;
  const bankContent = data?.content || [];

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;

    if (pageFromUrl !== currentPage) {
      dispatch(setPageNo(pageFromUrl));
    }
  }, [searchParams, currentPage, dispatch]);

  useEffect(() => {
    dispatch(
      fetchAllPlatformBanksService({
        search: debouncedSearch,
        status: filters.status || undefined,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
      })
    );
  }, [dispatch, debouncedSearch, filters.status, filters.pageNo, globalPageSize]);

  const handleCreateBank = () => {
    setModalState({
      isOpen: true,
      bankToEdit: null,
    });
  };

  const handleEditBank = (bank: PlatformBankResponseModel) => {
    setModalState({
      isOpen: true,
      bankToEdit: bank,
    });
  };

  const handleDeleteBank = (bank: PlatformBankResponseModel) => {
    setDeleteState({
      isOpen: true,
      bank,
    });
  };

  const columns = useMemo(
    () =>
      platformBankTableColumns({
        pageNo: currentPage,
        pageSize: globalPageSize,
        onEdit: handleEditBank,
        onDelete: handleDeleteBank,
      }),
    [currentPage, globalPageSize]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleStatusChange = (status: string) => {
    dispatch(setStatusFilter(status));
  };

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
    updateUrlWithPage(1);
  };

  const filterConfig = useMemo(
    (): FilterPanelConfig => ({
      title: "Platform Banks",
      subtitle: "Manage platform bank accounts",
      totalCount: totalElements,
      searchValue: filters.search,
      searchPlaceholder: "Search bank name, account number...",
      onSearchChange: handleSearchChange,
      buttonText: "New",
      buttonTooltip: "Add new platform bank account",
      onButtonClick: handleCreateBank,
      filters: [
        {
          id: "status",
          type: "select" as const,
          label: "Status",
          placeholder: "All Status",
          value: filters.status,
          onChange: (val: any) => handleStatusChange(val as string),
          options: [
            { label: "All Status", value: "" },
            { label: "Active", value: "ACTIVE" },
            { label: "Inactive", value: "INACTIVE" },
          ],
        },
      ],
    }),
    [totalElements, filters.search, filters.status, handleSearchChange, handleCreateBank, handleStatusChange]
  );

  const handleDeleteConfirm = async () => {
    if (!deleteState.bank?.id) return;

    try {
      await dispatch(deletePlatformBankService(deleteState.bank.id)).unwrap();
      showToast.success(`Bank account "${deleteState.bank.name}" deleted successfully`);
      closeDeleteModal();
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "Failed to delete bank account"));
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      bankToEdit: null,
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      bank: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel
          config={filterConfig}
          essentialFilterIds={["status"]}
        />

        <DataTableWithPagination
          data={bankContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No platform bank accounts found"
          getRowKey={(bank) => bank.id}
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      <PlatformBankModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        bankToEdit={modalState.bankToEdit}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDeleteConfirm}
        title="Delete Platform Bank Account"
        description={`Are you sure you want to delete bank account "${deleteState.bank?.name || ""}" (${deleteState.bank?.accountNumber || ""})?`}
        itemName={deleteState.bank?.name || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
