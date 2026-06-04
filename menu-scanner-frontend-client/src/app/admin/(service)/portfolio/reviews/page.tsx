"use client";

import { useEffect, useMemo, useState } from "react";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { DataTableWithPagination } from "@/components/shared/common/data-table";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { showToast } from "@/components/shared/common/show-toast";
import { useDebounce } from "@/utils/debounce/debounce";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { usePortfolioReviewsState } from "@/features/portfolio/store/state/portfolio-reviews-state";
import {
  fetchPortfolioReviewsThunk,
  deleteReviewThunk,
} from "@/features/portfolio/store/thunks/portfolio-thunks";
import {
  setSearchFilter,
  setPageNo,
  resetState,
} from "@/features/portfolio/store/slice/portfolio-reviews-slice";
import { PortfolioReviewAdmin } from "@/features/portfolio/store/models/portfolio-types";
import { PortfolioReviewDetailModal } from "@/features/portfolio/components/portfolio-review-detail-modal";
import { portfolioReviewTableColumns } from "@/features/portfolio/table/portfolio-reviews-table";
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";

export default function PortfolioReviewsPage() {
  useAdminCleanup(resetState);

  const { data, content, isLoading, filters, operations, dispatch } = usePortfolioReviewsState();
  const globalPageSize = useAppSelector(selectGlobalPageSize);
  const debouncedSearch = useDebounce(filters.search, 400);

  const [detailModalState, setDetailModalState] = useState<{
    isOpen: boolean;
    review: PortfolioReviewAdmin | null;
  }>({
    isOpen: false,
    review: null,
  });

  const [deleteState, setDeleteState] = useState<{
    isOpen: boolean;
    review: PortfolioReviewAdmin | null;
  }>({
    isOpen: false,
    review: null,
  });

  useEffect(() => {
    dispatch(
      fetchPortfolioReviewsThunk({
        pageNo: filters.pageNo,
        pageSize: globalPageSize,
        search: debouncedSearch || undefined,
      })
    );
  }, [dispatch, filters.pageNo, debouncedSearch, globalPageSize]);

  const handleViewDetail = (review: PortfolioReviewAdmin) =>
    setDetailModalState({ isOpen: true, review });

  const handleDeleteReview = (review: PortfolioReviewAdmin) =>
    setDeleteState({ isOpen: true, review });

  const tableHandlers = useMemo(
    () => ({ handleViewDetail, handleDeleteReview }),
    []
  );

  const columns = useMemo(
    () => portfolioReviewTableColumns({ data, handlers: tableHandlers }),
    [data, tableHandlers]
  );

  const handlePageSizeChange = (size: number) => {
    dispatch(setGlobalPageSize(size));
    dispatch(setPageNo(1));
  };

  const handleDelete = async () => {
    if (!deleteState.review) return;
    const result = await dispatch(deleteReviewThunk(deleteState.review.id));
    if (deleteReviewThunk.fulfilled.match(result)) {
      showToast.success("Review deleted successfully");
      setDeleteState({ isOpen: false, review: null });
    } else {
      showToast.error("Failed to delete review");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3 px-1">
      <div className="space-y-3">
        <CardHeaderSection
          title="Customer Reviews"
          searchValue={filters.search}
          searchPlaceholder="Search by customer name..."
          onSearchChange={(e) => dispatch(setSearchFilter(e.target.value))}
        />

        <DataTableWithPagination
          data={content}
          columns={columns}
          loading={isLoading}
          emptyMessage="No reviews found"
          getRowKey={(r) => r.id}
          currentPage={filters.pageNo}
          totalElements={data?.totalElements ?? 0}
          totalPages={data?.totalPages ?? 1}
          onPageChange={(page) => dispatch(setPageNo(page))}
          pageSize={globalPageSize}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={AppDefault.PAGE_SIZE_OPTIONS}
        />
      </div>

      <PortfolioReviewDetailModal
        review={detailModalState.review}
        isOpen={detailModalState.isOpen}
        onClose={() => setDetailModalState({ isOpen: false, review: null })}
      />

      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={() => setDeleteState({ isOpen: false, review: null })}
        onDelete={handleDelete}
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        itemName={deleteState.review?.customerName}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
