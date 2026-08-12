"use client";

import React from "react";
import { Star } from "lucide-react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { CancelButton } from "@/components/shared/button/custom-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { PortfolioReviewAdmin } from "../store/models/portfolio-types";

interface Props {
  review: PortfolioReviewAdmin | null;
  isOpen: boolean;
  onClose: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-bold text-foreground">{rating ? rating.toFixed(1) : "0.0"}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-muted/30"}`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-muted-foreground ml-1">/ 5.0</span>
    </div>
  );
}

export function PortfolioReviewDetailModal({ review, isOpen, onClose }: Props) {
  if (!review) return null;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="xl">
      {/* ── Header ── */}
      <FormHeader
        title="Review Details"
        description={
          review.customerName
            ? `Review by ${review.customerName}`
            : "Anonymous customer review"
        }
        showAvatar={false}
        isCreate={false}
      />

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">

          {/* Customer Information */}
          <Card className="border border-border/80 shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold text-foreground">
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <DisplayField label="Customer Name" value={review.customerName || "Anonymous Guest"} />
                <DisplayField label="Phone Number" value={review.customerPhone || "Not provided"} />
              </div>
            </CardContent>
          </Card>

          {/* Feedback & Rating */}
          <Card className="border border-border/80 shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold text-foreground">
                Customer Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              {/* Star Rating */}
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-semibold text-muted-foreground">Star Rating</p>
                <StarRating rating={review.rating ?? 0} />
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground">Review Comment</p>
                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                  {review.comment || "No written comment provided."}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="border border-border/80 shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold text-foreground">
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <DisplayField label="Submitted Date" value={dateTimeFormat(review.createdAt ?? "")} />
                <DisplayField label="Last Updated" value={dateTimeFormat(review.updatedAt ?? "")} />
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-3.5 border-t border-border/70 bg-gradient-to-r from-muted/50 to-muted/30 flex-shrink-0 flex items-center justify-end">
        <CancelButton onClick={onClose} customText="Close" />
      </div>
    </CustomModal>
  );
}
