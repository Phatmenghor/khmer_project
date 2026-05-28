"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { AppDefault } from "@/constants/app-resource/default/default";
import { ROUTES } from "@/constants/app-routes/routes";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { usePagination } from "@/redux/store/use-pagination";
import { CollapsibleFilterPanel } from "@/components/shared/filter/collapsible-filter-panel";
import { FilterPanelConfig } from "@/components/shared/filter/filter-types";
import { BusinessOption } from "@/components/shared/combo-box/combobox-business";
import { useSubscriptionHistoryState } from "@/redux/features/subscription/store/state/subscription-history-state";
import {
  setBusinessIdFilter,
  setPlanIdFilter,
  setFromDateFilter,
  setToDateFilter,
  setStatusFilter,
  setPageNo,
} from "@/redux/features/subscription/store/slice/subscription-history-slice";
import { fetchAllSubscriptionHistoryService } from "@/redux/features/subscription/store/thunks/subscription-history-thunks";
import { subscriptionHistoryTableColumns } from "@/redux/features/subscription/table/subscription-history-table";
import { SubscriptionHistoryDetailModal } from "@/redux/features/subscription/components/subscription-history-detail-modal";
import { SubscriptionHistoryResponseModel } from "@/redux/features/subscription/store/models/response/subscription-history-response";
import { fetchAllSubscriptionPlanService } from "@/redux/features/master-data/store/thunks/subscription-plan-thunks";

const SUBSCRIPTION_STATUS_OPTIONS = [
  { value: undefined, label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRED", label: "Expired" },
];

interface PlanOption {
  value: string | undefined;
  label: string;
}

export default function SubscriptionHistoryPage() {
  const searchParams = useSearchParams();

  const {
    subscriptionHistoryData,
    subscriptionHistoryContent,
    isLoading,
    filters,
    pagination,
    dispatch,
  } = useSubscriptionHistoryState();

  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const appDispatch = useAppDispatch();

  const [selectedBusiness, setSelectedBusiness] = useState<BusinessOption | null>(null);
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([
    { value: undefined, label: "All Plans" },
  ]);
  const [detailState, setDetailState] = useState({
    isOpen: false,
    subscriptionId: "",
  });

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.SUBSCRIPTION_HISTORY,
    defaultPageSize: 15,
  });

  useEffect(() => {
    appDispatch(fetchAllSubscriptionPlanService({ pageNo: 1, pageSize: 100 }))
      .unwrap()
      .then((result: any) => {
        if (result?.content) {
          setPlanOptions([
            { value: undefined, label: "All Plans" },
            ...result.content.map((p: any) => ({
              value: p.id as string,
              label: p.name as string,
            })),
          ]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;
    if (pageFromUrl !== pagination.currentPage) {
      dispatch(setPageNo(pageFromUrl));
    }
  }, [searchParams]);

  useEffect(() => {
    dispatch(
      fetchAllSubscriptionHistoryService({
        businessId: filters.businessId || undefined,
        planId: filters.planId || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        status:
          !filters.status || filters.status === "ALL"
            ? undefined
            : filters.status,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
      })
    );
  }, [
    dispatch,
    filters.businessId,
    filters.planId,
    filters.fromDate,
    filters.toDate,
    filters.status,
    filters.pageNo,
    globalPageSize,
  ]);

  const handleBusinessChange = (item: BusinessOption | null) => {
    setSelectedBusiness(item);
    dispatch(setBusinessIdFilter(item?.id ?? ""));
  };

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
    dispatch(setPageNo(page));
    handlePageChange(page);
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
    updateUrlWithPage(1);
  };

  const filterConfig = useMemo(
    (): FilterPanelConfig => ({
      title: "Subscription History",
      searchValue: "",
      searchPlaceholder: "Search...",
      onSearchChange: () => {},
      filters: [
        {
          id: "status",
          type: "select" as const,
          label: "Status",
          placeholder: "All Status",
          value: filters.status || undefined,
          onChange: (val: string) =>
            dispatch(setStatusFilter(val === "ALL" ? "" : val)),
          options: SUBSCRIPTION_STATUS_OPTIONS,
        },
        {
          id: "planId",
          type: "select" as const,
          label: "Plan",
          placeholder: "All Plans",
          value: filters.planId || undefined,
          onChange: (val: string) =>
            dispatch(setPlanIdFilter(val === "All" ? "" : val)),
          options: planOptions,
        },
        {
          id: "businessId",
          type: "combobox-business" as const,
          label: "Business",
          placeholder: "All businesses...",
          value: selectedBusiness,
          onChange: handleBusinessChange,
          showAllOption: true,
        },
        {
          id: "fromDate",
          type: "date-picker" as const,
          label: "From Date",
          placeholder: "Start date...",
          value: filters.fromDate,
          onChange: (val: string) => dispatch(setFromDateFilter(val)),
        },
        {
          id: "toDate",
          type: "date-picker" as const,
          label: "To Date",
          placeholder: "End date...",
          value: filters.toDate,
          onChange: (val: string) => dispatch(setToDateFilter(val)),
        },
      ],
    }),
    [filters, planOptions, selectedBusiness]
  );

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
        <CollapsibleFilterPanel
          config={filterConfig}
          essentialFilterIds={["status", "planId"]}
        />

        <DataTableWithPagination
          data={subscriptionHistoryContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No subscription history found"
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

      <SubscriptionHistoryDetailModal
        subscriptionId={detailState.subscriptionId}
        isOpen={detailState.isOpen}
        onClose={() => setDetailState({ isOpen: false, subscriptionId: "" })}
      />
    </div>
  );
}
