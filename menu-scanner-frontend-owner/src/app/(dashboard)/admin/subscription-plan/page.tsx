"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { AppDefault } from "@/constants/app-resource/default/default";
import { Plus } from "lucide-react";
import { useDebounce } from "@/utils/debounce/debounce";
import { ROUTES } from "@/constants/app-routes/routes";
import {
  ModalMode,
  SubscriptionPlanStatus,
} from "@/constants/app-resource/status/status";
import { CollapsibleFilterPanel, FilterPanelConfig } from "@/components/shared/common/collapsible-filter-panel";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { SUBSCRIPTION_PLAN_FILTER } from "@/constants/app-resource/status/filter-status";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { showToast } from "@/components/shared/common/show-toast";
import { getErrorMessage } from "@/utils/error/get-error-message";
import { usePagination } from "@/hooks/use-pagination";
import { useSubscriptionPlanState } from "@/features/master-data/store/state/subscription-plan-state";
import {
  setPageNo,
  setSearchFilter,
} from "@/features/master-data/store/slice/subscription-plan-slice";
import {
  deleteSubscriptionPlanService,
  fetchAllSubscriptionPlanService,
} from "@/features/master-data/store/thunks/subscription-plan-thunks";
import { subscriptionPlanTableColumns } from "@/features/master-data/table/subscription-plan-table";
import { SubscriptionPlanResponseModel } from "@/features/master-data/store/models/response/subscription-plan-response";
import { setSubscriptionPlanStatusFilter } from "@/features/master-data/store/slice/subscription-plan-slice";
import SubscriptionPlanModal from "@/features/master-data/components/subscription-plan-modal";
import { SubscriptionPlanDetailModal } from "@/features/master-data/components/subscription-plan-detail-modal";

export default function SubscriptionPlanPage() {
  const searchParams = useSearchParams();

  // Redux state
  const {
    subscriptionPlanState,
    subscriptionPlanData,
    subscriptionPlanContent,
    isLoading,
    filters,
    operations,
    pagination,
    dispatch,
  } = useSubscriptionPlanState();

  // Local UI state for modals only
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: ModalMode.CREATE_MODE,
    planId: "",
  });

  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    planId: "",
  });

  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    business: null as SubscriptionPlanResponseModel | null,
  });

  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(filters.search, 400);

  const { updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.SUBSCRIPTION_PLAN,
    defaultPageSize: 15,
  });

  // Initialize URL and Redux state on mount
  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;

    if (pageFromUrl !== pagination.currentPage) {
      dispatch(setPageNo(pageFromUrl));
    }
  }, [searchParams, filters.pageNo, dispatch]);

  // Fetch Subscription Plan when filters change
  useEffect(() => {
    dispatch(
      fetchAllSubscriptionPlanService({
        search: debouncedSearch,
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        statuses:
          filters.statuses === SubscriptionPlanStatus.ALL
            ? []
            : [filters.statuses],
      })
    );
  }, [dispatch, debouncedSearch, filters.statuses, filters.pageNo, globalPageSize]);

  // Event handlers
  const handleCreatePlan = () => {
    setModalState({
      isOpen: true,
      mode: ModalMode.CREATE_MODE,
      planId: "",
    });
  };

  const handleEditPlan = (plan: SubscriptionPlanResponseModel) => {
    setModalState({
      isOpen: true,
      mode: ModalMode.UPDATE_MODE,
      planId: plan?.id || "",
    });
  };

  const handlePlanViewDetail = (plan: SubscriptionPlanResponseModel) => {
    setDetailModalState({
      isOpen: true,
      planId: plan.id || "",
    });
  };

  const handleDeletePlan = (plan: SubscriptionPlanResponseModel) => {
    setDeleteState({
      isOpen: true,
      business: plan,
    });
  };

  const tableHandlers = useMemo(
    () => ({
      handleEditPlan,
      handlePlanViewDetail,
      handleDeletePlan,
    }),
    []
  );

  const columns = useMemo(
    () =>
      subscriptionPlanTableColumns({
        data: subscriptionPlanData,
        handlers: tableHandlers,
      }),
    [subscriptionPlanState, tableHandlers]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleStatusChange = (status: SubscriptionPlanStatus) => {
    dispatch(setSubscriptionPlanStatusFilter(status));
  };

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
      title: "Subscription Plan",
      subtitle: "Manage and configure subscription plans and pricing",
      totalCount: pagination.totalElements,
      searchValue: filters.search,
      searchPlaceholder: "Search subscription plan...",
      onSearchChange: handleSearchChange,
      buttonText: "New Plan",
      buttonTooltip: "Create a new subscription plan",
      onButtonClick: handleCreatePlan,
      filters: [
        {
          id: "statuses",
          type: "select" as const,
          label: "Status",
          placeholder: "All Status",
          value: filters.statuses,
          onChange: (val: any) =>
            handleStatusChange(val as SubscriptionPlanStatus),
          options: SUBSCRIPTION_PLAN_FILTER,
        },
      ],
    }),
    [pagination.totalElements, filters.search, filters.statuses, handleSearchChange, handleCreatePlan, handleStatusChange]
  );

  const handleDelete = async () => {
    if (!deleteState.business?.id) return;

    try {
      await dispatch(
        deleteSubscriptionPlanService(deleteState.business.id)
      ).unwrap();

      showToast.success(
        `Subscription Plan "${
          deleteState.business.name ?? ""
        }" deleted successfully`
      );

      closeDeleteModal();

      // Navigate to previous page if this was the last item
      if (subscriptionPlanContent.length === 1 && pagination.currentPage > 1) {
        const newPage = pagination.currentPage - 1;
        dispatch(setPageNo(newPage));
        updateUrlWithPage(newPage);
      }
    } catch (error: unknown) {
      showToast.error(getErrorMessage(error, "Failed to delete Subscription Plan"));
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      mode: ModalMode.CREATE_MODE,
      planId: "",
    });
  };

  const closeDetailModal = () => {
    setDetailModalState({
      isOpen: false,
      planId: "",
    });
  };

  const closeDeleteModal = () => {
    setDeleteState({
      isOpen: false,
      business: null,
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CollapsibleFilterPanel
          config={filterConfig}
          essentialFilterIds={["statuses"]}
        />

        {/* Data Table with Pagination */}
        <DataTableWithPagination
          data={subscriptionPlanContent}
          columns={columns}
          loading={isLoading}
          emptyMessage="No Subscription Plan found"
          getRowKey={(plan) => plan.id}
          currentPage={filters.pageNo}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          onPageChange={handlePageChangeWrapper}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      {/* Modals Add/Edit */}
      <SubscriptionPlanModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        planId={modalState.planId}
        mode={modalState.mode}
      />

      {/* Modals Subscription Plan platform Detail */}
      <SubscriptionPlanDetailModal
        planId={detailModalState.planId}
        isOpen={detailModalState.isOpen}
        onClose={closeDetailModal}
      />

      {/* Modals Delete Subscription Plan */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        title="Delete Subscription Plan"
        description={`Are you sure you want to delete this subscription plan ${
          deleteState.business?.name || ""
        }?`}
        itemName={deleteState.business?.name || ""}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
