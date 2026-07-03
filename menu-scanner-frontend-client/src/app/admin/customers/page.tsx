"use client";

import { Messages } from "@/constants/messages";
import { useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import { DownloadTemplateButton, ImportSpreadsheetButton } from "@/components/shared/button/custom-button";
import { downloadCustomerTemplate } from "@/utils/excel/customer-excel.utils";
import { useDebounce } from "@/utils/debounce/debounce";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import ResetPasswordModal from "@/components/shared/modal/reset-password-modal";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { customerTableColumns } from "@/features/auth/table/customer-table";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { useCustomersState } from "@/features/auth/store/state/customers-state";
import { usePagination } from "@/hooks/use-pagination";
import {
  deleteCustomerService,
  fetchAllCustomersService,
  fetchCustomerByIdService,
  toggleCustomerStatusService,
} from "@/features/auth/store/thunks/users-thunks";
import {
  setAccountStatusFilter,
  setPageNo,
  setSearchFilter,
  resetState,
} from "@/features/auth/store/slice/customers-slice";
import { UserResponseModel } from "@/features/auth/store/models/response/users-response";
import { ACCOUNT_STATUS_FILTER } from "@/constants/status/filter-status";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import {
  AccountStatus,
  ModalMode,
  UserGropeType,
  UserRole,
} from "@/constants/status/status";
import UserCustomerModal from "@/features/auth/components/user-customer-modal";
import { UserBusinessDetailModal } from "@/features/auth/components/user-business-detail-modal";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectUser } from "@/features/auth/store/selectors/auth-selectors";
import {
  selectCustomersContent,
  selectSelectedCustomer,
} from "@/features/auth/store/selectors/customers-selectors";
import { useActionRouting } from "@/hooks/use-action-routing";
import { useAdminFilterUrlSync } from "@/hooks/use-admin-filter-url-sync";

function CustomerPageInner() {
  useAdminCleanup(resetState);
  const router = useRouter();

  const currentUser = useAppSelector(selectUser);
  const currentUserId = currentUser?.userId;

  const {
    filters,
    pagination,
    customersData,
    customersContent,
    customerState,
    isLoading,
    operations,
    dispatch,
  } = useCustomersState();

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

  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(filters.search, AppDefault.DEFAULT_DEBOUNCE_MS);

  // ── Sync filters ↔ URL ────────────────────────────────────────────────────
  useAdminFilterUrlSync({
    filters: {
      search: filters.search,
      accountStatus: filters.accountStatus !== AccountStatus.ALL ? filters.accountStatus : "",
      pageNo: filters.pageNo,
      pageSize: globalPageSize !== AppDefault.PAGE_SIZE ? globalPageSize : "",
    },
    onInit: (params) => {
      if (params.search) dispatch(setSearchFilter(params.search));
      if (params.accountStatus) dispatch(setAccountStatusFilter(params.accountStatus as AccountStatus));
      if (params.pageNo) dispatch(setPageNo(Number(params.pageNo)));
      if (params.pageSize) dispatch(setGlobalPageSize(Number(params.pageSize)));
    },
  });

  // ── Deep-link resolver ────────────────────────────────────────────────────
  const allUsersContent = useAppSelector(selectCustomersContent);
  const selectedUser = useAppSelector(selectSelectedCustomer);

  const resolveUser = (id: string | null): UserResponseModel | null => {
    if (!id) return null;
    return allUsersContent.find(u => u.id === id) || (selectedUser?.id === id ? selectedUser : null);
  };

  const deleteCustomer = resolveUser(deleteId);
  const resetPasswordCustomer = resolveUser(resetPasswordId);

  useEffect(() => {
    if (deleteId && !deleteCustomer) {
      dispatch(fetchCustomerByIdService(deleteId));
    }
  }, [deleteId, deleteCustomer, dispatch]);

  useEffect(() => {
    if (resetPasswordId && !resetPasswordCustomer) {
      dispatch(fetchCustomerByIdService(resetPasswordId));
    }
  }, [resetPasswordId, resetPasswordCustomer, dispatch]);

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

    dispatch(fetchAllCustomersService(filterPayload));
  }, [
    dispatch,
    debouncedSearch,
    filters.accountStatus,
    filters.pageNo,
    globalPageSize,
  ]);

  // ── Table action handlers ─────────────────────────────────────────────────
  const handleCreateCustomer = () => openCreate();

  const handleEditCustomer = (customer: UserResponseModel) => {
    const isSelf = customer?.id === currentUserId;
    const isBusinessOwner = customer?.roles?.includes(UserRole.BUSINESS_OWNER);
    if (isSelf || isBusinessOwner) return;
    openEdit(customer?.id || "");
  };

  const handleViewDetail = (customer: UserResponseModel) => openView(customer.id || "");

  const handleResetPassword = (customer: UserResponseModel) => {
    const isSelf = customer?.id === currentUserId;
    const isBusinessOwner = customer?.roles?.includes(UserRole.BUSINESS_OWNER);
    if (isSelf || isBusinessOwner) return;
    openResetPassword(customer.id || "");
  };

  const handleDeleteCustomer = (customer: UserResponseModel) => {
    const isSelf = customer?.id === currentUserId;
    const isBusinessOwner = customer?.roles?.includes(UserRole.BUSINESS_OWNER);
    if (isSelf || isBusinessOwner) return;
    openDelete(customer.id || "");
  };

  const handleToggleStatus = async (customer: UserResponseModel) => {
    if (!customer?.id) return;
    const isSelf = customer?.id === currentUserId;
    const isBusinessOwner = customer?.roles?.includes(UserRole.BUSINESS_OWNER);
    if (isSelf || isBusinessOwner) return;

    try {
      await dispatch(toggleCustomerStatusService(customer)).unwrap();
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
    [currentUserId],
  );

  const columns = useMemo(
    () =>
      customerTableColumns({
        data: customersData,
        handlers: tableHandlers,
        currentUserId,
      }),
    [customerState, tableHandlers, currentUserId],
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
    router.push(ROUTES.ADMIN.CUSTOMERS_IMPORT);
  };

  const filterConfig = useMemo((): FilterPanelConfig => ({
    title: "Customers",
    searchValue: filters.search,
    searchPlaceholder: "Search customers...",
    onSearchChange: (e) => dispatch(setSearchFilter(e.target.value)),
    buttonText: "New Customer",
    buttonDisabled: false,
    onButtonClick: handleCreateCustomer,
    extraActions: (
      <div className="flex items-center gap-1">
        <DownloadTemplateButton onDownload={downloadCustomerTemplate} />
        <ImportSpreadsheetButton onClick={handleOpenImport} title="Import customers from Excel" />
      </div>
    ),
    filters: [
      {
        id: "accountStatus",
        type: "select",
        label: "Account Status",
        placeholder: "All Status",
        value: filters.accountStatus,
        onChange: (value) => dispatch(setAccountStatusFilter(value as AccountStatus)),
        options: ACCOUNT_STATUS_FILTER.filter(status => status.value !== AccountStatus.END_WORK),
      },
    ],
  }), [filters.search, filters.accountStatus]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteCustomerService(deleteId)).unwrap();
      showToast.success(
        `Customer "${deleteCustomer?.fullName || deleteCustomer?.userIdentifier}" deleted successfully`,
      );
      closeModal();
      if (customersContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error((error as { message?: string })?.message || Messages.users.deleteFailed);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel config={filterConfig} essentialFilterIds={["accountStatus"]} />

        <DataTableWithPagination
          data={customersContent}
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

      <UserCustomerModal
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
        userName={resetPasswordCustomer?.userIdentifier}
        userRole={resetPasswordCustomer?.roles}
        profileImageUrl={resetPasswordCustomer?.profileImage?.sm}
        onClose={closeModal}
        userId={resetPasswordId || undefined}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={closeModal}
        onDelete={handleDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete customer ${deleteCustomer?.userIdentifier}?`}
        itemName={deleteCustomer?.fullName || deleteCustomer?.email}
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
