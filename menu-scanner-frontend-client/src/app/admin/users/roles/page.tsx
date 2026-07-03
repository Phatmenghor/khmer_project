"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, Suspense, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { DownloadTemplateButton, ImportSpreadsheetButton } from "@/components/shared/button/custom-button";
import { downloadRoleTemplate } from "@/utils/excel/role-excel.utils";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { usePagination } from "@/hooks/use-pagination";
import { ModalMode } from "@/constants/status/status";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppDispatch, useAppSelector } from "@/store";
import { RoleResponseModel } from "@/features/auth/store/models/response/role-response";
import {
  deleteRoleService,
  fetchAllRoleService,
  fetchRoleByIdService,
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
import {
  selectRoleContent,
  selectSelectedRole,
} from "@/features/auth/store/selectors/role-selectors";
import { useActionRouting } from "@/hooks/use-action-routing";
import { useAdminFilterUrlSync } from "@/hooks/use-admin-filter-url-sync";

function RolesPageInner() {
  useAdminCleanup(resetState);
  const isInitialMount = useRef(true);
  const router = useRouter();

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

  const allRolesContent = useAppSelector(selectRoleContent);

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

  const isHydrated = useAdminFilterUrlSync({
    filters: {
      search: filters.search,
      pageNo: filters.pageNo,
      pageSize: globalPageSize !== AppDefault.PAGE_SIZE ? globalPageSize : "",
    },
    onInit: (params) => {
      if (params.search) dispatch(setSearchFilter(params.search));
      if (params.pageNo) dispatch(setPageNo(Number(params.pageNo)));
      if (params.pageSize) dispatch(setGlobalPageSize(Number(params.pageSize)));
    },
  });

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.ROLES,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    if (!isHydrated) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (allRolesContent && allRolesContent.length > 0) {
        return;
      }
    }

    dispatch(
      fetchAllRoleService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        businessId: AppDefault.BUSINESS_ID,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, debouncedSearch, filters.pageNo, globalPageSize, isHydrated]);

  // ── Deep-link resolver ────────────────────────────────────────────────────
  const selectedRole = useAppSelector(selectSelectedRole);

  const resolveRole = (id: string | null): RoleResponseModel | null => {
    if (!id) return null;
    return allRolesContent.find(r => r.id === id) || (selectedRole?.id === id ? selectedRole : null);
  };

  const deleteRole = resolveRole(deleteId);

  useEffect(() => {
    if (deleteId && !deleteRole) {
      dispatch(fetchRoleByIdService(deleteId));
    }
  }, [deleteId, deleteRole, dispatch]);

  // ── Table action handlers ─────────────────────────────────────────────────
  const handleCreate = () => openCreate();
  const handleEditItem = (role: RoleResponseModel) => openEdit(role.id || "");
  const handleViewDetailItem = (role: RoleResponseModel) => openView(role.id || "");
  const handleDeleteItem = (role: RoleResponseModel) => openDelete(role.id || "");

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

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
  };

  const handleOpenImport = () => {
    router.push(ROUTES.ADMIN.ROLES_IMPORT);
  };

  const filterConfig = useMemo((): FilterPanelConfig => ({
    title: "Roles Management",
    searchValue: filters.search,
    searchPlaceholder: "Search roles...",
    onSearchChange: (e) => dispatch(setSearchFilter(e.target.value)),
    buttonText: "Create Role",
    buttonDisabled: false,
    onButtonClick: handleCreate,
    extraActions: (
      <div className="flex items-center gap-1">
        <DownloadTemplateButton onDownload={downloadRoleTemplate} />
        <ImportSpreadsheetButton onClick={handleOpenImport} title="Import roles from Excel" />
      </div>
    ),
    filters: [],
  }), [filters.search, router]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await dispatch(deleteRoleService(deleteId)).unwrap();

      showToast.success(
        `Roles "${deleteRole?.name ?? ""}" deleted successfully`,
      );

      closeModal();

      if (rolesContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.users.roleDeleteFailed);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel config={filterConfig} />

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

      <RoleModal
        isOpen={createMode || !!editId}
        onClose={closeModal}
        mode={createMode ? ModalMode.CREATE_MODE : ModalMode.UPDATE_MODE}
        roleId={editId || undefined}
      />

      <RoleDetailModal
        roleId={viewId || undefined}
        isOpen={!!viewId}
        onClose={closeModal}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={closeModal}
        onDelete={handleDelete}
        title="Delete Role"
        description={`Are you sure you want to delete this role ${deleteRole?.name}?`}
        itemName={deleteRole?.name || "this role"}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}

export default function RolesPage() {
  return (
    <Suspense>
      <RolesPageInner />
    </Suspense>
  );
}
