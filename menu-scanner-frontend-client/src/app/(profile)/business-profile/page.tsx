"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  MapPin, Phone, Mail, Clock, Globe,
  Star, Check, ExternalLink,
  Share2, QrCode, Building2, Users, Send,
  X, PenLine, CheckCircle2,
} from "lucide-react";
import { QRTemplateModal } from "@/components/shared/qr/qr-template-modal";
import { BusinessProfileSkeleton } from "@/components/shared/skeletons/business-profile-skeleton";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchPublicPortfolioThunk, submitPublicReviewThunk } from "@/features/portfolio/store/thunks/portfolio-thunks";
import { selectPublicProfile, selectPublicPortfolioLoading, selectIsSubmittingReview } from "@/features/portfolio/store/selectors/portfolio-selectors";
import { PortfolioPublicProfile, PortfolioHoursDto, ReviewStatsDto, PortfolioReviewSubmitRequest } from "@/features/portfolio/store/models/portfolio-types";
import { AppDefault } from "@/constants/app-resource/default/default";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── helpers ──────────────────────────────────────────────────────────────────

function getDayLabel(day: string) {
  return day.charAt(0) + day.slice(1).toLowerCase();
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function isOpenNow(profile: PortfolioPublicProfile): boolean {
  const now  = new Date();
  const days = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
  const h    = profile.businessHours?.find((x: PortfolioHoursDto) => x.day === days[now.getDay()]);
  if (!h?.openTime || !h.closeTime) return false;
  const [oh, om] = h.openTime.split(":").map(Number);
  const [ch, cm] = h.closeTime.split(":").map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
}

// ── StarRow ───────────────────────────────────────────────────────────────────

function StarRow({ rating, size = 4 }: { rating: number; size?: number }) {
  const px = `${size * 4}px`;
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star
          key={i}
          style={{ width: px, height: px }}
          className={i <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
        />
      ))}
    </div>
  );
}

// ── WriteReviewModal ─────────────────────────────────────────────────────────

interface ReviewForm {
  name: string;
  rating: number;
  comment: string;
}

function WriteReviewModal({
  open,
  onClose,
  businessName,
  businessId,
}: {
  open: boolean;
  onClose: () => void;
  businessName: string;
  businessId: string;
}) {
  const dispatch = useAppDispatch();
  const isSubmitting = useAppSelector(selectIsSubmittingReview);
  const [form, setForm]           = useState<ReviewForm>({ name: "", rating: 0, comment: "" });
  const [hover, setHover]         = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function reset() {
    setForm({ name: "", rating: 0, comment: "" });
    setHover(0);
    setSubmitted(false);
    setSubmitError("");
  }

  function handleClose() {
    onClose();
    setTimeout(reset, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.rating) return;
    setSubmitError("");
    const request: PortfolioReviewSubmitRequest = {
      customerName: form.name,
      rating: form.rating,
      comment: form.comment,
    };
    const result = await dispatch(submitPublicReviewThunk({ businessId, request }));
    if (submitPublicReviewThunk.fulfilled.match(result)) {
      setSubmitted(true);
    } else {
      setSubmitError("Failed to submit review. Please try again.");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-3" onClick={handleClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full sm:max-w-lg bg-background rounded-t-2xl sm:rounded shadow-2xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-border">
          <div className="flex items-center gap-1">
            <PenLine className="w-3 h-3 text-primary" />
            <span className="font-semibold text-xs text-foreground">Write a Review</span>
          </div>
          <button onClick={handleClose} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 px-4 py-7 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-xs">Thank you for your review!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your review has been submitted and is pending approval by <span className="font-medium">{businessName}</span>.
              </p>
            </div>
            <button onClick={handleClose} className="mt-1 px-4 py-1 rounded bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-3 py-3 space-y-3">
            {/* Star rating */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Your Rating <span className="text-destructive">*</span></label>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((s) => (
                  <button
                    key={s} type="button"
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setForm((f) => ({ ...f, rating: s }))}
                  >
                    <Star
                      className="w-5 h-5 transition-colors"
                      style={{ color: s <= (hover || form.rating) ? "#facc15" : "#e5e7eb",
                               fill:  s <= (hover || form.rating) ? "#facc15" : "#e5e7eb" }}
                    />
                  </button>
                ))}
                {(hover || form.rating) > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    {["","Poor","Fair","Good","Very Good","Excellent"][hover || form.rating]}
                  </span>
                )}
              </div>
              {!form.rating && <p className="text-xs text-muted-foreground">Please select a rating</p>}
            </div>

            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Your Name <span className="text-destructive">*</span></label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Sopheap Chan"
                className="w-full rounded border border-input bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>


            {/* Comment */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Your Review <span className="text-destructive">*</span></label>
              <textarea
                required
                rows={4}
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Share your experience with others..."
                className="w-full rounded border border-input bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
              />
            </div>

            {submitError && <p className="text-xs text-destructive">{submitError}</p>}

            <p className="text-xs text-muted-foreground">
              Your review will be visible after approval by the business.
            </p>

            <div className="flex gap-1 pt-1">
              <button type="button" onClick={handleClose}
                className="flex-1 py-1 rounded border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !form.rating}
                className="flex-1 py-1 rounded bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                {isSubmitting ? (
                  <><span className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Submitting…</>
                ) : "Submit Review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function BusinessProfilePage() {
  const dispatch  = useAppDispatch();
  const profile   = useAppSelector(selectPublicProfile);
  const isLoading = useAppSelector(selectPublicPortfolioLoading);

  const [showQRModal, setShowQRModal]         = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const businessId = typeof window !== "undefined"
      ? AppDefault.BUSINESS_ID
      : AppDefault.BUSINESS_ID;
    dispatch(fetchPublicPortfolioThunk(businessId));
  }, [dispatch]);

  if (isLoading || !profile) {
    return <BusinessProfileSkeleton />;
  }

  const open   = isOpenNow(profile);
  const stats  = profile.reviewStats;
  const avg    = stats?.averageRating ?? 0;
  const total  = stats?.totalReviews ?? 0;
  const dist   = stats?.distribution ?? {};

  const profileUrl = typeof window !== "undefined" ? window.location.href : "";
  const days    = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
  const todayKey = days[new Date().getDay()];

  const businessId = typeof window !== "undefined"
    ? AppDefault.BUSINESS_ID
    : AppDefault.BUSINESS_ID;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative">
        {/* Cover */}
        <div className="relative h-40 sm:h-52 lg:h-56">
          <div className="absolute inset-0 overflow-hidden">
            {profile.coverImageUrl ? (
              <Image src={profile.coverImageUrl} alt={profile.businessName} fill className="object-cover" priority />
            ) : (
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.7))" }} />
            )}
            <div className="absolute inset-0 bg-black/45" />
          </div>
        </div>

        {/* Profile row */}
        <div className="container mx-auto px-3 max-w-6xl">
          <div className="relative -mt-8 sm:-mt-11 flex items-end justify-between pb-2">
            {/* Logo */}
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded border-4 border-background shadow-2xl flex-shrink-0 overflow-hidden bg-card">
              {profile.logoUrl
                ? <Image src={profile.logoUrl} alt="logo" width={128} height={128} className="object-cover w-full h-full" />
                : <div className="w-full h-full flex items-center justify-center bg-primary/10"><Building2 className="w-7 h-7 text-primary" /></div>
              }
            </div>

            {/* Action buttons */}
            <div className="flex gap-1 flex-shrink-0 pb-1">
              <Button size="sm" variant="outline" className="gap-1"
                onClick={() => { if (typeof navigator !== "undefined" && navigator.share) navigator.share({ title: profile.businessName, url: profileUrl }).catch(() => {}); }}>
                <Share2 className="w-3 h-3" />
                Share
              </Button>
              <Button size="sm" className="gap-1" onClick={() => setShowQRModal(true)}>
                <QrCode className="w-3 h-3" />
                View QR
              </Button>
            </div>
          </div>

          {/* Business name + meta */}
          <div className="pb-3 space-y-1">
            <h1 className="text-xs sm:text-base font-bold text-foreground tracking-tight leading-snug">
              {profile.businessName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <StarRow rating={avg} size={3} />
                <span className="font-semibold text-foreground text-xs">{avg.toFixed(2)}</span>
                <span className="text-xs">({total})</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-primary flex-shrink-0" />
                <span className="text-xs truncate">
                  {profile.contact.address}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      {profile.stats && Array.isArray(profile.stats) && profile.stats.length > 0 && (
        <div className="bg-card border-b border-border">
          <div className="container mx-auto max-w-6xl py-4 px-3 sm:px-4">
            <div className="flex flex-wrap divide-x divide-border gap-0">
              {profile.stats!.map((stat, index) => {
                const itemCount = profile.stats!.length;
                const widthClass = itemCount === 1 ? 'w-full' : itemCount === 2 ? 'flex-1 min-w-[50%]' : `flex-1 min-w-[calc(${100/itemCount}%)]`;

                return (
                  <div key={stat.id} className={`${widthClass} p-3 sm:p-3 text-center`}>
                    <p className="text-base sm:text-xs font-bold text-muted-foreground break-words">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Main grid ────────────────────────────────────────────────── */}
      <div className="container mx-auto px-3 max-w-6xl py-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── LEFT ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* About */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">About Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {profile.description}
                </p>
                {profile.features?.length ? (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-foreground mb-2">Features &amp; Amenities</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      {profile.features.map((f) => (
                        <div key={f.id} className="flex items-center gap-1">
                          <Check className="w-2.5 h-2.5 text-primary flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{f.name}</span>
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">Our Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {profile.services.map((svc) => (
                      <div key={svc.id}
                        className="p-2.5 rounded border border-border bg-muted/30 hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-default">
                        <p className="text-xs font-semibold text-foreground">{svc.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{svc.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Gallery */}
            {profile.gallery?.length ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {profile.gallery.map((item) => (
                      <div key={item.id}
                        className="relative aspect-square rounded overflow-hidden group cursor-pointer bg-muted">
                        {item.url
                          ? <Image src={item.url} alt={item.title || "Gallery"} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                          : <div className="w-full h-full flex items-center justify-center bg-primary/10"><span className="text-base">🍜</span></div>
                        }
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-2">
                          <p className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">{item.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Opening Hours */}
            {profile.businessHours?.length ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" />
                    Opening Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border/40">
                    {profile.businessHours.map((h) => {
                      const isToday = h.day === todayKey;
                      return (
                        <div key={h.day}
                          className={`flex justify-between items-center py-1 px-2 rounded -mx-2 ${isToday ? "bg-primary/5" : ""}`}>
                          <div className="flex items-center gap-1">
                            <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-foreground"}`}>
                              {getDayLabel(h.day)}
                            </span>
                            {isToday && (
                              <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 px-1 py-0 h-3">
                                Today
                              </Badge>
                            )}
                          </div>
                          {(h.openTime && h.closeTime)
                            ? <span className={`text-xs ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                                {`${formatTime(h.openTime)} – ${formatTime(h.closeTime)}`}
                              </span>
                            : <span className="text-xs text-destructive font-medium">Closed</span>
                          }
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Reviews */}
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-xs">Customer Reviews</CardTitle>
                <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => setShowReviewModal(true)}>
                  <PenLine className="w-2.5 h-2.5" />
                  Write a Review
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-4 p-3 rounded bg-primary/5 border border-primary/10">
                  <div className="text-center flex-shrink-0">
                    <p className="text-base font-bold text-primary">{avg.toFixed(2)}</p>
                    <StarRow rating={avg} size={4} />
                    <p className="text-xs text-muted-foreground mt-1">{total} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    {[5,4,3,2,1].map((r) => (
                      <div key={r} className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground w-5 text-right">{r} ★</span>
                        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-yellow-400 transition-all"
                            style={{ width: `${total ? ((dist[r] || 0) / total) * 100 : 0}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-3">{dist[r] || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team */}
            {profile.team?.length ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-1">
                    <Users className="w-3 h-3 text-primary" />
                    Meet Our Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {profile.team.map((m) => (
                      <div key={m.id} className="text-center p-3 rounded bg-muted/30 border border-border hover:border-primary/20 transition-colors">
                        <div className="w-11 h-11 mx-auto rounded-full overflow-hidden border-2 border-border mb-2 bg-muted">
                          {m.photoUrl
                            ? <Image src={m.photoUrl} alt={m.name} width={64} height={64} className="object-cover w-full h-full" />
                            : <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                <span className="text-xs font-bold text-primary">{m.name.charAt(0)}</span>
                              </div>
                          }
                        </div>
                        <p className="text-xs font-semibold text-foreground">{m.name}</p>
                        <p className="text-xs text-primary font-medium mt-0.5">{m.position}</p>
                        {m.bio && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.bio}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* ── RIGHT sidebar ─────────────────────────────────────── */}
          <div className="space-y-3">

            {/* Business Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {profile.contact.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-muted-foreground">
                      <p className="whitespace-pre-wrap">{profile.contact.address}</p>
                      {profile.contact.mapLink && (
                        <a href={profile.contact.mapLink} target="_blank" rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1 mt-1 text-xs">
                          View on Map <ExternalLink className="w-2 h-2" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {profile.contact.phones && profile.contact.phones.length > 0 ? (
                  profile.contact.phones.map((phone, i) => (
                    <div key={phone.id || i} className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-primary flex-shrink-0" />
                      <a href={`tel:${phone.number}`} className="text-xs text-muted-foreground hover:text-primary">
                        {phone.number}
                      </a>
                    </div>
                  ))
                ) : profile.contact.phone ? (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-primary flex-shrink-0" />
                    <a href={`tel:${profile.contact.phone}`} className="text-xs text-muted-foreground hover:text-primary">
                      {profile.contact.phone}
                    </a>
                  </div>
                ) : null}
                {profile.contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-primary flex-shrink-0" />
                    <a href={`mailto:${profile.contact.email}`} className="text-xs text-muted-foreground hover:text-primary truncate">
                      {profile.contact.email}
                    </a>
                  </div>
                )}
                {profile.contact.whatsapp && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-green-600 flex-shrink-0" />
                    <a href={`https://wa.me/${profile.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary">
                      WhatsApp
                    </a>
                  </div>
                )}
                {profile.contact.telegram && (
                  <a href={profile.contact.telegram}
                    target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="outline" size="sm" className="w-full gap-1 border-sky-200 text-sky-600 hover:bg-sky-50">
                      <Send className="w-2.5 h-2.5" />
                      Chat on Telegram
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card className="overflow-hidden">
              <div className="h-1 bg-primary" />
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-primary" />
                  Scan &amp; Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-1" onClick={() => setShowQRModal(true)}>
                  <QrCode className="w-3 h-3" />
                  View QR Code
                </Button>
              </CardContent>
            </Card>

            {/* Social Media */}
            {profile.socialMedia && Array.isArray(profile.socialMedia) && profile.socialMedia.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">Follow Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-1">
                    {profile.socialMedia.map((social) => (
                      <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded border border-border hover:border-primary hover:bg-primary/5 transition-colors">
                        <span className="text-xs font-medium text-muted-foreground hover:text-primary">{social.name}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* ── Write a Review Modal ─────────────────────────────────── */}
      <WriteReviewModal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        businessName={profile.businessName}
        businessId={businessId}
      />

      {/* ── QR Template Modal ────────────────────────────────────── */}
      <QRTemplateModal
        open={showQRModal}
        onClose={() => setShowQRModal(false)}
        url={profileUrl}
        businessName={profile.businessName}
        subtitle={profile.tagline || "Scan to view our menu"}
        logoUrl={profile.logoUrl}
      />
    </div>
  );
}
