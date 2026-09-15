"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { CheckCircle2, XCircle } from "lucide-react";
import { TableActionButtons } from "@/components/shared/button/custom-button";
import { usePagination } from "@/hooks/use-pagination";
import { indexDisplay } from "@/utils/common/common";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { Switch } from "@/components/ui/switch";
import { useActionRouting } from "@/hooks/use-action-routing";
import { useDebouncedItemCallback } from "@/utils/debounce/debounce";

import {
  fetchAllAccountsThunk,
  deleteAccountThunk,
} from "@/features/bakong/store/thunks/bakong-thunks";
import {
  selectBakongAccountsList,
  selectBakongAccountsPagination,
  selectBakongAccountFilters,
  selectIsBakongAccountsLoading,
} from "@/features/bakong/store/selectors/bakong-selectors";
import { setAccountSearch, setAccountPageNo, updateAccountLocal } from "@/features/bakong/store/slice/bakong-slice";
import { bakongApiService } from "@/features/bakong/services/bakong-api-service";
import { BakongAccountModel } from "@/features/bakong/models/bakong-models";
import { BakongAccountModal } from "@/features/bakong/components/bakong-account-modal";
import { BakongAccountDetailModal } from "@/features/bakong/components/bakong-account-detail-modal";

export default function BakongAccountsPage() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const accounts = useAppSelector(selectBakongAccountsList);
  const pagination = useAppSelector(selectBakongAccountsPagination);
  const filters = useAppSelector(selectBakongAccountFilters);
  const isLoading = useAppSelector(selectIsBakongAccountsLoading);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: "/admin/bakong/accounts",
    defaultPageSize: 15,
  });

  const { viewId, editId, deleteId, createMode, openView, openEdit, openDelete, openCreate, closeModal } = useActionRouting();

  const deleteAccount = useMemo(() => accounts.find((a) => a.id === deleteId) || null, [accounts, deleteId]);

  const currentPage = pagination.pageNo || filters.pageNo || 1;

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;
    if (pageFromUrl !== currentPage) {
      dispatch(setAccountPageNo(pageFromUrl));
    }
  }, [searchParams, currentPage, dispatch]);

  const loadData = async (search = filters.search, pageNo = filters.pageNo) => {
    try {
      await dispatch(fetchAllAccountsThunk({ search, pageNo, pageSize: pagination.pageSize || 15 })).unwrap();
    } catch (err: any) {
      showToast.error(getErrorMessage(err, "Failed to load Bakong accounts"));
    }
  };

  useEffect(() => {
    loadData(filters.search, filters.pageNo);
  }, [dispatch, filters.search, filters.pageNo]);

  const handleCreate = () => {
    openCreate();
  };

  const handleEdit = (account: BakongAccountModel) => {
    openEdit(account.id);
  };

  const handleViewDetail = (account: BakongAccountModel) => {
    openView(account.id);
  };

  const handleDeletePrompt = (account: BakongAccountModel) => {
    openDelete(account.id);
  };

  // Debounced API call per account ID (400ms) with instant optimistic local state update
  const debouncedAccountApiUpdate = useDebouncedItemCallback(
    async (accountIdKey: string, account: BakongAccountModel, newEnabled: boolean) => {
      try {
        await bakongApiService.updateAccount(account.id, {
          accountId: account.accountId,
          merchantName: account.merchantName,
          merchantCity: account.merchantCity,
          acquiringBank: account.acquiringBank,
          currency: account.currency,
          isDefault: newEnabled,
          enabled: newEnabled,
        });
        showToast.success(`Bakong account "${account.accountId}" ${newEnabled ? "activated" : "deactivated"}`);
      } catch (err: any) {
        // Revert local state on API error
        dispatch(updateAccountLocal({ id: account.id, enabled: !newEnabled }));
        showToast.error(getErrorMessage(err, "Failed to update account status"));
      }
    },
    400
  );

  const handleToggleAccountStatus = (account: BakongAccountModel, newEnabled: boolean) => {
    // 1. Optimistic UI update (0ms lag, no loading spinner)
    dispatch(updateAccountLocal({ id: account.id, enabled: newEnabled }));
    // 2. Debounced API call
    debouncedAccountApiUpdate(account.id, account, newEnabled);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      const deletedRes = await dispatch(deleteAccountThunk(deleteId)).unwrap();
      showToast.success(`Account "${deletedRes?.accountId || deleteAccount?.accountId || ""}" deleted successfully`);
      closeModal();
      loadData();
    } catch (err: any) {
      showToast.error(getErrorMessage(err, "Failed to delete account"));
    }
  };

  const handlePageChangeWrapper = (page: number) => {
    dispatch(setAccountPageNo(page));
    handlePageChange(page);
  };

  const columns: TableColumn<BakongAccountModel>[] = useMemo(
    () => [
      {
        key: "index",
        label: "#",
        minWidth: "10px",
        maxWidth: "400px",
        render: (_, index) => (
          <span className="text-xs font-semibold text-muted-foreground">
            {indexDisplay(pagination.pageNo || 1, pagination.pageSize || 15, index + 1)}
          </span>
        ),
      },
      {
        key: "accountId",
        label: "Bakong Account ID",
        render: (item: BakongAccountModel) => (
          <span className="font-bold text-foreground font-mono">{item.accountId || "-"}</span>
        ),
      },
      {
        key: "merchantName",
        label: "Merchant Name",
        render: (item: BakongAccountModel) => <span className="font-semibold text-foreground">{item.merchantName || "-"}</span>,
      },
      {
        key: "merchantCity",
        label: "City",
        render: (item: BakongAccountModel) => <span className="text-muted-foreground">{item.merchantCity || "-"}</span>,
      },
      {
        key: "currency",
        label: "Currency",
        render: (item: BakongAccountModel) => <span className="font-medium text-foreground">{item.currency || "-"}</span>,
      },
      {
        key: "enabled",
        label: "Status",
        render: (item: BakongAccountModel) => {
          const isActive = item.enabled || item.isDefault;
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => handleToggleAccountStatus(item, checked)}
              />
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border inline-flex items-center gap-1 ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }`}
              >
                {isActive ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> ACTIVE
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" /> INACTIVE
                  </>
                )}
              </span>
            </div>
          );
        },
      },
      {
        key: "createdAt",
        label: "Created At",
        render: (item: BakongAccountModel) => (
          <span className="text-xs text-muted-foreground">{dateTimeFormat(item.createdAt)}</span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (item: BakongAccountModel) => (
          <TableActionButtons
            onView={() => handleViewDetail(item)}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDeletePrompt(item)}
            viewTooltip="View Details"
            editTooltip="Edit Account"
            deleteTooltip="Delete Account"
          />
        ),
      },
    ],
    [pagination, dispatch]
  );

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      title: "Bakong Accounts",
      subtitle: "Manage merchant Bakong receiver accounts",
      totalCount: pagination.totalElements || accounts.length,
      searchValue: filters.search,
      searchPlaceholder: "Search account ID, merchant name, city...",
      onSearchChange: (e) => dispatch(setAccountSearch(e.target.value)),
      buttonText: "New Account",
      buttonTooltip: "Add new Bakong merchant account",
      onButtonClick: handleCreate,
      filters: [],
    }),
    [pagination.totalElements, accounts.length, filters.search, dispatch]
  );

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <CollapsibleFilterPanel config={filterConfig} />

      <DataTableWithPagination
        data={accounts}
        columns={columns}
        loading={isLoading}
        emptyMessage="No Bakong merchant accounts found"
        getRowKey={(account) => account.id}
        currentPage={currentPage}
        totalPages={pagination.totalPages || 1}
        totalElements={pagination.totalElements || accounts.length}
        onPageChange={handlePageChangeWrapper}
        pageSize={pagination.pageSize || 15}
      />

      <BakongAccountModal
        isOpen={createMode || Boolean(editId)}
        onClose={closeModal}
        accountId={editId}
        onSuccess={() => loadData()}
      />

      <BakongAccountDetailModal
        isOpen={Boolean(viewId)}
        onClose={closeModal}
        accountId={viewId}
      />

      <DeleteConfirmationModal
        isOpen={Boolean(deleteId)}
        onClose={closeModal}
        onDelete={handleDeleteConfirm}
        title="Delete Bakong Merchant Account"
        description={`Are you sure you want to delete account "${deleteAccount?.accountId || deleteId || ""}"?`}
        itemName={deleteAccount?.accountId || deleteId || ""}
      />
    </div>
  );
}

