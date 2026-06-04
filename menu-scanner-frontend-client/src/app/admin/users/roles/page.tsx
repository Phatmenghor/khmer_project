"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { usePagination } from "@/hooks/use-pagination";
import { ModalMode } from "@/constants/status/status";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";
import { RoleResponseModel } from "@/features/auth/store/models/response/role-response";
import {
  deleteRoleService,
  fetchAllRoleService,
} from "@/features/auth/store/thunks/role-thunks";
import { roleTableColumns } from "@/features/auth/table/roles-table";
import { useRolesState } from "@/features/auth/store/state/role-state";
import RoleModal from "@/features/auth/components/role-modal";
import { RoleDetailModal } from "@/features/auth/components/role-detail-modal";
import {
  resetState,
  setPageNo,
  setSearchFilter,
} from "@/features/auth/store/slice/role-slice";

export default function RolesPage() {
  useAdminCleanup(resetState);

  const {
    rolesState,
    rolesData,
    rolesContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useRolesState();


  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    id: "",
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    id: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    roles: null as RoleResponseModel | null,
  });

  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.HR.ATTENDANCE,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    dispatch(
      fetchAllRoleService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        businessId: AppDefault.BUSINESS_ID,
      }),
    );
  }, [dispatch, debouncedSearch, filters.pageNo, globalPageSize]);


  const handleCreate = () => {
    setModalState({
      isOpen: true,
      mode: ModalMode.CREATE_MODE,
      id: "",
    });
  };

  const handleEditItem = (role: RoleResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      id: role?.id || "",
    });
  };

  const handleViewDetailItem = (role: RoleResponseModel) => {
    setDetailModalState({
      isOpen: true,
      id: role.id || "",
    });
  };

  const handleDeleteItem = (role: RoleResponseModel) => {
    setDeleteState({
      isOpen: true,
      roles: role,
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditItem,
      handleViewDetailItem,
      handleDeleteItem,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      roleTableColumns({
        data: rolesData,
        handlers: tableHandlers,
      }),
    [rolesState, tableHandlers],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
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
    if (!deleteState.roles?.id) return;

    try {
      await dispatch(deleteRoleService(deleteState.roles.id)).unwrap();

      showToast.success(
        `Roles "${deleteState?.roles?.name ?? ""}" deleted successfully`,
      );

      closeDeleteModal();

      if (rolesContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.users.roleDeleteFailed);
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      id: "",
    });
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      id: "",
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      roles: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CardHeaderSection
          title="Roles Management"
          searchValue={filters.search}
          searchPlaceholder="Search roles..."
          buttonText="Create Role"
          buttonIcon={<Plus className="w-2 h-2" />}
          buttonTooltip="Create a new role"
          openModal={handleCreate}
          onSearchChange={handleSearchChange}
        ></CardHeaderSection>

        {}
        <DataTableWithPagination
          data={rolesContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No roles found"
          getRowKey={(role) => role.id}
          currentPage={filters.pageNo}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      {}
      <RoleModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        mode={modalState.mode}
        roleId={modalState.id}
      />

      {}
      <RoleDetailModal
        roleId={detailModalState.id}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Role"
        description={`Are you sure you want to delete this role ${deleteState.roles?.name}?`}
        itemName={deleteState.roles?.name || "this role"}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
