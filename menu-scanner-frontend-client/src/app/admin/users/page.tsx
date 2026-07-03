"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, Suspense, useState, useRef } from "react";
import { useDebounce } from "@/utils/debounce/debounce";
import { downloadUserTemplate } from "@/utils/excel/user-excel.utils";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import {
  CollapsibleFilterPanel,
  FilterPanelConfig,
} from "@/components/shared/common/collapsible-filter-panel";
import { CustomButton, DownloadTemplateButton, ImportSpreadsheetButton } from "@/components/shared/button/custom-button";
import ResetPasswordModal from "@/components/shared/modal/reset-password-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { userBusinessTableColumns } from "@/features/auth/table/users-business-table";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { useUsersState } from "@/features/auth/store/state/users-state";
import { usePagination } from "@/hooks/use-pagination";
import {
  deleteUserService,
  fetchAllUsersService,
  fetchUserByIdService,
  toggleUserStatusService,
} from "@/features/auth/store/thunks/users-thunks";
import { fetchAllRolesListService } from "@/features/auth/store/thunks/role-thunks";
import { selectRolesList } from "@/features/auth/store/selectors/role-selectors";
import { formatEnumValue } from "@/utils/format/enum-formatter";
import {
  setAccountStatusFilter,
  setPageNo,
  setRoleFilter,
  setSearchFilter,
  resetState,
} from "@/features/auth/store/slice/users-slice";
import { UserResponseModel } from "@/features/auth/store/models/response/users-response";
import { ACCOUNT_STATUS_FILTER } from "@/constants/status/filter-status";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import {
  AccountStatus,
  ModalMode,
  UserGropeType,
  UserRole,
} from "@/constants/status/status";
import UserBusinessModal from "@/features/auth/components/user-business-modal";
import { UserBusinessDetailModal } from "@/features/auth/components/user-business-detail-modal";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectUser } from "@/features/auth/store/selectors/auth-selectors";
import {
  selectUsersContent,
  selectSelectedUser,
} from "@/features/auth/store/selectors/users-selectors";
import { useActionRouting } from "@/hooks/use-action-routing";
import { useAdminFilterUrlSync } from "@/hooks/use-admin-filter-url-sync";

function UserBusinessPageInner() {
  useAdminCleanup(resetState);
  const isInitialMount = useRef(true);

  const currentUser = useAppSelector(selectUser);
  const currentUserId = currentUser?.userId;

  const {
    filters,
    pagination,
    usersData,
    usersContent,
    userState,
    isLoading,
    operations,
    dispatch,
  } = useUsersState();

  const {
    viewId,
    editId,
    deleteId,
    createMode,
    resetPasswordId,
    openView,
    openEdit,
    openDelete,
    openCreate,
    openResetPassword,
    closeModal,
  } = useActionRouting();

  const router = useRouter();

  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(
    filters.search,
    AppDefault.DEFAULT_DEBOUNCE_MS,
  );

  const rolesContent = useAppSelector(selectRolesList);

  const isHydrated = useAdminFilterUrlSync({
    filters: {
      search: filters.search,
      accountStatus:
        filters.accountStatus !== AccountStatus.ALL
          ? filters.accountStatus
          : "",
      role: filters.role !== UserRole.ALL ? filters.role : "",
      pageNo: filters.pageNo,
      pageSize: globalPageSize !== AppDefault.PAGE_SIZE ? globalPageSize : "",
    },
    onInit: (params) => {
      if (params.search) dispatch(setSearchFilter(params.search));
      if (params.accountStatus)
        dispatch(setAccountStatusFilter(params.accountStatus as AccountStatus));
      if (params.role) dispatch(setRoleFilter(params.role as UserRole));
      if (params.pageNo) dispatch(setPageNo(Number(params.pageNo)));
      if (params.pageSize) dispatch(setGlobalPageSize(Number(params.pageSize)));
    },
  });

  // ── Deep-link resolver ────────────────────────────────────────────────────
  const allUsersContent = useAppSelector(selectUsersContent);
  const selectedUser = useAppSelector(selectSelectedUser);

  const resolveUser = (id: string | null): UserResponseModel | null => {
    if (!id) return null;
    return (
      allUsersContent.find((u) => u.id === id) ||
      (selectedUser?.id === id ? selectedUser : null)
    );
  };

  const deleteUser = resolveUser(deleteId);
  const resetPasswordUser = resolveUser(resetPasswordId);

  useEffect(() => {
    if (deleteId && !deleteUser) {
      dispatch(fetchUserByIdService(deleteId));
    }
  }, [deleteId, deleteUser, dispatch]);

  useEffect(() => {
    if (resetPasswordId && !resetPasswordUser) {
      dispatch(fetchUserByIdService(resetPasswordId));
    }
  }, [resetPasswordId, resetPasswordUser, dispatch]);

  const roleFilterOptions = [
    { value: UserRole.ALL, label: "All Roles" },
    ...rolesContent.map((role) => ({
      value: role.name,
      label: formatEnumValue(role.name),
    })),
  ];

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.ADMIN.USERS,
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    if (!rolesContent || rolesContent.length === 0) {
      dispatch(
        fetchAllRolesListService({
          includeAll: false,
          userTypes: [UserGropeType.BUSINESS_USER],
        }),
      );
    }
  }, [dispatch, rolesContent]);

  useEffect(() => {
    if (!isHydrated) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (usersContent && usersContent.length > 0) {
        return;
      }
    }

    const filterPayload = {
      search: debouncedSearch,
      pageNo: filters.pageNo,
      pageSize: globalPageSize,
      roles: filters.role === UserRole.ALL ? [] : [filters.role],
      userTypes: [UserGropeType.BUSINESS_USER],
      accountStatuses:
        filters.accountStatus === AccountStatus.ALL
          ? []
          : [filters.accountStatus],
    };

    dispatch(fetchAllUsersService(filterPayload));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    debouncedSearch,
    filters.accountStatus,
    filters.role,
    filters.pageNo,
    globalPageSize,
    isHydrated,
  ]);

  // ── Table action handlers ─────────────────────────────────────────────────
  const handleCreateUser = () => openCreate();

  const handleOpenImport = () => {
    router.push(ROUTES.ADMIN.USERS_IMPORT);
  };

  const handleEditUser = (user: UserResponseModel) => {
    const isSelf = user?.id === currentUserId;
    const isBusinessOwner = user?.roles?.includes(UserRole.BUSINESS_OWNER);
    if (isSelf || isBusinessOwner) return;
    openEdit(user?.id || "");
  };

  const handleViewDetail = (user: UserResponseModel) => openView(user.id || "");

  const handleResetPassword = (user: UserResponseModel) => {
    const isSelf = user?.id === currentUserId;
    const isBusinessOwner = user?.roles?.includes(UserRole.BUSINESS_OWNER);
    if (isSelf || isBusinessOwner) return;
    openResetPassword(user.id || "");
  };

  const handleDeleteUser = (user: UserResponseModel) => {
    const isSelf = user?.id === currentUserId;
    const isBusinessOwner = user?.roles?.includes(UserRole.BUSINESS_OWNER);
    if (isSelf || isBusinessOwner) return;
    openDelete(user.id || "");
  };

  const handleToggleStatus = async (user: UserResponseModel) => {
    if (!user?.id) return;
    const isSelf = user?.id === currentUserId;
    const isBusinessOwner = user?.roles?.includes(UserRole.BUSINESS_OWNER);
    if (isSelf || isBusinessOwner) return;

    try {
      await dispatch(toggleUserStatusService(user)).unwrap();
      showToast.success(Messages.users.statusUpdated);
    } catch (error: unknown) {
      showToast.error(
        (error as { message?: string })?.message ||
          Messages.users.statusUpdateFailed,
      );
    }
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditUser,
      handleViewUserDetail: handleViewDetail,
      handleResetPassword,
      handleDeleteUser,
      handleToggleStatus,
    }),
    [currentUserId],
  );

  const columns = useMemo(
    () =>
      userBusinessTableColumns({
        data: usersData,
        handlers: tableHandlers,
        currentUserId,
      }),
    [userState, tableHandlers, currentUserId],
  );

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
  };

  const filterConfig = useMemo(
    (): FilterPanelConfig => ({
      title: "Business Users",
      searchValue: filters.search,
      searchPlaceholder: "Search users business...",
      onSearchChange: (e) => dispatch(setSearchFilter(e.target.value)),
      buttonText: "New User",
      buttonDisabled: false,
      onButtonClick: handleCreateUser,
      extraActions: (
        <div className="flex items-center gap-1">
          <DownloadTemplateButton onDownload={downloadUserTemplate} />
          <ImportSpreadsheetButton onClick={handleOpenImport} title="Import users from Excel" />
        </div>
      ),
      filters: [
        {
          id: "accountStatus",
          type: "select",
          label: "Account Status",
          placeholder: "All Status",
          value: filters.accountStatus,
          onChange: (value) =>
            dispatch(setAccountStatusFilter(value as AccountStatus)),
          options: ACCOUNT_STATUS_FILTER,
        },
        {
          id: "role",
          type: "select",
          label: "Business Role",
          placeholder: "All Roles",
          value: filters.role,
          onChange: (value) => dispatch(setRoleFilter(value as UserRole)),
          options: roleFilterOptions,
        },
      ],
    }),
    [filters.search, filters.accountStatus, filters.role, roleFilterOptions],
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteUserService(deleteId)).unwrap();
      showToast.success(
        `User business "${deleteUser?.fullName ?? ""}" deleted successfully`,
      );
      closeModal();
      if (usersContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error(
        (error as { message?: string })?.message || Messages.users.deleteFailed,
      );
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel
          config={filterConfig}
          essentialFilterIds={["accountStatus", "role"]}
        />

        <DataTableWithPagination
          data={usersContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No users business found"
          getRowKey={(user) => user.id}
          currentPage={filters.pageNo}
          totalElements={pagination.totalElements}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      <UserBusinessModal
        isOpen={createMode || !!editId}
        onClose={closeModal}
        userId={editId || undefined}
        mode={createMode ? ModalMode.CREATE_MODE : ModalMode.UPDATE_MODE}
      />

      <UserBusinessDetailModal
        userId={viewId || undefined}
        isOpen={!!viewId}
        onClose={closeModal}
      />

      <ResetPasswordModal
        isOpen={!!resetPasswordId}
        userName={resetPasswordUser?.userIdentifier}
        userRole={resetPasswordUser?.roles}
        profileImageUrl={resetPasswordUser?.profileImage?.sm}
        onClose={closeModal}
        userId={resetPasswordId || undefined}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={closeModal}
        onDelete={handleDelete}
        title="Delete User"
        description={`Are you sure you want to delete this user ${deleteUser?.userIdentifier}?`}
        itemName={deleteUser?.fullName || deleteUser?.email}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}

export default function UserBusinessPage() {
  return (
    <Suspense>
      <UserBusinessPageInner />
    </Suspense>
  );
}
