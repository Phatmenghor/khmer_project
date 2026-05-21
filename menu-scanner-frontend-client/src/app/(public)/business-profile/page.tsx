"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  MapPin, Phone, Mail, Clock, Globe, Facebook, Instagram, Twitter,
  Star, Check, ExternalLink, MessageCircle, MessageSquare, Share2,
  QrCode, Download, Building2, Users,
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
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function calcAvg(reviews?: CustomerReview[]) {
  if (!reviews?.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

function isOpenNow(profile: BusinessProfile): boolean {
  const now = new Date();
  const names = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
  const today = names[now.getDay()] as DayOfWeek;
  const h = profile.businessHours?.find((x) => x.day === today);
  if (!h?.isOpen || !h.openTime || !h.closeTime) return false;
  const [oh, om] = h.openTime.split(":").map(Number);
  const [ch, cm] = h.closeTime.split(":").map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
}

// ── sub-components ───────────────────────────────────────────────────────────

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

function QRDisplay({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef       = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const primary = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary").trim() || "97 36% 37%";
    const color = `hsl(${primary})`;

    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling({
        width: 160, height: 160, type: "canvas",
        data: url || "https://goldendragon.kh",
        dotsOptions:          { color, type: "rounded" },
        cornersSquareOptions: { color, type: "extra-rounded" },
        cornersDotOptions:    { color },
        backgroundOptions:    { color: "#ffffff" },
        imageOptions:         { crossOrigin: "anonymous", margin: 4 },
      });
      qrRef.current.append(containerRef.current);
    } else {
      qrRef.current.update({ data: url });
    }
  }, [url]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-3 rounded-2xl bg-white border border-border shadow-md">
        <div ref={containerRef} />
      </div>
      <div className="flex gap-2 w-full">
        <Button
          size="sm"
          className="flex-1 gap-2"
          onClick={() => qrRef.current?.download({ name: "business-qr", extension: "png" })}
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => {
            if (navigator.share) navigator.share({ title: "Business QR", url }).catch(() => {});
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
  const [reviewOpen, setReviewOpen] = useState(false);

  const open         = isOpenNow(profile);
  const avg          = calcAvg(profile.reviews);
  const totalReviews = profile.reviews?.length ?? 0;

  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  profile.reviews?.forEach((r) => { dist[r.rating] = (dist[r.rating] || 0) + 1; });

  const profileUrl =
    typeof window !== "undefined" ? window.location.href : "https://goldendragon.kh";

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share)
      navigator.share({ title: profile.businessName, url: profileUrl }).catch(() => {});
  };

  const todayKey = (() => {
    const names = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
    return names[new Date().getDay()];
  })();

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero / Cover ─────────────────────────────────────────────── */}
      <section className="relative">
        {/* Cover */}
        <div className="relative h-56 sm:h-72 lg:h-80 overflow-hidden">
          {profile.coverImage ? (
            <Image
              src={profile.coverImage}
              alt={profile.businessName}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))" }} />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Profile row */}
        <div className="container mx-auto px-4 max-w-6xl">
          {/* -mt-12 / -mt-16 = exactly half the logo height → 50% in cover, 50% below */}
          <div className="relative -mt-12 sm:-mt-16 flex flex-col sm:flex-row sm:items-end gap-4 pb-5">

            {/* Logo — 50% overlaps cover, 50% sits in the white area */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-background shadow-xl flex-shrink-0 overflow-hidden bg-card">
              {profile.logo ? (
                <Image src={profile.logo} alt="logo" width={128} height={128} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                  <Building2 className="w-10 h-10 text-primary" />
                </div>
              )}
            </div>

            {/* Name block */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {/* Name with solid background so it reads against the dark cover */}
                <span className="inline-block bg-background/90 backdrop-blur-sm text-foreground font-bold text-xl sm:text-2xl leading-tight rounded-lg px-3 py-1 shadow-sm">
                  {profile.businessName}
                </span>
                <Badge
                  className={open
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-destructive/10 text-destructive border-destructive/20"}
                >
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${open ? "bg-green-500" : "bg-destructive"}`} />
                  {open ? "Open Now" : "Closed"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <Badge variant="secondary">{profile.industry}</Badge>
                {totalReviews > 0 && (
                  <div className="flex items-center gap-1">
                    <StarRow rating={avg} size={3} />
                    <span className="font-semibold text-foreground">{avg.toFixed(1)}</span>
                    <span className="text-muted-foreground">({totalReviews})</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">
                    {profile.contact.address.street}, {profile.contact.address.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" className="gap-2" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button size="sm" className="gap-2">
                <QrCode className="w-4 h-4" />
                View QR
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      {profile.stats && (
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
              {profile.stats.yearsInBusiness && (
                <div className="py-4 px-6 text-center">
                  <div className="text-2xl font-bold text-primary">{profile.stats.yearsInBusiness}+</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Years</div>
                </div>
              )}
              {profile.stats.customersServed && (
                <div className="py-4 px-6 text-center">
                  <div className="text-2xl font-bold text-primary">{(profile.stats.customersServed / 1000).toFixed(0)}k+</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Customers</div>
                </div>
              )}
              {profile.stats.customStats?.map((s, i) => (
                <div key={i} className="py-4 px-6 text-center">
                  <div className="text-2xl font-bold text-primary">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-6xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT (main) ────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* About */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">About Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">
                  {profile.description}
                </p>
                {profile.features?.length ? (
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-foreground mb-3">Features & Amenities</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {profile.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">{f}</span>
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
                        className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/30 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                      >
                        {svc.icon && <span className="text-2xl flex-shrink-0">{svc.icon}</span>}
                        <div>
                          <p className="text-sm font-semibold text-foreground">{svc.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{svc.description}</p>
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
                    {profile.gallery.map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-muted"
                      >
                        {item.url ? (
                          <Image
                            src={item.url}
                            alt={item.title || "Gallery"}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <span className="text-4xl">🍜</span>
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-3">
                          <p className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.title}
                          </p>
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
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Opening Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border/50">
                    {profile.businessHours.map((h) => {
                      const isToday = h.day === todayKey;
                      return (
                        <div
                          key={h.day}
                          className={`flex justify-between items-center py-2.5 px-3 rounded-lg -mx-3 ${isToday ? "bg-primary/5" : ""}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isToday ? "text-primary" : "text-foreground"}`}>
                              {getDayLabel(h.day)}
                            </span>
                            {isToday && (
                              <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 px-1.5 py-0">
                                Today
                              </Badge>
                            )}
                          </div>
                          {h.isOpen ? (
                            <span className={`text-sm ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                              {h.is24Hours ? "24 Hours" : `${formatTime(h.openTime!)} – ${formatTime(h.closeTime!)}`}
                            </span>
                          ) : (
                            <span className="text-sm text-destructive font-medium">Closed</span>
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
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => setReviewOpen(true)}>
                    <MessageSquare className="w-3.5 h-3.5" />
                    Write Review
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {totalReviews > 0 ? (
                  <>
                    {/* Summary */}
                    <div className="flex gap-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="text-center flex-shrink-0">
                        <div className="text-4xl font-bold text-primary">{avg.toFixed(1)}</div>
                        <StarRow rating={avg} size={4} />
                        <p className="text-xs text-muted-foreground mt-1">{totalReviews} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1.5 min-w-0">
                        {[5,4,3,2,1].map((r) => (
                          <div key={r} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-8 text-right">{r} ★</span>
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-yellow-400 transition-all"
                                style={{ width: `${totalReviews ? ((dist[r] || 0) / totalReviews) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-4">{dist[r] || 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Review list */}
                    <div className="space-y-4">
                      {profile.reviews?.filter((r) => r.isApproved).map((r) => (
                        <div key={r.id} className="border border-border rounded-xl p-4 hover:border-primary/20 transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-border bg-muted">
                                {r.customerPhoto ? (
                                  <Image
                                    src={r.customerPhoto}
                                    alt={r.customerName}
                                    width={36}
                                    height={36}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                    <span className="text-xs font-bold text-primary">{r.customerName.charAt(0)}</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{r.customerName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                </p>
                              </div>
                            </div>
                            <StarRow rating={r.rating} size={3} />
                          </div>
                          {r.title && <p className="text-sm font-medium text-foreground mb-1">{r.title}</p>}
                          <p className="text-xs text-muted-foreground leading-relaxed">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm mb-4">No reviews yet. Be the first to review!</p>
                    <Button size="sm" onClick={() => setReviewOpen(true)}>
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
                    <Users className="w-4 h-4 text-primary" />
                    Meet Our Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {profile.team.map((m) => (
                      <div key={m.id} className="text-center p-4 rounded-xl bg-muted/30 border border-border">
                        <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-border mb-3 bg-muted">
                          {m.photo ? (
                            <Image src={m.photo} alt={m.name} width={64} height={64} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10">
                              <span className="text-xl font-bold text-primary">{m.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-foreground">{m.name}</p>
                        <p className="text-xs text-primary font-medium mt-0.5">{m.position}</p>
                        {m.bio && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{m.bio}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* ── RIGHT (sidebar) ────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Business Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p>{profile.contact.address.street}</p>
                    <p>{profile.contact.address.city}, {profile.contact.address.country}</p>
                    {profile.contact.mapLink && (
                      <a
                        href={profile.contact.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1 mt-1 text-xs"
                      >
                        View on Map <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  <a href={`tel:${profile.contact.phone}`} className="text-sm text-muted-foreground hover:text-primary">
                    {profile.contact.phone}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  <a href={`mailto:${profile.contact.email}`} className="text-sm text-muted-foreground hover:text-primary truncate">
                    {profile.contact.email}
                  </a>
                </div>

                {profile.socialMedia?.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                    <a
                      href={profile.socialMedia.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary truncate"
                    >
                      {profile.socialMedia.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}

                <Separator />

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">{profile.industry}</Badge>
                  <Badge variant="secondary" className="text-xs">{profile.businessType}</Badge>
                </div>

                {profile.contact.whatsapp && (
                  <a
                    href={`https://wa.me/${profile.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-2 border-green-200 text-green-700 hover:bg-green-50">
                      <MessageCircle className="w-3.5 h-3.5" />
                      Chat on WhatsApp
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card className="overflow-hidden">
              <div className="h-1.5 bg-primary" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-primary" />
                  Scan & Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
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
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                        <Facebook className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-blue-600">Facebook</span>
                      </a>
                    )}
                    {profile.socialMedia.instagram && (
                      <a href={profile.socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-pink-300 hover:bg-pink-50 transition-colors group">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-pink-600">Instagram</span>
                      </a>
                    )}
                    {profile.socialMedia.twitter && (
                      <a href={profile.socialMedia.twitter} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-sky-300 hover:bg-sky-50 transition-colors group">
                        <Twitter className="w-4 h-4 text-sky-500" />
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-sky-500">Twitter</span>
                      </a>
                    )}
                    {profile.socialMedia.website && (
                      <a href={profile.socialMedia.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-border hover:bg-muted transition-colors group">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">Website</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Preview Card */}
            <Card className="overflow-hidden border-primary/20">
              <div
                className="h-24 relative"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))" }}
              >
                {profile.coverImage && (
                  <Image src={profile.coverImage} alt="cover" fill className="object-cover opacity-40" />
                )}
              </div>
              <CardContent className="pt-0">
                <div className="flex flex-col items-center text-center -mt-8">
                  <div className="w-16 h-16 rounded-xl border-2 border-background shadow overflow-hidden bg-card mb-3">
                    {profile.logo ? (
                      <Image src={profile.logo} alt="logo" width={64} height={64} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-bold text-foreground">{profile.businessName}</p>
                  <p className="text-xs text-primary mb-1">{profile.tagline}</p>
                  <div className="flex items-center gap-1 mb-3">
                    <StarRow rating={avg} size={3} />
                    <span className="text-xs text-muted-foreground">{avg.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <MapPin className="w-3 h-3 text-primary" />
                    {profile.contact.address.city}, {profile.contact.address.country}
                  </div>
                  <Badge
                    className={open
                      ? "bg-green-100 text-green-700 border-green-200 text-xs"
                      : "bg-destructive/10 text-destructive border-destructive/20 text-xs"}
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
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        businessName={profile.businessName}
        onSubmit={() => {}}
      />
    </div>
  );
}
