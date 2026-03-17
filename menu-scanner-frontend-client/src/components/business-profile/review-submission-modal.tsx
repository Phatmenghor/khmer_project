"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/shared/common/show-toast";
import { CustomerReview } from "@/types/business-profile";

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  onSubmit?: (review: Partial<CustomerReview>) => void;
}

export function ReviewSubmissionModal({
  isOpen,
  onClose,
  businessName,
  onSubmit,
}: ReviewSubmissionModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      customerName: "",
      comment: "",
    },
  });

  const onFormSubmit = (data: any) => {
    if (rating === 0) {
      showToast.error("Please select a rating");
      return;
    }

    const review: Partial<CustomerReview> = {
      customerName: data.customerName,
      rating,
      comment: data.comment,
      isApproved: false, // Requires admin approval
      createdAt: new Date().toISOString(),
    };

    console.log("Submitting review:", review);

    // Call parent handler or API
    onSubmit?.(review);

    showToast.success(
      "Thank you for your review! It will be published after approval."
    );

    // Reset form
    reset();
    setRating(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Write a Review</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* Business Name */}
          <div className="text-center pb-4 border-b">
            <p className="text-gray-600">You're reviewing</p>
            <h3 className="text-xl font-semibold text-orange-600">
              {businessName}
            </h3>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Your Rating *
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center mt-3 text-lg font-semibold text-gray-700">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Your Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Name *
            </label>
            <Controller
              name="customerName"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <Input {...field} placeholder="John Doe" />
              )}
            />
            {errors.customerName && (
              <p className="text-red-600 text-sm mt-1">
                {errors.customerName.message}
              </p>
            )}
          </div>

          {/* Review Comment */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tell us about your experience *
            </label>
            <Controller
              name="comment"
              control={control}
              rules={{
                required: "Please share your experience",
                minLength: {
                  value: 10,
                  message: "Please write at least 10 characters",
                },
              }}
              render={({ field }) => (
                <Textarea
                  {...field}
                  rows={5}
                  placeholder="What did you like? What could be improved? Share your experience..."
                />
              )}
            />
            {errors.comment && (
              <p className="text-red-600 text-sm mt-1">
                {errors.comment.message}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">Minimum 10 characters</p>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600">
              Your review will be reviewed by the business owner before being
              published. Thank you for your feedback!
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
