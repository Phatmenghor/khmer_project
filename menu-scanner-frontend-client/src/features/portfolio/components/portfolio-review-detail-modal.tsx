"use client";

import React from "react";
import { Star, User, MessageSquare, Calendar, Eye } from "lucide-react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { CustomButton } from "@/components/shared/button/custom-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DisplayField } from "@/components/shared/form-field/display-field";
import { dateTimeFormat } from "@/utils/date/date-time-format";
import { PortfolioReviewAdmin } from "../store/models/portfolio-types";

interface Props {
  review: PortfolioReviewAdmin | null;
  isOpen: boolean;
  onClose: () => void;
}

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
      <div className="shrink-0 p-1.5 rounded-md bg-primary/10 text-primary border border-primary/20">
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <CardTitle className="text-sm font-bold leading-tight">{title}</CardTitle>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
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
      {/* ── Modal Header ── */}
      <div className="flex items-center justify-between p-4 px-5 border-b border-border/80 bg-background shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-foreground">Review Details</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Inspect customer rating score, contact identity, and review message
            </p>
          </div>
        </div>
      </div>

      {/* ── Scrollable Modal Body ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[75vh] bg-card/40 backdrop-blur-xs">
        {/* Customer Information */}
        <Card className="border border-border/80 bg-background/50 shadow-2xs">
          <CardHeader className="pb-3">
            <SectionTitle
              icon={User}
              title="Customer Information"
              subtitle="Reviewer identity & contact details"
            />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DisplayField label="Customer Name" value={review.customerName || "Anonymous Guest"} />
              <DisplayField label="Phone Number" value={review.customerPhone || "Not provided"} />
            </div>
          </CardContent>
        </Card>

        {/* Customer Feedback & Rating */}
        <Card className="border border-border/80 bg-background/50 shadow-2xs">
          <CardHeader className="pb-3">
            <SectionTitle
              icon={MessageSquare}
              title="Customer Feedback"
              subtitle="Rating score and written comment"
            />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-1.5 w-full">
              <p className="text-xs font-semibold text-muted-foreground">Star Rating Score</p>
              <StarRating rating={review.rating ?? 0} />
            </div>
            <div className="space-y-1 pt-1">
              <p className="text-xs font-semibold text-muted-foreground">Review Comment</p>
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                {review.comment || "No written comment provided."}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Timestamp Info */}
        <Card className="border border-border/80 bg-background/50 shadow-2xs">
          <CardHeader className="pb-3">
            <SectionTitle
              icon={Calendar}
              title="System Information"
              subtitle="Submission timestamp record"
            />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DisplayField label="Submitted Date" value={dateTimeFormat(review.createdAt ?? "")} />
              <DisplayField label="Last Updated" value={dateTimeFormat(review.updatedAt ?? "")} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Sticky Modal Footer ── */}
      <div className="p-4 px-5 border-t border-border/80 bg-background/95 backdrop-blur-md flex items-center justify-end gap-2 shrink-0">
        <CustomButton
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
          className="font-bold min-w-[100px]"
        >
          Close
        </CustomButton>
      </div>
    </CustomModal>
  );
}
