"use client";

import { Star, User, MessageSquare, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { PortfolioReviewAdmin } from "../store/models/portfolio-types";

interface Props {
  review: PortfolioReviewAdmin | null;
  isOpen: boolean;
  onClose: () => void;
}

// Shared section card title — unified style across the page (mirrors portfolio)
function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="shrink-0 p-1.5 rounded-md bg-primary/10 text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <CardTitle className="text-sm font-semibold leading-tight">{title}</CardTitle>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating} / 5</span>
    </div>
  );
}

export function PortfolioReviewDetailModal({ review, isOpen, onClose }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full sm:max-w-xl max-h-[92vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogTitle className="sr-only">Review Details</DialogTitle>
        <DialogDescription className="sr-only">Detailed view of portfolio review</DialogDescription>
        {/* Header — matches portfolio page-header proportions */}
        <div className="px-5 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 flex-shrink-0 rounded-md bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {review?.customerName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight">Review Details</h2>
              <p className="text-sm text-muted-foreground">
                View detailed information about this customer review
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-5">
            <Card>
              <CardHeader>
                <SectionTitle
                  icon={User}
                  title="Customer Information"
                  subtitle="Who left this review"
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField label="Customer Name" value={review?.customerName} />
                  <DisplayField label="Phone Number" value={review?.customerPhone} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SectionTitle
                  icon={MessageSquare}
                  title="Review"
                  subtitle="Rating and customer comment"
                />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-1 w-full">
                  <p className="text-xs font-medium text-foreground">Rating</p>
                  <StarRating rating={review?.rating ?? 0} />
                </div>
                <DisplayField label="Comment" value={review?.comment} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SectionTitle
                  icon={Info}
                  title="System Information"
                  subtitle="When this review was recorded"
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField label="Submitted At" value={dateTimeFormat(review?.createdAt ?? "")} />
                  <DisplayField label="Last Updated" value={dateTimeFormat(review?.updatedAt ?? "")} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
