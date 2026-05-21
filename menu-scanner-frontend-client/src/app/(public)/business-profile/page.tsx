"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapPin, Phone, Mail, Clock, Globe, Facebook, Instagram, Twitter,
  Star, Check, ExternalLink, MessageCircle, MessageSquare, Share2,
  QrCode, Download, ChevronRight, Building2, UtensilsCrossed,
  Wifi, Users, Award, TrendingUp,
} from "lucide-react";
import { demoBusinessProfile } from "@/data/business-profile-template";
import { BusinessProfile, DayOfWeek, CustomerReview } from "@/types/business-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ReviewSubmissionModal } from "@/components/business-profile/review-submission-modal";
import QRCodeStyling from "qr-code-styling";

// ── helpers ─────────────────────────────────────────────────────────────────

function getDayLabel(day: DayOfWeek) {
  return day.charAt(0) + day.slice(1).toLowerCase();
}

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function averageRating(reviews?: CustomerReview[]) {
  if (!reviews?.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

function isOpenNow(profile: BusinessProfile): boolean {
  const now = new Date();
  const dayNames = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
  const todayKey = dayNames[now.getDay()] as DayOfWeek;
  const todayHours = profile.businessHours?.find((h) => h.day === todayKey);
  if (!todayHours?.isOpen || !todayHours.openTime || !todayHours.closeTime) return false;
  const [oh, om] = todayHours.openTime.split(":").map(Number);
  const [ch, cm] = todayHours.closeTime.split(":").map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
}

// ── gallery placeholder colours ──────────────────────────────────────────────
const GALLERY_COLORS = [
  { bg: "#fff7ed", accent: "#f97316", emoji: "🍜" },
  { bg: "#fef2f2", accent: "#ef4444", emoji: "🥩" },
  { bg: "#f0fdf4", accent: "#22c55e", emoji: "🌿" },
  { bg: "#fff7ed", accent: "#f59e0b", emoji: "👨‍🍳" },
  { bg: "#f0f9ff", accent: "#0ea5e9", emoji: "🌃" },
  { bg: "#fdf4ff", accent: "#a855f7", emoji: "🥬" },
];

// ── StarRow ──────────────────────────────────────────────────────────────────
function StarRow({ rating, size = 4 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star
          key={i}
          className={`w-${size} h-${size} ${
            i <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

// ── QRDisplay ────────────────────────────────────────────────────────────────
function QRDisplay({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling({
        width: 160,
        height: 160,
        type: "canvas",
        data: url || "https://goldendragon.kh",
        dotsOptions: { color: "#f97316", type: "rounded" },
        cornersSquareOptions: { color: "#ea580c", type: "extra-rounded" },
        cornersDotOptions: { color: "#f97316" },
        backgroundOptions: { color: "#ffffff" },
        imageOptions: { crossOrigin: "anonymous", margin: 4 },
      });
      qrRef.current.append(ref.current);
    } else {
      qrRef.current.update({ data: url || "https://goldendragon.kh" });
    }
  }, [url]);

  const handleDownload = () => qrRef.current?.download({ name: "business-qr", extension: "png" });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-3 rounded-2xl bg-white border border-orange-100 shadow-md">
        <div ref={ref} />
      </div>
      <div className="flex gap-2 w-full">
        <Button
          size="sm"
          className="flex-1 gap-2 bg-orange-500 hover:bg-orange-600 text-white"
          onClick={handleDownload}
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-2 border-orange-200 text-orange-600 hover:bg-orange-50"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: "Business QR", url }).catch(() => {});
            }
          }}
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
      </div>
    </div>
  );
}

// ── main page ────────────────────────────────────────────────────────────────
export default function BusinessProfilePage() {
  const profile: BusinessProfile = demoBusinessProfile;
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const open = isOpenNow(profile);
  const avg = averageRating(profile.reviews);
  const totalReviews = profile.reviews?.length ?? 0;
  const ratingDist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  profile.reviews?.forEach((r) => { ratingDist[r.rating] = (ratingDist[r.rating] || 0) + 1; });

  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : "https://goldendragon.kh"}/business-profile`;

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: profile.businessName, url: profileUrl }).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero / Cover ─────────────────────────────────────────────── */}
      <section className="relative">
        {/* Cover gradient */}
        <div className="h-56 sm:h-72 lg:h-80 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 relative overflow-hidden">
          {/* decorative pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Profile row */}
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end gap-4 pb-5">
            {/* Logo avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white border-4 border-white shadow-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              <UtensilsCrossed className="w-10 h-10 sm:w-14 sm:h-14 text-orange-400" />
            </div>

            {/* Name block */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {profile.businessName}
                </h1>
                <Badge
                  className={open
                    ? "bg-green-100 text-green-700 border-green-200 font-semibold"
                    : "bg-red-100 text-red-700 border-red-200 font-semibold"}
                >
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${open ? "bg-green-500" : "bg-red-500"}`} />
                  {open ? "Open Now" : "Closed"}
                </Badge>
              </div>
              <p className="text-orange-600 font-medium text-sm mb-2">{profile.tagline}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <Badge variant="secondary" className="gap-1">
                  <Building2 className="w-3 h-3" />
                  {profile.industry}
                </Badge>
                {totalReviews > 0 && (
                  <div className="flex items-center gap-1">
                    <StarRow rating={avg} size={3} />
                    <span className="font-semibold text-gray-800">{avg.toFixed(1)}</span>
                    <span className="text-gray-400">({totalReviews} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                  <span className="truncate">
                    {profile.contact.address.street}, {profile.contact.address.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" className="gap-2 border-gray-200" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button size="sm" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white">
                <QrCode className="w-4 h-4" />
                View QR
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      {profile.stats && (
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
              {profile.stats.yearsInBusiness && (
                <div className="py-4 px-6 text-center">
                  <div className="text-2xl font-bold text-orange-500">{profile.stats.yearsInBusiness}+</div>
                  <div className="text-xs text-gray-500 mt-0.5">Years</div>
                </div>
              )}
              {profile.stats.customersServed && (
                <div className="py-4 px-6 text-center">
                  <div className="text-2xl font-bold text-orange-500">{(profile.stats.customersServed / 1000).toFixed(0)}k+</div>
                  <div className="text-xs text-gray-500 mt-0.5">Customers</div>
                </div>
              )}
              {profile.stats.customStats?.map((s, i) => (
                <div key={i} className="py-4 px-6 text-center">
                  <div className="text-2xl font-bold text-orange-500">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-6xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN (main) ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* About */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">About Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                  {profile.description}
                </p>
                {profile.features?.length ? (
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-gray-800 mb-3">Features & Amenities</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {profile.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                          <span className="text-xs text-gray-600">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Services */}
            {profile.services?.length ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Our Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {profile.services.map((svc) => (
                      <div
                        key={svc.id}
                        className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-orange-200 hover:bg-orange-50 transition-colors"
                      >
                        {svc.icon && <span className="text-2xl flex-shrink-0">{svc.icon}</span>}
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{svc.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{svc.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Gallery */}
            {profile.gallery?.length ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {profile.gallery.map((item, idx) => {
                      const palette = GALLERY_COLORS[idx % GALLERY_COLORS.length];
                      return (
                        <div
                          key={item.id}
                          className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                          style={{ backgroundColor: palette.bg }}
                        >
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                            <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">
                              {palette.emoji}
                            </span>
                          </div>
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-3">
                            <p className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Opening Hours */}
            {profile.businessHours?.length ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-orange-500" />
                    Opening Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0 divide-y divide-gray-50">
                    {profile.businessHours.map((h) => {
                      const dayNames = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
                      const todayKey = dayNames[new Date().getDay()];
                      const isToday = h.day === todayKey;
                      return (
                        <div
                          key={h.day}
                          className={`flex justify-between items-center py-2.5 px-3 rounded-lg -mx-3 ${
                            isToday ? "bg-orange-50" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isToday ? "text-orange-600" : "text-gray-700"}`}>
                              {getDayLabel(h.day)}
                            </span>
                            {isToday && (
                              <Badge className="text-[10px] bg-orange-100 text-orange-700 border-orange-200 px-1.5 py-0">
                                Today
                              </Badge>
                            )}
                          </div>
                          {h.isOpen ? (
                            <span className={`text-sm ${isToday ? "text-orange-600 font-semibold" : "text-gray-500"}`}>
                              {h.is24Hours ? "24 Hours" : `${formatTime(h.openTime!)} – ${formatTime(h.closeTime!)}`}
                            </span>
                          ) : (
                            <span className="text-sm text-red-400 font-medium">Closed</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Reviews */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Customer Reviews</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 border-orange-200 text-orange-600 hover:bg-orange-50"
                    onClick={() => setIsReviewModalOpen(true)}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Write Review
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {totalReviews > 0 ? (
                  <>
                    {/* Summary */}
                    <div className="flex gap-6 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
                      <div className="text-center flex-shrink-0">
                        <div className="text-4xl font-bold text-orange-500">{avg.toFixed(1)}</div>
                        <StarRow rating={avg} size={4} />
                        <p className="text-xs text-gray-500 mt-1">{totalReviews} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1.5 min-w-0">
                        {[5,4,3,2,1].map((r) => (
                          <div key={r} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-8 text-right">{r} ★</span>
                            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-yellow-400 transition-all"
                                style={{ width: `${totalReviews ? ((ratingDist[r] || 0) / totalReviews) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-4">{ratingDist[r] || 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Review list */}
                    <div className="space-y-4">
                      {profile.reviews?.filter((r) => r.isApproved).map((r) => (
                        <div key={r.id} className="border border-gray-100 rounded-xl p-4 hover:border-orange-100 transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-orange-600">
                                  {r.customerName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{r.customerName}</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                </p>
                              </div>
                            </div>
                            <StarRow rating={r.rating} size={3} />
                          </div>
                          {r.title && (
                            <p className="text-sm font-medium text-gray-700 mb-1">{r.title}</p>
                          )}
                          <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-4">No reviews yet. Be the first to review!</p>
                    <Button
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => setIsReviewModalOpen(true)}
                    >
                      Write the First Review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team */}
            {profile.team?.length ? (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-500" />
                    Meet Our Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {profile.team.map((m) => (
                      <div key={m.id} className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-14 h-14 mx-auto rounded-full bg-orange-100 flex items-center justify-center mb-3">
                          <span className="text-xl font-bold text-orange-500">{m.name.charAt(0)}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                        <p className="text-xs text-orange-600 font-medium mt-0.5">{m.position}</p>
                        {m.bio && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{m.bio}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* ── RIGHT COLUMN (sidebar) ──────────────────────────────── */}
          <div className="space-y-5">

            {/* Business Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-600">
                    <p>{profile.contact.address.street}</p>
                    <p>{profile.contact.address.city}, {profile.contact.address.country}</p>
                    {profile.contact.mapLink && (
                      <a
                        href={profile.contact.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:underline inline-flex items-center gap-1 mt-1 text-xs"
                      >
                        View on Map <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <a href={`tel:${profile.contact.phone}`} className="text-sm text-gray-600 hover:text-orange-600">
                    {profile.contact.phone}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <a href={`mailto:${profile.contact.email}`} className="text-sm text-gray-600 hover:text-orange-600 truncate">
                    {profile.contact.email}
                  </a>
                </div>

                {profile.socialMedia?.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <a
                      href={profile.socialMedia.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-orange-600 truncate"
                    >
                      {profile.socialMedia.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{profile.industry}</Badge>
                  <Badge variant="secondary" className="text-xs">{profile.businessType}</Badge>
                </div>

                {profile.contact.whatsapp && (
                  <a
                    href={`https://wa.me/${profile.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-2 border-green-200 text-green-700 hover:bg-green-50">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat on WhatsApp
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* QR Code Section */}
            <Card className="overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-orange-400 to-amber-400" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-orange-500" />
                  Scan & Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 mb-4">
                  Scan the QR code to view our full menu on your phone — no app required.
                </p>
                <QRDisplay url={profileUrl} />
              </CardContent>
            </Card>

            {/* Social Media */}
            {profile.socialMedia && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Follow Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {profile.socialMedia.facebook && (
                      <a href={profile.socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                        <Facebook className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600">Facebook</span>
                      </a>
                    )}
                    {profile.socialMedia.instagram && (
                      <a href={profile.socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:border-pink-200 hover:bg-pink-50 transition-colors group">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        <span className="text-xs font-medium text-gray-600 group-hover:text-pink-600">Instagram</span>
                      </a>
                    )}
                    {profile.socialMedia.twitter && (
                      <a href={profile.socialMedia.twitter} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:border-sky-200 hover:bg-sky-50 transition-colors group">
                        <Twitter className="w-4 h-4 text-sky-500" />
                        <span className="text-xs font-medium text-gray-600 group-hover:text-sky-500">Twitter</span>
                      </a>
                    )}
                    {profile.socialMedia.website && (
                      <a href={profile.socialMedia.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-colors group">
                        <Globe className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-600">Website</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Preview Card */}
            <Card className="overflow-hidden border-orange-100">
              <div className="h-24 bg-gradient-to-br from-orange-500 to-amber-400 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <UtensilsCrossed className="w-8 h-8 text-white/40" />
                </div>
              </div>
              <CardContent className="pt-0">
                <div className="flex flex-col items-center text-center -mt-8">
                  <div className="w-16 h-16 rounded-xl bg-white border-2 border-orange-200 shadow flex items-center justify-center mb-3">
                    <UtensilsCrossed className="w-7 h-7 text-orange-400" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">{profile.businessName}</p>
                  <p className="text-xs text-orange-600 mb-1">{profile.tagline}</p>
                  <div className="flex items-center gap-1 mb-3">
                    <StarRow rating={avg} size={3} />
                    <span className="text-xs text-gray-500">{avg.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                    <MapPin className="w-3 h-3 text-orange-400" />
                    {profile.contact.address.city}, {profile.contact.address.country}
                  </div>
                  <Badge
                    className={open
                      ? "bg-green-100 text-green-700 border-green-200 text-xs"
                      : "bg-red-100 text-red-600 border-red-200 text-xs"}
                  >
                    {open ? "Open Now" : "Currently Closed"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      <ReviewSubmissionModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        businessName={profile.businessName}
        onSubmit={() => {}}
      />
    </div>
  );
}
