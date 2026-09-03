"use client";

import React, { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { RegisterModal } from "@/components/landing/register-modal";
import { LoginModal } from "@/components/landing/login-modal";
import { useAppDispatch, useAppSelector } from "@/store";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { selectProfile } from "@/features/auth/store/selectors/auth-selectors";
import { getBusinessProfileService } from "@/features/auth/store/thunks/auth-thunks";
import { PlanHistorySection } from "../(dashboard)/admin/profile/_components/plan-history-section";
import { fetchAllSubscriptionHistoryService } from "@/features/subscription/store/thunks/subscription-history-thunks";
import { useSubscriptionHistoryState } from "@/features/subscription/store/state/subscription-history-state";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { subscriptionHistoryTableColumns } from "@/features/subscription/table/subscription-history-table";
import { SubscriptionHistoryDetailModal } from "@/features/subscription/components/subscription-history-detail-modal";
import { SubscriptionHistoryResponseModel } from "@/features/subscription/store/models/response/subscription-history-response";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { SUBSCRIPTION_STATUS_FILTER } from "@/constants/app-resource/status/filter-status";
import {
  setPlanIdFilter,
  setFromDateFilter,
  setToDateFilter,
  setStatusFilter,
  setPageNo,
} from "@/features/subscription/store/slice/subscription-history-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { AppDefault } from "@/constants/app-resource/default/default";

export default function PublicBusinessSubscriptionPage() {
  const dispatch = useAppDispatch();
  const { accessToken, authReady } = useAuthState();
  const userProfile = useAppSelector(selectProfile);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const {
    subscriptionHistoryData,
    subscriptionHistoryContent,
    isLoading,
    filters,
    pagination,
    dispatch: subDispatch,
  } = useSubscriptionHistoryState();

  const globalPageSize = useAppSelector(selectGlobalPageSize);

  const [detailState, setDetailState] = useState({
    isOpen: false,
    subscriptionId: "",
  });

  useEffect(() => {
    if (authReady && accessToken && !userProfile) {
      dispatch(getBusinessProfileService());
    }
  }, [authReady, accessToken, dispatch, userProfile]);

  useEffect(() => {
    if (authReady && accessToken) {
      const userBusinessId = userProfile?.businessId || undefined;
      subDispatch(
        fetchAllSubscriptionHistoryService({
          businessId: userBusinessId,
          status: !filters.status || filters.status === "ALL" ? undefined : filters.status,
          fromDate: filters.fromDate || undefined,
          toDate: filters.toDate || undefined,
          pageNo: filters.pageNo,
          pageSize: globalPageSize,
        })
      );
    }
  }, [authReady, accessToken, subDispatch, userProfile, filters.status, filters.fromDate, filters.toDate, filters.pageNo, globalPageSize]);

  const handleViewDetail = (row: SubscriptionHistoryResponseModel) => {
    setDetailState({ isOpen: true, subscriptionId: row.subscriptionId });
  };

  const tableHandlers = useMemo(() => ({ handleViewDetail }), []);

  const columns = useMemo(
    () =>
      subscriptionHistoryTableColumns({
        data: subscriptionHistoryData,
        handlers: tableHandlers,
      }),
    [subscriptionHistoryData, tableHandlers]
  );

  const handlePageChangeWrapper = (page: number) => {
    subDispatch(setPageNo(page));
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    subDispatch(setPageNo(1));
  };

  const handleClearAllFilters = () => {
    subDispatch(setStatusFilter(""));
    subDispatch(setPlanIdFilter(""));
    subDispatch(setFromDateFilter(""));
    subDispatch(setToDateFilter(""));
  };

  const filterConfig = useMemo(
    (): FilterPanelConfig => ({
      title: "Subscription History Logs",
      subtitle: "Filter subscription payments and transaction logs",
      totalCount: pagination.totalElements,
      searchValue: "",
      searchPlaceholder: "Search...",
      onSearchChange: () => {},
      onClearAll: handleClearAllFilters,
      filters: [
        {
          id: "status",
          type: "select" as const,
          label: "Status",
          placeholder: "All Status",
          value: filters.status || "ALL",
          onChange: (val: any) =>
            subDispatch(setStatusFilter(val === "ALL" || !val ? "" : String(val))),
          options: SUBSCRIPTION_STATUS_FILTER,
        },
        {
          id: "fromDate",
          type: "date" as const,
          label: "From Date",
          placeholder: "Start date...",
          value: filters.fromDate,
          onChange: (val: any) => subDispatch(setFromDateFilter(val ? String(val) : "")),
        },
        {
          id: "toDate",
          type: "date" as const,
          label: "To Date",
          placeholder: "End date...",
          value: filters.toDate,
          onChange: (val: any) => subDispatch(setToDateFilter(val ? String(val) : "")),
        },
      ],
    }),
    [filters, pagination.totalElements, subDispatch]
  );

  return (
    <>
      <Navbar onRegisterClick={() => setIsRegisterModalOpen(true)} />
      <main className="min-h-screen bg-background pt-4 pb-10 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col space-y-1">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            My Subscription & Plans
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Manage your active plan features, subscription renewals, and billing history.
          </p>
        </div>

        {/* Active Plan Overview Header */}
        <PlanHistorySection userProfile={userProfile} />

        {/* Modern Data Table with Pagination and Filters */}
        <div className="space-y-3 pt-2">
          <CollapsibleFilterPanel
            config={filterConfig}
            essentialFilterIds={["status"]}
          />

          <DataTableWithPagination
            data={subscriptionHistoryContent}
            columns={columns}
            loading={isLoading}
            emptyMessage="No subscription history records found"
            getRowKey={(row) => row.subscriptionId}
            currentPage={filters.pageNo}
            totalPages={pagination.totalPages}
            totalElements={pagination.totalElements}
            onPageChange={handlePageChangeWrapper}
            pageSize={globalPageSize}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
          />
        </div>
      </main>
      <Footer />

      <SubscriptionHistoryDetailModal
        subscriptionId={detailState.subscriptionId}
        isOpen={detailState.isOpen}
        onClose={() => setDetailState({ isOpen: false, subscriptionId: "" })}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onLoginClick={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onRegisterClick={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />
    </>
  );
}
