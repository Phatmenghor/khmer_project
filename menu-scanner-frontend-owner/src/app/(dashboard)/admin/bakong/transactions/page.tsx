"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { Eye, CheckCircle2, Clock, XCircle } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { AppDefault } from "@/constants/app-resource/default/default";
import { useDebounce } from "@/utils/debounce/debounce";

import { fetchTransactionsThunk } from "@/features/bakong/store/thunks/bakong-thunks";
import {
  selectBakongTransactions,
  selectBakongTransactionsPagination,
  selectIsBakongTransactionsLoading,
  selectBakongTransactionFilters,
} from "@/features/bakong/store/selectors/bakong-selectors";
import { setTransactionSearch, setTransactionPageNo } from "@/features/bakong/store/slice/bakong-slice";
import { BakongTransactionModel } from "@/features/bakong/models/bakong-models";
import { BakongVerifyModal } from "@/features/bakong/components/bakong-verify-modal";
import { BakongDetailModal } from "@/features/bakong/components/bakong-detail-modal";

export default function BakongTransactionsPage() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  const transactions = useAppSelector(selectBakongTransactions);
  const pagination = useAppSelector(selectBakongTransactionsPagination);
  const isLoading = useAppSelector(selectIsBakongTransactionsLoading);
  const filters = useAppSelector(selectBakongTransactionFilters);
  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const debouncedSearch = useDebounce(filters.search, 400);

  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [detailState, setDetailState] = useState({
    isOpen: false,
    transactionId: null as string | null,
  });

  const currentPage = pagination.pageNo || 1;
  const totalPages = pagination.totalPages || 1;
  const totalElements = pagination.totalElements || 0;

  const loadTransactions = async () => {
    try {
      await dispatch(
        fetchTransactionsThunk({
          search: debouncedSearch,
          pageNo: currentPage,
          pageSize: globalPageSize,
        })
      ).unwrap();
    } catch (err: any) {
      showToast.error(getErrorMessage(err, "Failed to load transactions"));
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [dispatch, debouncedSearch, currentPage, globalPageSize]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setTransactionSearch(e.target.value));
  };

  const handlePageChange = (page: number) => {
    dispatch(setTransactionPageNo(page));
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setTransactionPageNo(1));
  };

  const handleViewDetail = (tx: BakongTransactionModel) => {
    setDetailState({ isOpen: true, transactionId: tx.id });
  };

  const columns: TableColumn<BakongTransactionModel>[] = useMemo(
    () => [
      {
        key: "md5",
        label: "MD5 Hash",
        render: (item: BakongTransactionModel) => (
          <span className="font-bold font-mono text-foreground text-xs">{item.md5}</span>
        ),
      },
      {
        key: "amount",
        label: "Amount",
        render: (item: BakongTransactionModel) => (
          <span className="font-bold text-foreground">
            {item.amount} {item.currency}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (item: BakongTransactionModel) => {
          const st = item.status?.toUpperCase() || "UNPAID";
          const isPaid = st === "SUCCESS" || st === "PAID" || st === "SUCCESSFUL";
          const isFailed = st === "FAILED" || st === "ERROR";

          return (
            <span
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border inline-flex items-center gap-1 ${
                isPaid
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : isFailed
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              }`}
            >
              {isPaid ? (
                <>
                  <CheckCircle2 className="h-3 w-3" /> PAID
                </>
              ) : isFailed ? (
                <>
                  <XCircle className="h-3 w-3" /> FAILED
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3" /> UNPAID
                </>
              )}
            </span>
          );
        },
      },
      {
        key: "toAccountId",
        label: "Receiver Account",
        render: (item: BakongTransactionModel) => (
          <span className="text-muted-foreground font-mono text-[11px]">
            {item.toAccountId || "N/A"}
          </span>
        ),
      },
      {
        key: "createdAt",
        label: "Date & Time",
        render: (item: BakongTransactionModel) => (
          <span className="text-muted-foreground text-xs">
            {item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (item: BakongTransactionModel) => (
          <CustomButton
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-primary"
            onClick={() => handleViewDetail(item)}
          >
            <Eye className="h-3.5 w-3.5" /> Details & Logs
          </CustomButton>
        ),
      },
    ],
    []
  );

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      title: "Bakong Transactions & Verifications",
      subtitle: "View local transactions history, search by MD5/hash, and perform live upstream NBC Bakong verification",
      totalCount: totalElements,
      searchValue: filters.search,
      searchPlaceholder: "Search MD5, hash, status, account...",
      onSearchChange: handleSearchChange,
      filters: [],
      buttonText: "Check Transaction",
      buttonTooltip: "Verify transaction by MD5 or Hash",
      onButtonClick: () => setVerifyModalOpen(true),
    }),
    [totalElements, filters.search]
  );

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <CollapsibleFilterPanel config={filterConfig} />

      <DataTableWithPagination
        data={transactions}
        columns={columns}
        loading={isLoading}
        emptyMessage="No Bakong transactions found"
        getRowKey={(tx) => tx.id}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={handlePageChange}
        pageSize={globalPageSize}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
      />

      <BakongVerifyModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        onSuccess={loadTransactions}
      />

      <BakongDetailModal
        isOpen={detailState.isOpen}
        onClose={() => setDetailState({ isOpen: false, transactionId: null })}
        transactionId={detailState.transactionId}
      />
    </div>
  );
}
