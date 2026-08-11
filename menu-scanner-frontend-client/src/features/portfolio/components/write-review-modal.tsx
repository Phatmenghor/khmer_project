"use client";

import { useState } from "react";
import { Star, CheckCircle2, MessageSquarePlus, Send } from "lucide-react";
import { CustomModal } from "@/components/shared/modal/custom-modal";
import { CustomButton } from "@/components/shared/button/custom-button";
import { useAppDispatch, useAppSelector } from "@/store";
import { submitPublicReviewThunk, fetchPublicPortfolioThunk } from "../store/thunks/portfolio-thunks";
import { selectIsSubmittingReview } from "../store/selectors/portfolio-selectors";
import { PortfolioReviewSubmitRequest } from "../store/models/portfolio-types";

export function StarRow({ rating, size = 4 }: { rating: number; size?: number }) {
  const px = `${size * 4}px`;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: px, height: px }}
          className={i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-border"}
        />
      ))}
    </div>
  );
}

interface ReviewForm {
  name: string;
  phone: string;
  rating: number;
  comment: string;
}

export interface WriteReviewModalProps {
  open: boolean;
  onClose: () => void;
  businessName: string;
  businessId: string;
}

export function WriteReviewModal({
  open,
  onClose,
  businessName,
  businessId,
}: WriteReviewModalProps) {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector(selectIsSubmittingReview);
  const [form, setForm] = useState<ReviewForm>({ name: "", phone: "", rating: 0, comment: "" });
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function reset() {
    setForm({ name: "", phone: "", rating: 0, comment: "" });
    setHover(0);
    setSubmitted(false);
    setSubmitError("");
  }

  function handleClose() {
    onClose();
    setTimeout(reset, 300);
  }

  async function handleSubmit() {
    if (!form.rating || !form.name.trim() || !form.phone.trim() || !form.comment.trim()) return;
    setSubmitError("");
    const request: PortfolioReviewSubmitRequest = {
      customerName: form.name.trim(),
      customerPhone: form.phone.trim(),
      rating: form.rating,
      comment: form.comment.trim(),
    };
    const result = await dispatch(submitPublicReviewThunk({ businessId, request }));
    if (submitPublicReviewThunk.fulfilled.match(result)) {
      setSubmitted(true);
      dispatch(fetchPublicPortfolioThunk(businessId));
    } else {
      setSubmitError("Failed to submit review. Please try again.");
    }
  }

  const isFormValid = Boolean(form.rating && form.name.trim() && form.phone.trim() && form.comment.trim());

  return (
    <CustomModal isOpen={open} onClose={handleClose} size="lg">
      {/* ── Fixed Header ── */}
      <div className="flex items-center justify-between p-4 px-5 border-b border-border/80 bg-background shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${
            submitted 
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
              : "bg-primary/10 text-primary border-primary/20"
          }`}>
            {submitted ? <CheckCircle2 className="w-4 h-4" /> : <MessageSquarePlus className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-foreground">
              {submitted ? "Review Submitted Successfully" : "Write a Customer Review"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {submitted ? "Thank you! Your feedback has been recorded." : `Share your experience and rate your visit at ${businessName}`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Dynamic Height Body ── */}
      <div className="flex-1 max-h-[75vh] overflow-y-auto p-5 space-y-4 bg-card/40 backdrop-blur-xs transition-all duration-300">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 p-6 text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-xs animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <p className="font-extrabold text-foreground text-sm">Thank you for your feedback!</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your customer review for <span className="font-semibold text-foreground">{businessName}</span> has been recorded successfully.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Star Rating Section */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Your Rating <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2 p-3 rounded-xl border border-border/80 bg-background/80 shadow-2xs">
                {[1, 2, 3, 4, 5].map((s) => (
                  <CustomButton
                    variant="unstyled"
                    size="unstyled"
                    key={s}
                    type="button"
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setForm((f) => ({ ...f, rating: s }))}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className="w-6 h-6 transition-colors"
                      style={{
                        color: s <= (hover || form.rating) ? "#facc15" : "#cbd5e1",
                        fill: s <= (hover || form.rating) ? "#facc15" : "transparent",
                      }}
                    />
                  </CustomButton>
                ))}
                {(hover || form.rating) > 0 && (
                  <span className="text-xs font-bold text-primary ml-2">
                    {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hover || form.rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Customer Name & Phone Grid (Exact Same Row Alignment) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center h-5">
                  <span>Your Name</span>
                  <span className="text-destructive ml-0.5">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Enter your name..."
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center h-5">
                  <span>Phone Number</span>
                  <span className="text-destructive ml-0.5">*</span>
                </label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="Enter your phone number..."
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Review Comment */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground flex items-center h-5">
                <span>Your Review</span>
                <span className="text-destructive ml-0.5">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Enter review comments..."
                disabled={isSubmitting}
                className="w-full rounded-xl border border-border/80 bg-background px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
              />
            </div>

            {submitError && (
              <p className="text-xs font-semibold text-destructive">{submitError}</p>
            )}
          </>
        )}
      </div>

      {/* ── Sticky Custom Footer ── */}
      <div className="p-4 px-5 border-t border-border/80 bg-background/95 backdrop-blur-md flex items-center justify-end gap-2 shrink-0">
        {submitted ? (
          <CustomButton
            type="button"
            variant="primary"
            size="sm"
            onClick={handleClose}
            className="font-bold min-w-[120px]"
          >
            Close
          </CustomButton>
        ) : (
          <>
            <CustomButton
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </CustomButton>
            <CustomButton
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid}
              isLoading={isSubmitting}
              className="gap-1.5 font-bold min-w-[140px]"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Submit Review
                </>
              )}
            </CustomButton>
          </>
        )}
      </div>
    </CustomModal>
  );
}
