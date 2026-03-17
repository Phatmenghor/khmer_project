"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Star,
  Check,
  ExternalLink,
  MessageCircle,
  ThumbsUp,
  BadgeCheck,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { demoBusinessProfile } from "@/data/business-profile-template";
import { BusinessProfile, DayOfWeek, CustomerReview } from "@/types/business-profile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewSubmissionModal } from "@/components/business-profile/review-submission-modal";

export default function BusinessProfilePage() {
  const [profile] = useState<BusinessProfile>(demoBusinessProfile);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const getDayLabel = (day: DayOfWeek): string => {
    return day.charAt(0) + day.slice(1).toLowerCase();
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAverageRating = (reviews?: CustomerReview[]): number => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  };

  const getRatingDistribution = (reviews?: CustomerReview[]) => {
    if (!reviews) return {};
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1;
    });
    return dist;
  };

  const averageRating = calculateAverageRating(profile.reviews);
  const ratingDistribution = getRatingDistribution(profile.reviews);
  const totalReviews = profile.reviews?.length || 0;
  const servicesList = profile.services?.map((s) => s.name) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Cover Image */}
      <section className="relative h-[400px] bg-gradient-to-r from-orange-500 to-orange-600">
        {profile.coverImage && (
          <Image
            src={profile.coverImage}
            alt={profile.businessName}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/40" />

        {/* Business Name & Logo */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Logo */}
              {profile.logo && (
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-white">
                  <Image
                    src={profile.logo}
                    alt={`${profile.businessName} logo`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Business Info */}
              <div className="flex-1 text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {profile.businessName}
                </h1>
                {profile.tagline && (
                  <p className="text-xl md:text-2xl text-orange-100">
                    {profile.tagline}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge className="bg-white/20 text-white border-white/30">
                    {profile.businessType}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30">
                    {profile.industry}
                  </Badge>
                  {totalReviews > 0 && (
                    <Badge className="bg-white/20 text-white border-white/30 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {averageRating.toFixed(1)} ({totalReviews} reviews)
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">About Us</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {profile.description}
                </p>

                {/* Features */}
                {profile.features && profile.features.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Features & Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {profile.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services Section */}
            {profile.services && profile.services.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">Our Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.services.map((service) => (
                      <div
                        key={service.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          {service.icon && (
                            <span className="text-3xl">{service.icon}</span>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {service.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {service.description}
                            </p>
                            {service.price && (
                              <p className="text-orange-600 font-semibold mt-2">
                                {service.currency} ${service.price.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gallery */}
            {profile.gallery && profile.gallery.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {profile.gallery.map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                      >
                        <Image
                          src={item.url}
                          alt={item.title || "Gallery image"}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {item.title && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                            <p className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.title}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team Section */}
            {profile.team && profile.team.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6">Meet Our Team</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {profile.team.map((member) => (
                      <div key={member.id} className="text-center">
                        {member.photo && (
                          <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                            <Image
                              src={member.photo}
                              alt={member.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-orange-600 text-sm">{member.position}</p>
                        {member.bio && (
                          <p className="text-gray-600 text-sm mt-2">{member.bio}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Customer Reviews Section - RATINGS ONLY */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Customer Reviews</h2>
                  <Button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Write a Review
                  </Button>
                </div>

                {/* Rating Summary - ONLY THIS IS SHOWN */}
                {profile.reviews && profile.reviews.length > 0 ? (
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-8">
                    <div className="text-center mb-6">
                      <div className="text-6xl font-bold text-orange-600 mb-2">
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-6 h-6 ${
                              i < Math.round(averageRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 font-medium">
                        Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>

                    {/* Rating Distribution - NO LABELS */}
                    <div className="space-y-2 max-w-md mx-auto">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="text-sm font-medium w-16">{rating} star</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-yellow-400 h-3 rounded-full transition-all"
                              style={{
                                width: `${
                                  totalReviews > 0
                                    ? ((ratingDistribution[rating] || 0) /
                                        totalReviews) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8">
                            {ratingDistribution[rating] || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">
                      No reviews yet. Be the first to review!
                    </p>
                    <Button onClick={() => setIsReviewModalOpen(true)}>
                      Write the First Review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            {profile.stats && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {profile.stats.yearsInBusiness && (
                      <div>
                        <div className="text-3xl font-bold text-orange-600">
                          {profile.stats.yearsInBusiness}+
                        </div>
                        <div className="text-gray-600 text-sm mt-1">
                          Years in Business
                        </div>
                      </div>
                    )}
                    {profile.stats.customersServed && (
                      <div>
                        <div className="text-3xl font-bold text-orange-600">
                          {profile.stats.customersServed.toLocaleString()}+
                        </div>
                        <div className="text-gray-600 text-sm mt-1">
                          Happy Customers
                        </div>
                      </div>
                    )}
                    {profile.stats.customStats?.map((stat, index) => (
                      <div key={index}>
                        <div className="text-3xl font-bold text-orange-600">
                          {stat.icon} {stat.value}
                        </div>
                        <div className="text-gray-600 text-sm mt-1">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">Contact Us</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-700">
                        {profile.contact.address.street}
                      </p>
                      <p className="text-sm text-gray-700">
                        {profile.contact.address.city},{" "}
                        {profile.contact.address.state}
                      </p>
                      <p className="text-sm text-gray-700">
                        {profile.contact.address.country}{" "}
                        {profile.contact.address.postalCode}
                      </p>
                      {profile.contact.mapLink && (
                        <a
                          href={profile.contact.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 text-sm hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          View on Map <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-orange-600" />
                    <a
                      href={`tel:${profile.contact.phone}`}
                      className="text-sm text-gray-700 hover:text-orange-600"
                    >
                      {profile.contact.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-orange-600" />
                    <a
                      href={`mailto:${profile.contact.email}`}
                      className="text-sm text-gray-700 hover:text-orange-600"
                    >
                      {profile.contact.email}
                    </a>
                  </div>

                  {profile.contact.whatsapp && (
                    <Button className="w-full gap-2" variant="outline">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp Us
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            {profile.businessHours && profile.businessHours.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    Business Hours
                  </h3>
                  <div className="space-y-2">
                    {profile.businessHours.map((hours) => (
                      <div
                        key={hours.day}
                        className="flex justify-between text-sm"
                      >
                        <span className="font-medium">
                          {getDayLabel(hours.day)}
                        </span>
                        {hours.isOpen ? (
                          <span className="text-gray-600">
                            {hours.is24Hours
                              ? "24 Hours"
                              : `${formatTime(hours.openTime!)} - ${formatTime(
                                  hours.closeTime!
                                )}`}
                          </span>
                        ) : (
                          <span className="text-red-600">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Media */}
            {profile.socialMedia && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-4">Follow Us</h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.socialMedia.facebook && (
                      <a
                        href={profile.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Facebook className="w-5 h-5 text-blue-600" />
                      </a>
                    )}
                    {profile.socialMedia.instagram && (
                      <a
                        href={profile.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Instagram className="w-5 h-5 text-pink-600" />
                      </a>
                    )}
                    {profile.socialMedia.twitter && (
                      <a
                        href={profile.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Twitter className="w-5 h-5 text-blue-400" />
                      </a>
                    )}
                    {profile.socialMedia.linkedin && (
                      <a
                        href={profile.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Linkedin className="w-5 h-5 text-blue-700" />
                      </a>
                    )}
                    {profile.socialMedia.website && (
                      <a
                        href={profile.socialMedia.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Globe className="w-5 h-5 text-gray-700" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Review Submission Modal */}
      <ReviewSubmissionModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        businessName={profile.businessName}
        services={servicesList}
        onSubmit={(review) => {
          // TODO: API call to save review
        }}
      />
    </div>
  );
}
