"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import ResetPasswordModal from "@/components/shared/modal/reset-password-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { customerTableColumns } from "@/features/auth/table/customer-table";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { useUsersState } from "@/features/auth/store/state/users-state";
import { usePagination } from "@/hooks/use-pagination";
import {
  deleteUserService,
  fetchAllUsersService,
  toggleUserStatusService,
} from "@/features/auth/store/thunks/users-thunks";
import {
  setAccountStatusFilter,
  setPageNo,
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
} from "@/constants/status/status";
import UserBusinessModal from "@/features/auth/components/user-business-modal";
import { UserBusinessDetailModal } from "@/features/auth/components/user-business-detail-modal";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";

function CustomerPageInner() {
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

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: "/admin/customers",
    syncPageToRedux: (page) => dispatch(setPageNo(page)),
  });

  useEffect(() => {
    const filterPayload = {
      search: debouncedSearch,
      pageNo: filters.pageNo,
      pageSize: globalPageSize,
      roles: [],
      userTypes: [UserGropeType.CUSTOMER],
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
    customer: null as UserResponseModel | null,
  });

  const handleCreateCustomer = () =>
    setModalState({ isOpen: true, mode: ModalMode.CREATE_MODE, userId: "" });

  const handleEditCustomer = (customer: UserResponseModel) =>
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      userId: customer?.id || "",
    });

  const handleViewDetail = (customer: UserResponseModel) =>
    setDetailModalState({ isOpen: true, userBusinessId: customer.id || "" });

  const handleResetPassword = (customer: UserResponseModel) =>
    setResetPasswordState({
      isOpen: true,
      userBusinessId: customer.id || "",
      userName: customer.userIdentifier || "",
      roles: customer.roles || [],
      profileImageUrl: customer.profileImage?.sm || "",
    });

  const handleDeleteCustomer = (customer: UserResponseModel) =>
    setDeleteState({ isOpen: true, customer });

  const handleToggleStatus = async (customer: UserResponseModel) => {
    if (!customer?.id) return;
    try {
      await dispatch(toggleUserStatusService(customer)).unwrap();
      showToast.success(Messages.users.statusUpdated);
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.users.statusUpdateFailed);
    }
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditCustomer,
      handleViewCustomerDetail: handleViewDetail,
      handleResetPassword,
      handleDeleteCustomer,
      handleToggleStatus,
    }),
    [],
  );

  const columns = useMemo(
    () =>
      customerTableColumns({ data: usersData, handlers: tableHandlers }),
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
    title: "Customers",
    searchValue: filters.search,
    searchPlaceholder: "Search customers...",
    onSearchChange: (e) => dispatch(setSearchFilter(e.target.value)),
    buttonText: "New Customer",
    buttonDisabled: false,
    onButtonClick: handleCreateCustomer,
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
    ],
  }), [filters.search, filters.accountStatus]);

  const handleDelete = async () => {
    if (!deleteState.customer?.id) return;
    try {
      await dispatch(deleteUserService(deleteState.customer.id)).unwrap();
      showToast.success(
        `Customer "${deleteState.customer.fullName || deleteState.customer.userIdentifier}" deleted successfully`,
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

  const closeDeleteModal = () => setDeleteState({ isOpen: false, customer: null });

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel config={filterConfig} essentialFilterIds={["accountStatus"]} />

        <DataTableWithPagination
          data={usersContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No customers found"
          getRowKey={(customer) => customer.id}
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
        defaultUserType="CUSTOMER"
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
        title="Delete Customer"
        description={`Are you sure you want to delete customer ${deleteState.customer?.userIdentifier}?`}
        itemName={deleteState.customer?.fullName || deleteState.customer?.email}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}

export default function CustomerPage() {
  return (
    <Suspense>
      <CustomerPageInner />
    </Suspense>
  );
}
