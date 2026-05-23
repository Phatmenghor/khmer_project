"use client";

import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { PortfolioReviewAdmin } from "../store/models/portfolio-types";

interface Props {
  review: PortfolioReviewAdmin | null;
  isOpen: boolean;
  onClose: () => void;
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
      <span className="text-sm text-muted-foreground ml-1">{rating} / 5</span>
    </div>
  );
}

export function PortfolioReviewDetailModal({ review, isOpen, onClose }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Review Details</DialogTitle>
      <DialogContent className="w-full sm:max-w-2xl max-h-[92dvh] p-0 gap-0 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {review?.customerName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Review Details</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                View detailed information about this customer review
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
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
                <CardTitle>Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <StarRating rating={review?.rating ?? 0} />
                </div>
                <DisplayField label="Comment" value={review?.comment} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DisplayField label="Review ID" value={review?.id} />
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
