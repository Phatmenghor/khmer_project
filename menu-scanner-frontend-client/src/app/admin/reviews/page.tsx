"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Star,
  MessageSquare,
  Check,
  X,
  MessageCircle,
  ThumbsUp,
  Calendar,
  BadgeCheck,
  Mail,
  Phone,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { demoBusinessProfile } from "@/data/business-profile-template";
import { CustomerReview } from "@/types/business-profile";
import { showToast } from "@/components/shared/common/show-toast";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<CustomerReview[]>(
    demoBusinessProfile.reviews || []
  );
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved">(
    "all"
  );
  const [responseText, setResponseText] = useState<Record<string, string>>({});

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprove = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId ? { ...review, isApproved: true } : review
      )
    );
    showToast.success("Review approved successfully");
    // TODO: API call to approve review
  };

  const handleReject = (reviewId: string) => {
    if (confirm("Are you sure you want to reject this review?")) {
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      showToast.success("Review rejected");
      // TODO: API call to reject/delete review
    }
  };

  const handleRespond = (reviewId: string) => {
    const message = responseText[reviewId];
    if (!message || !message.trim()) {
      showToast.error("Please enter a response");
      return;
    }

    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              businessResponse: {
                message: message.trim(),
                respondedAt: new Date().toISOString(),
                respondedBy: "Business Owner", // TODO: Get from auth
              },
            }
          : review
      )
    );
    setResponseText((prev) => ({ ...prev, [reviewId]: "" }));
    showToast.success("Response added successfully");
    // TODO: API call to save response
  };

  const filteredReviews = reviews.filter((review) => {
    if (filterStatus === "pending") return !review.isApproved;
    if (filterStatus === "approved") return review.isApproved;
    return true;
  });

  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0;
  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-3xl font-bold">Customer Reviews</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage and respond to customer feedback
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">Average Rating</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {reviews.length}
              </div>
              <p className="text-sm text-gray-600 mt-1">Total Reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {reviews.filter((r) => r.isApproved).length}
              </div>
              <p className="text-sm text-gray-600 mt-1">Approved</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {pendingCount}
              </div>
              <p className="text-sm text-gray-600 mt-1">Pending Approval</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          onClick={() => setFilterStatus("all")}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          All ({reviews.length})
        </Button>
        <Button
          variant={filterStatus === "pending" ? "default" : "outline"}
          onClick={() => setFilterStatus("pending")}
          className="gap-2"
        >
          Pending ({pendingCount})
        </Button>
        <Button
          variant={filterStatus === "approved" ? "default" : "outline"}
          onClick={() => setFilterStatus("approved")}
          className="gap-2"
        >
          Approved ({reviews.filter((r) => r.isApproved).length})
        </Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Customer Photo */}
                  {review.customerPhoto && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={review.customerPhoto}
                        alt={review.customerName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">
                            {review.customerName}
                          </h3>
                          {review.isVerified && (
                            <BadgeCheck className="w-5 h-5 text-green-600" />
                          )}
                          {review.isApproved ? (
                            <Badge className="bg-green-100 text-green-700">
                              ✓ Approved
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-700">
                              ⏱ Pending
                            </Badge>
                          )}
                          {review.wouldRecommend && (
                            <Badge variant="outline" className="text-green-600">
                              👍 Recommends
                            </Badge>
                          )}
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                          {review.customerEmail && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {review.customerEmail}
                            </div>
                          )}
                          {review.customerPhone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {review.customerPhone}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {!review.isApproved && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(review.id)}
                            className="gap-1"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(review.id)}
                            className="gap-1"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    {/* Review Title */}
                    {review.title && (
                      <h4 className="font-semibold text-lg mb-2">
                        {review.title}
                      </h4>
                    )}

                    {/* Review Comment */}
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {review.comment}
                    </p>

                    {/* Additional Details */}
                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                      {review.visitDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Visited: {new Date(review.visitDate).toLocaleDateString()}
                        </div>
                      )}
                      {review.serviceUsed && (
                        <div>Service: {review.serviceUsed}</div>
                      )}
                      {review.helpfulCount !== undefined && (
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {review.helpfulCount} found helpful
                        </div>
                      )}
                    </div>

                    {/* Review Photos */}
                    {review.photos && review.photos.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {review.photos.map((photo, index) => (
                          <div
                            key={index}
                            className="relative w-24 h-24 rounded-lg overflow-hidden"
                          >
                            <Image
                              src={photo}
                              alt="Review photo"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Business Response */}
                    {review.businessResponse ? (
                      <div className="border-l-4 border-orange-500 pl-4 bg-orange-50 p-4 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-4 h-4 text-orange-600" />
                          <span className="font-semibold text-sm">
                            Your Response
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {review.businessResponse.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Responded on {formatDate(review.businessResponse.respondedAt)}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded">
                        <label className="block text-sm font-medium mb-2">
                          Respond to this review
                        </label>
                        <Textarea
                          value={responseText[review.id] || ""}
                          onChange={(e) =>
                            setResponseText((prev) => ({
                              ...prev,
                              [review.id]: e.target.value,
                            }))
                          }
                          placeholder="Thank the customer or address their feedback..."
                          rows={3}
                          className="mb-2"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleRespond(review.id)}
                          className="gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Post Response
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  {filterStatus === "pending"
                    ? "No pending reviews"
                    : filterStatus === "approved"
                    ? "No approved reviews yet"
                    : "No reviews yet"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
