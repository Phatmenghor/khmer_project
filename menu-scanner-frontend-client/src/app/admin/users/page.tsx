"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, useState, Suspense} from "react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
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
import { useAppSelector } from "@/store";

function UserBusinessPageInner() {
  useAdminCleanup(resetState);

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
  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(filters.search, 400);
  const rolesContent = useAppSelector(selectRolesList);


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
    dispatch(
      fetchAllRolesListService({
        includeAll: false,
        userTypes: [UserGropeType.BUSINESS_USER],
      }),
    );
  }, [dispatch]);


  useEffect(() => {
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
  }, [
    dispatch,
    debouncedSearch,
    filters.accountStatus,
    filters.role,
    filters.pageNo,
    globalPageSize,
  ]);

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    userId: "",
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    userBusinessId: "",
  });

  const [resetPasswordState, setResetPasswordState] = useState({
    isOpen: false,
    userBusinessId: "",
    userName: "",
    roles: [] as string[],
    profileImageUrl: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    user: null as UserResponseModel | null,
  });

  const handleCreateUser = () =>
    setModalState({ isOpen: true, mode: ModalMode.CREATE_MODE, userId: "" });

  const handleEditUser = (user: UserResponseModel) =>
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      userId: user?.id || "",
    });

  const handleViewDetail = (user: UserResponseModel) =>
    setDetailModalState({ isOpen: true, userBusinessId: user.id || "" });

  const handleResetPassword = (user: UserResponseModel) =>
    setResetPasswordState({
      isOpen: true,
      userBusinessId: user.id || "",
      userName: user.userIdentifier || "",
      roles: user.roles || [],
      profileImageUrl: user.profileImage?.sm || "",
    });

  const handleDeleteUser = (user: UserResponseModel) =>
    setDeleteState({ isOpen: true, user });

  const handleToggleStatus = async (user: UserResponseModel) => {
    if (!user?.id) return;
    try {
      await dispatch(toggleUserStatusService(user)).unwrap();
      showToast.success(Messages.users.statusUpdated);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.users.statusUpdateFailed);
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
    [],
  );

  const columns = useMemo(
    () =>
      userBusinessTableColumns({ data: usersData, handlers: tableHandlers }),
    [userState, tableHandlers],
  );

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
  };

  const filterConfig = useMemo((): FilterPanelConfig => ({
    title: "Business Users",
    searchValue: filters.search,
    searchPlaceholder: "Search users business...",
    onSearchChange: (e) => dispatch(setSearchFilter(e.target.value)),
    buttonText: "New User",
    buttonDisabled: false,
    onButtonClick: handleCreateUser,
    filters: [
      {
        id: "accountStatus",
        type: "select",
        label: "Account Status",
        placeholder: "All Status",
        value: filters.accountStatus,
        onChange: (value) => dispatch(setAccountStatusFilter(value as AccountStatus)),
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
  }), [filters.search, filters.accountStatus, filters.role, roleFilterOptions]);

  const handleDelete = async () => {
    if (!deleteState.user?.id) return;
    try {
      await dispatch(deleteUserService(deleteState.user.id)).unwrap();
      showToast.success(
        `User business "${deleteState.user.fullName ?? ""}" deleted successfully`,
      );
      closeDeleteModal();
      if (usersContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.users.deleteFailed);
    }
  };

  const closeModal = () =>
    setModalState({ isOpen: false, mode: ModalMode.CREATE_MODE, userId: "" });

  const closeDetailModal = () =>
    setDetailModalState({ isOpen: false, userBusinessId: "" });

  const closeResetPasswordModal = () =>
    setResetPasswordState({
      isOpen: false,
      userBusinessId: "",
      userName: "",
      roles: [] as string[],
      profileImageUrl: "",
    });

  const closeDeleteModal = () => setDeleteState({ isOpen: false, user: null });

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel config={filterConfig} essentialFilterIds={["accountStatus", "role"]} />

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
        isOpen={modalState.isOpen}
        onClose={closeModal}
        userId={modalState.userId}
        mode={modalState.mode}
      />

      <UserBusinessDetailModal
        userId={detailModalState.userBusinessId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      <ResetPasswordModal
        isOpen={resetPasswordState.isOpen}
        userName={resetPasswordState.userName}
        userRole={resetPasswordState.roles}
        profileImageUrl={resetPasswordState.profileImageUrl}
        onClose={closeResetPasswordModal}
        userId={resetPasswordState.userBusinessId}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete User"
        description={`Are you sure you want to delete this user ${deleteState.user?.userIdentifier}?`}
        itemName={deleteState.user?.fullName || deleteState.user?.email}
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
