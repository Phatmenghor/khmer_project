"use client";

import { useEffect, useState } from "react";
import { Check, X, Trash2, Star, Search } from "lucide-react";
import { CardHeaderSection } from "@/components/layout/card-header-section";
import { DataTableWithPagination, TableColumn } from "@/components/shared/common/data-table";
import { DeleteConfirmationModal } from "@/components/shared/modal/delete-confirmation-modal";
import { CustomSelect } from "@/components/shared/common/custom-select";
import { showToast } from "@/components/shared/common/show-toast";
import { useDebounce } from "@/utils/debounce/debounce";
import { useAdminCleanup } from "@/hooks/use-cleanup-on-unmount";
import { usePortfolioReviewsState } from "@/features/portfolio/store/state/portfolio-reviews-state";
import {
  fetchPortfolioReviewsThunk,
  approveReviewThunk,
  rejectReviewThunk,
  deleteReviewThunk,
} from "@/features/portfolio/store/thunks/portfolio-thunks";
import {
  setSearchFilter,
  setPageNo,
  setApprovedFilter,
  resetState,
} from "@/features/portfolio/store/slice/portfolio-reviews-slice";
import { PortfolioReviewAdmin } from "@/features/portfolio/store/models/portfolio-types";
import { AppDefault } from "@/constants/app-resource/default/default";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUS_OPTIONS = [
  { value: "ALL",   label: "All Reviews"  },
  { value: "true",  label: "Approved"     },
  { value: "false", label: "Pending"      },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} className={`w-3 h-3 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
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
    dispatch(fetchPortfolioReviewsThunk({
      pageNo: filters.pageNo,
      pageSize,
      search: debouncedSearch || undefined,
      isApproved: filters.isApproved === "ALL" ? null : filters.isApproved === "true",
    }));
  }, [dispatch, filters.pageNo, debouncedSearch, filters.isApproved]);

  async function handleApprove(review: PortfolioReviewAdmin) {
    const result = await dispatch(approveReviewThunk(review.id));
    if (approveReviewThunk.fulfilled.match(result)) {
      showToast.success("Review approved");
    } else {
      showToast.error("Failed to approve review");
    }
  }

  async function handleReject(review: PortfolioReviewAdmin) {
    const result = await dispatch(rejectReviewThunk(review.id));
    if (rejectReviewThunk.fulfilled.match(result)) {
      showToast.success("Review rejected");
    } else {
      showToast.error("Failed to reject review");
    }
  }

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
          {r.customerEmail && <p className="text-xs text-muted-foreground">{r.customerEmail}</p>}
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
          {r.title && <p className="text-xs font-semibold text-foreground mb-0.5">{r.title}</p>}
          <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        r.isApproved === true
          ? <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Approved</Badge>
          : r.isApproved === false
            ? <Badge variant="destructive" className="text-xs">Rejected</Badge>
            : <Badge variant="outline" className="text-xs">Pending</Badge>
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
        <div className="flex items-center gap-1.5">
          {!r.isApproved && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 gap-1 text-green-600 border-green-200 hover:bg-green-50"
              disabled={operations.isApproving}
              onClick={(e) => { e.stopPropagation(); handleApprove(r); }}
            >
              <Check className="w-3 h-3" />
              Approve
            </Button>
          )}
          {r.isApproved !== false && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
              disabled={operations.isRejecting}
              onClick={(e) => { e.stopPropagation(); handleReject(r); }}
            >
              <X className="w-3 h-3" />
              Reject
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-destructive border-destructive/30 hover:bg-destructive/5"
            disabled={operations.isDeleting}
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 px-2 pb-8">
      <CardHeaderSection title="Customer Reviews" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name..."
            value={filters.search}
            onChange={(e) => { dispatch(setSearchFilter(e.target.value)); }}
            className="pl-9"
          />
        </div>
        <CustomSelect
          value={filters.isApproved}
          onValueChange={(v) => dispatch(setApprovedFilter(v))}
          options={STATUS_OPTIONS}
          placeholder="All Reviews"
          className="w-44"
        />
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
