import { dateTimeFormat } from "@/utils/date/date-time-format";
import { indexDisplay } from "@/utils/common/common";
import { Eye, Star, Trash } from "lucide-react";
import { ActionButton } from "@/components/shared/button/action-button";
import { TableColumn } from "@/components/shared/common/data-table";
import { PortfolioReviewAdmin } from "../store/models/portfolio-types";
import { PaginationResponseModel } from "@/features/master-data/store/models/response/pagination-response";

interface PortfolioReviewTableHandlers {
  handleViewDetail: (review: PortfolioReviewAdmin) => void;
  handleDeleteReview: (review: PortfolioReviewAdmin) => void;
}

interface PortfolioReviewTableOptions {
  data: PaginationResponseModel<PortfolioReviewAdmin> | null;
  handlers: PortfolioReviewTableHandlers;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-2 h-2 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export const portfolioReviewTableColumns = ({
  data,
  handlers,
}: PortfolioReviewTableOptions): TableColumn<PortfolioReviewAdmin>[] => {
  const { handleViewDetail, handleDeleteReview } = handlers;

  return [
    {
      key: "index",
      label: "#",
      minWidth: "10px",
      maxWidth: "400px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 10, index + 1)}
        </span>
      ),
    },
    {
      key: "customerName",
      label: "Name",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (r) => (
        <span className="text-xs font-medium text-foreground">
          {r.customerName || "—"}
        </span>
      ),
    },
    {
      key: "customerPhone",
      label: "Phone Number",
      minWidth: "10px",
      maxWidth: "400px",
      truncate: true,
      render: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.customerPhone || "—"}
        </span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      minWidth: "10px",
      maxWidth: "400px",
      render: (r) => <StarRating rating={r.rating} />,
    },
    {
      key: "comment",
      label: "Review",
      minWidth: "10px",
      maxWidth: "400px",
      render: (r) => (
        <div className="max-w-xs">
          <p className="text-xs text-muted-foreground line-clamp-2">{r.comment || "—"}</p>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Submitted At",
      minWidth: "10px",
      maxWidth: "400px",
      render: (r) => (
        <span className="text-xs text-muted-foreground">
          {r.createdAt ? dateTimeFormat(r.createdAt) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      minWidth: "10px",
      maxWidth: "400px",
      render: (r) => (
        <div className="flex items-center gap-1">
          <ActionButton
            icon={<Eye className="w-3 h-3" />}
            tooltip="View Details"
            onClick={() => handleViewDetail(r)}
          />
          <ActionButton
            icon={<Trash className="w-3 h-3" />}
            tooltip="Delete Review"
            onClick={() => handleDeleteReview(r)}
            variant="destructive"
          />
        </div>
      ),
    },
  ];
};
