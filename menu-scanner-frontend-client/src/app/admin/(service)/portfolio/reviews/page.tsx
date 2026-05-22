"use client";

import { useEffect, useState } from "react";
import { Trash2, Star, Search } from "lucide-react";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
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
import { AppDefault } from "@/constants/app-resource/default/default";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const debouncedSearch = useDebounce(filters.search, 400);

  const [deleteTarget, setDeleteTarget] = useState<PortfolioReviewAdmin | null>(null);

  const pageSize = AppDefault.PAGE_SIZE;

  useEffect(() => {
    dispatch(
      fetchPortfolioReviewsThunk({
        pageNo: filters.pageNo,
        pageSize,
        search: debouncedSearch || undefined,
      })
    );
  }, [dispatch, filters.pageNo, debouncedSearch]);

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await dispatch(deleteReviewThunk(deleteTarget.id));
    if (deleteReviewThunk.fulfilled.match(result)) {
      showToast.success("Review deleted");
      setDeleteTarget(null);
    } else {
      showToast.error("Failed to delete review");
    }
  }

  const columns: TableColumn<PortfolioReviewAdmin>[] = [
    {
      key: "customer",
      label: "Customer",
      render: (r) => (
        <div>
          <p className="text-sm font-medium text-foreground">{r.customerName}</p>
          {r.customerPhone && (
            <p className="text-xs text-muted-foreground">{r.customerPhone}</p>
          )}
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (r) => <StarRating rating={r.rating} />,
    },
    {
      key: "review",
      label: "Review",
      render: (r) => (
        <div className="max-w-xs">
          <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 text-destructive border-destructive/30 hover:bg-destructive/5"
          disabled={operations.isDeleting}
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(r);
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 px-2 pb-8">
      <CardHeaderSection title="Customer Reviews" />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name..."
            value={filters.search}
            onChange={(e) => {
              dispatch(setSearchFilter(e.target.value));
            }}
            className="pl-9"
          />
        </div>
      </div>

      <DataTableWithPagination
        data={content}
        columns={columns}
        loading={isLoading}
        emptyMessage="No reviews found"
        currentPage={filters.pageNo}
        totalPages={data?.totalPages ?? 1}
        totalElements={data?.totalElements ?? 0}
        pageSize={pageSize}
        onPageChange={(page) => dispatch(setPageNo(page))}
        getRowKey={(r) => r.id}
        showPageSizeSelector={false}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={handleDelete}
        title="Delete Review"
        description={`Are you sure you want to delete the review from "${deleteTarget?.customerName}"? This action cannot be undone.`}
        isSubmitting={operations.isDeleting}
      />
    </div>
  );
}
