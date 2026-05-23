"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Star, Trash } from "lucide-react";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { ActionButton } from "@/components/shared/button/action-button";
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
import { AppDefault } from "@/constants/app-resource/default/default";
import { setGlobalPageSize } from "@/store/slices/global-settings-slice";
import { selectGlobalPageSize } from "@/store/selectors/global-settings-selectors";
import { useAppSelector } from "@/store";
import { dateTimeFormat } from "@/utils/date/date-time-format";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

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
    (): TableColumn<PortfolioReviewAdmin>[] => [
      {
        key: "customerName",
        label: "Name",
        render: (r) => (
          <span className="text-sm font-medium text-foreground">
            {r.customerName || "—"}
          </span>
        ),
      },
      {
        key: "customerPhone",
        label: "Phone Number",
        render: (r) => (
          <span className="text-xs text-muted-foreground">
            {r.customerPhone || "—"}
          </span>
        ),
      },
      {
        key: "rating",
        label: "Rating",
        render: (r) => <StarRating rating={r.rating} />,
      },
      {
        key: "comment",
        label: "Review",
        render: (r) => (
          <div className="max-w-xs">
            <p className="text-xs text-muted-foreground line-clamp-2">{r.comment || "—"}</p>
          </div>
        ),
      },
      {
        key: "createdAt",
        label: "Submitted At",
        render: (r) => (
          <span className="text-xs text-muted-foreground">
            {r.createdAt ? dateTimeFormat(r.createdAt) : "—"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (r) => (
          <div className="flex items-center gap-2">
            <ActionButton
              icon={<Eye className="w-4 h-4" />}
              tooltip="View Details"
              onClick={() => tableHandlers.handleViewDetail(r)}
            />
            <ActionButton
              icon={<Trash className="w-4 h-4" />}
              tooltip="Delete Review"
              onClick={() => tableHandlers.handleDeleteReview(r)}
              variant="destructive"
            />
          </div>
        ),
      },
    ],
    [tableHandlers]
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
    <div className="flex flex-1 flex-col gap-4 px-2">
      <div className="space-y-4">
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
        description={`Are you sure you want to delete the review from "${deleteState.review?.customerName}"? This action cannot be undone.`}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
