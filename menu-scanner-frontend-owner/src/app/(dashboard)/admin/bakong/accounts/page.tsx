"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";

import {
  fetchAllAccountsThunk,
  updateAccountThunk,
  deleteAccountThunk,
} from "@/features/bakong/store/thunks/bakong-thunks";
import {
  selectBakongAccountsList,
  selectBakongAccountsPagination,
  selectBakongAccountFilters,
  selectIsBakongAccountsLoading,
} from "@/features/bakong/store/selectors/bakong-selectors";
import { setAccountSearch, setAccountPageNo } from "@/features/bakong/store/slice/bakong-slice";
import { BakongAccountModel } from "@/features/bakong/models/bakong-models";
import { BakongAccountModal } from "@/features/bakong/components/bakong-account-modal";

export default function BakongAccountsPage() {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector(selectBakongAccountsList);
  const pagination = useAppSelector(selectBakongAccountsPagination);
  const filters = useAppSelector(selectBakongAccountFilters);
  const isLoading = useAppSelector(selectIsBakongAccountsLoading);

  const [modalState, setModalState] = useState({
    isOpen: false,
    accountToEdit: null as BakongAccountModel | null,
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    account: null as BakongAccountModel | null,
  });

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
    setModalState({ isOpen: true, accountToEdit: null });
  };

  const handleEdit = (account: BakongAccountModel) => {
    setModalState({ isOpen: true, accountToEdit: account });
  };

  const handleDeletePrompt = (account: BakongAccountModel) => {
    setDeleteState({ isOpen: true, account });
  };

  const handleActivateAccount = async (account: BakongAccountModel) => {
    try {
      const res = await dispatch(
        updateAccountThunk({
          id: account.id,
          payload: { ...account, enabled: true, isDefault: true },
        })
      ).unwrap();
      showToast.success(`Bakong account "${res.accountId}" set as active primary account`);
      loadData();
    } catch (err: any) {
      showToast.error(getErrorMessage(err, "Failed to update active account"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteState.account?.id) return;
    try {
      const deletedRes = await dispatch(deleteAccountThunk(deleteState.account.id)).unwrap();
      showToast.success(`Account "${deletedRes?.accountId || deleteState.account.accountId}" deleted successfully`);
      setDeleteState({ isOpen: false, account: null });
      loadData();
    } catch (err: any) {
      showToast.error(getErrorMessage(err, "Failed to delete account"));
    }
  };

  const columns: TableColumn<BakongAccountModel>[] = useMemo(
    () => [
      {
        key: "accountId",
        label: "Bakong Account ID",
        render: (item: BakongAccountModel) => (
          <span className="font-bold text-foreground font-mono">{item.accountId}</span>
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
        label: "Active Status",
        render: (item: BakongAccountModel) => {
          const isActive = item.enabled || item.isDefault;
          return (
            <span
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border inline-flex items-center gap-1 ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {isActive ? (
                <>
                  <CheckCircle className="h-3 w-3" /> ACTIVE PRIMARY
                </>
              ) : (
                "INACTIVE"
              )}
            </span>
          );
        },
      },
      {
        key: "actions",
        label: "Actions",
        render: (item: BakongAccountModel) => {
          const isActive = item.enabled || item.isDefault;
          return (
            <div className="flex items-center gap-1">
              {!isActive && (
                <CustomButton
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                  onClick={() => handleActivateAccount(item)}
                >
                  <CheckCircle className="h-3 w-3" /> Set Active
                </CustomButton>
              )}
              <CustomButton
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-primary"
                onClick={() => handleEdit(item)}
                title="Edit Account"
              >
                <Edit className="h-3.5 w-3.5" />
              </CustomButton>
              <CustomButton
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => handleDeletePrompt(item)}
                title="Delete Account"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </CustomButton>
            </div>
          );
        },
      },
    ],
    []
  );

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      title: "Bakong Merchant Accounts",
      subtitle: "Configure merchant receiver accounts. Multiple accounts can exist, but only 1 account can be active at a time.",
      totalCount: pagination.totalElements || accounts.length,
      searchValue: filters.search,
      searchPlaceholder: "Search account ID, merchant name, city...",
      onSearchChange: (e) => dispatch(setAccountSearch(e.target.value)),
      filters: [],
      buttonText: "New Account",
      buttonTooltip: "Add new Bakong merchant account",
      onButtonClick: handleCreate,
    }),
    [pagination.totalElements, accounts.length, filters.search, dispatch]
  );

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      {/* Business Rule Notice Banner */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
        <AlertCircle className="h-4 w-4 shrink-0 text-blue-500" />
        <span>
          <strong>Single Active Account Rule:</strong> You may register multiple Bakong accounts, but activating any account will automatically set all other accounts as inactive to ensure payment QR codes map to 1 primary receiver account.
        </span>
      </div>

      <CollapsibleFilterPanel config={filterConfig} />

      <DataTableWithPagination
        data={accounts}
        columns={columns}
        loading={isLoading}
        emptyMessage="No Bakong merchant accounts found"
        getRowKey={(account) => account.id}
        currentPage={pagination.pageNo || 1}
        totalPages={pagination.totalPages || 1}
        totalElements={pagination.totalElements || 0}
        onPageChange={(page) => dispatch(setAccountPageNo(page))}
        pageSize={pagination.pageSize || 15}
        onPageSizeChange={() => {}}
      />

      <BakongAccountModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, accountToEdit: null })}
        accountToEdit={modalState.accountToEdit}
        onSuccess={() => loadData()}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState({ isOpen: false, account: null })}
        onDelete={handleDeleteConfirm}
        title="Delete Bakong Merchant Account"
        description={`Are you sure you want to delete account "${deleteState.account?.accountId || ""}" (${deleteState.account?.merchantName || ""})?`}
        itemName={deleteState.account?.accountId || ""}
      />
    </div>
  );
}
