"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { setGlobalPageSize } from "@/redux/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/redux/store/selectors/global-settings-selectors";
import { AppDefault } from "@/constants/app-resource/default/default";
import { Filter, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { ROUTES } from "@/constants/app-routes/routes";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { usePagination } from "@/redux/store/use-pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSubscriptionHistoryState } from "@/redux/features/subscription/store/state/subscription-history-state";
import {
  setBusinessIdFilter,
  setPlanIdFilter,
  setFromDateFilter,
  setToDateFilter,
  setStatusFilter,
  setPageNo,
  resetFilters,
} from "@/redux/features/subscription/store/slice/subscription-history-slice";
import { fetchAllSubscriptionHistoryService } from "@/redux/features/subscription/store/thunks/subscription-history-thunks";
import { subscriptionHistoryTableColumns } from "@/redux/features/subscription/table/subscription-history-table";
import { SubscriptionHistoryDetailModal } from "@/redux/features/subscription/components/subscription-history-detail-modal";
import { SubscriptionHistoryResponseModel } from "@/redux/features/subscription/store/models/response/subscription-history-response";
import { ComboboxBusiness, BusinessOption } from "@/components/shared/combo-box/combobox-business";
import { CustomDateTimePicker } from "@/components/shared/common/custom-date-picker";
import { fetchAllSubscriptionPlanService } from "@/redux/features/master-data/store/thunks/subscription-plan-thunks";
import { useAppDispatch } from "@/redux/store";
import { Label } from "@/components/ui/label";

const SUBSCRIPTION_STATUS_FILTER = [
  { value: "ALL", label: "All Status" },
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

  const [showFilter, setShowFilter] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessOption | null>(null);
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([{ value: "", label: "All Plans" }]);
  const [detailState, setDetailState] = useState({ isOpen: false, subscriptionId: "" });

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.SUBSCRIPTION_HISTORY,
    defaultPageSize: 15,
  });

  // Load subscription plans for the plan select
  useEffect(() => {
    appDispatch(fetchAllSubscriptionPlanService({ pageNo: 1, pageSize: 100 }))
      .unwrap()
      .then((result: any) => {
        if (result?.content) {
          const opts: PlanOption[] = [
            { value: undefined, label: "All Plans" },
            ...result.content.map((p: any) => ({ value: p.id as string, label: p.name as string })),
          ];
          setPlanOptions(opts);
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
        planId: filters.planId === "ALL" || !filters.planId ? undefined : filters.planId,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        status: filters.status === "ALL" || !filters.status ? undefined : filters.status,
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

  const activeFilterCount = [
    filters.businessId,
    filters.planId,
    filters.fromDate,
    filters.toDate,
    filters.status,
  ].filter(Boolean).length;

  const handleBusinessChange = (item: BusinessOption | null) => {
    setSelectedBusiness(item);
    dispatch(setBusinessIdFilter(item?.id ?? ""));
  };

  const handleReset = () => {
    setSelectedBusiness(null);
    dispatch(resetFilters());
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

  return (
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-3">
        <CardHeaderSection
          title="Subscription History"
        >
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilter((v) => !v)}
              className="flex items-center gap-2 h-9"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
              {showFilter ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-1 h-9 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </CardHeaderSection>

        {/* Advanced filter panel */}
        {showFilter && (
          <Card>
            <CardContent className="py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
                {/* Business combobox */}
                <ComboboxBusiness
                  value={selectedBusiness}
                  onChange={handleBusinessChange}
                  label="Business"
                  placeholder="All businesses..."
                  size="md"
                />

                {/* Plan select */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs sm:text-sm font-semibold text-foreground">
                    Plan
                  </Label>
                  <CustomSelect
                    options={planOptions}
                    value={filters.planId || undefined}
                    placeholder="All Plans"
                    onValueChange={(val) => dispatch(setPlanIdFilter(val === "All" ? "" : val))}
                  />
                </div>

                {/* From date */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs sm:text-sm font-semibold text-foreground">
                    From Date
                  </Label>
                  <CustomDateTimePicker
                    value={filters.fromDate}
                    onChange={(val) => dispatch(setFromDateFilter(val))}
                    placeholder="Start date..."
                    mode="date"
                  />
                </div>

                {/* To date */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs sm:text-sm font-semibold text-foreground">
                    To Date
                  </Label>
                  <CustomDateTimePicker
                    value={filters.toDate}
                    onChange={(val) => dispatch(setToDateFilter(val))}
                    placeholder="End date..."
                    mode="date"
                  />
                </div>

                {/* Status select */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs sm:text-sm font-semibold text-foreground">
                    Status
                  </Label>
                  <CustomSelect
                    options={SUBSCRIPTION_STATUS_FILTER}
                    value={filters.status || "ALL"}
                    placeholder="All Status"
                    onValueChange={(val) => dispatch(setStatusFilter(val === "ALL" ? "" : val))}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
