"use client";

import { useEffect, useState } from "react";
import { SmartImage } from "@/components/shared/image/smart-image";
import {
  MapPin, Phone, Mail, Clock, Globe,
  Star, Check, ExternalLink,
  Share2, QrCode, Building2, Users, Send,
  X, PenLine, CheckCircle2, MessageSquare,
  Briefcase, GalleryHorizontal, Image as ImageIcon,
} from "lucide-react";
import { WriteReviewModal, StarRow } from "@/features/portfolio/components/write-review-modal";
import { QRTemplateModal } from "@/components/shared/qr/qr-template-modal";
import { BusinessProfileSkeleton } from "@/components/shared/skeletons/business-profile-skeleton";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchPublicPortfolioThunk } from "@/features/portfolio/store/thunks/portfolio-thunks";
import { fetchBusinessSettingsThunk } from "@/features/business/store/thunks/business-settings-thunks";
import { selectPublicProfile, selectPublicPortfolioLoading } from "@/features/portfolio/store/selectors/portfolio-selectors";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selectors";
import { PortfolioPublicProfile, PortfolioHoursDto } from "@/features/portfolio/store/models/portfolio-types";
import { AppDefault } from "@/constants/app-resource/default/default";
import { CustomButton } from "@/components/shared/button/custom-button";

// ── helpers ──────────────────────────────────────────────────────────────────

function getDayLabel(day: string) {
  return day.charAt(0) + day.slice(1).toLowerCase();
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

function isCurrentDayInSchedule(dayStr: string, currentDayIndex: number): boolean {
  const daysOrder = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const currentDayName = daysOrder[currentDayIndex];
  const upper = (dayStr || "").toUpperCase().trim();

  if (upper === "EVERYDAY" || upper === "DAILY" || upper === "24/7" || !upper) return true;

  // Single day exact or substring match (e.g. "Monday", "Mon")
  if (upper.includes(currentDayName) || upper.includes(currentDayName.slice(0, 3))) return true;

  // Range match (e.g. "Monday - Friday", "Sat - Sun", "Monday to Sunday")
  if (upper.includes("-") || upper.includes("TO")) {
    const parts = upper.split(/-|TO/).map((s) => s.trim());
    if (parts.length === 2) {
      const startIdx = daysOrder.findIndex((d) => d.startsWith(parts[0].slice(0, 3)));
      const endIdx = daysOrder.findIndex((d) => d.startsWith(parts[1].slice(0, 3)));

      if (startIdx !== -1 && endIdx !== -1) {
        if (startIdx <= endIdx) {
          return currentDayIndex >= startIdx && currentDayIndex <= endIdx;
        } else {
          return currentDayIndex >= startIdx || currentDayIndex <= endIdx;
        }
      }
    }
  }

  return false;
}

function isOpenNow(profile: PortfolioPublicProfile): boolean {
  if (!profile.businessHours || profile.businessHours.length === 0) return true;

  const now = new Date();
  const currentDayIdx = now.getDay();

  const schedule = profile.businessHours.find((x: PortfolioHoursDto) =>
    isCurrentDayInSchedule(x.day || "", currentDayIdx)
  ) || profile.businessHours[0];

  if (!schedule?.openTime || !schedule.closeTime) return true;

  const [oh, om] = schedule.openTime.split(":").map(Number);
  const [ch, cm] = schedule.closeTime.split(":").map(Number);
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const openMins = (oh || 0) * 60 + (om || 0);
  const closeMins = (ch || 24) * 60 + (cm || 0);

  if (closeMins <= openMins) {
    return currentMins >= openMins || currentMins < closeMins;
  }

  return currentMins >= openMins && currentMins < closeMins;
}

// ── Section Header Component ──

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0 p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-normal">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ── Main Public Page ──────────────────────────────────────────────────────────

export default function BusinessProfilePage() {
  const dispatch  = useAppDispatch();
  const profile   = useAppSelector(selectPublicProfile);
  const isLoading = useAppSelector(selectPublicPortfolioLoading);
  const businessSettings = useAppSelector(selectBusinessSettings);

  const [showQRModal, setShowQRModal]         = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    const businessId = typeof window !== "undefined"
      ? AppDefault.BUSINESS_ID
      : AppDefault.BUSINESS_ID;
    dispatch(fetchPublicPortfolioThunk(businessId));
    dispatch(fetchBusinessSettingsThunk());
  }, [dispatch]);

  if (isLoading || !profile) {
    return <BusinessProfileSkeleton />;
  }

  // Business Name & Logo mapped directly from Business Settings (with profile fallback)
  const businessName = businessSettings?.businessName || profile.businessName || "Our Business";
  const logoObj = businessSettings?.logoBusiness || profile.logo;
  const logoUrl = logoObj?.o || logoObj?.md || logoObj?.sm || "";

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
    <div className="min-h-screen bg-background pb-12">
      {/* ── Hero Banner Section ── */}
      <section className="relative">
        {/* Cover Banner */}
        <div className="relative h-36 sm:h-44 lg:h-48">
          <div className="absolute inset-0 overflow-hidden">
            {(profile.coverImage?.md || profile.coverImage?.sm || profile.coverImage?.o) ? (
              <SmartImage
                src={profile.coverImage?.o || profile.coverImage?.md || profile.coverImage?.sm}
                alt={businessName}
                fill
                priority
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/60" />
            )}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="container mx-auto px-3 max-w-6xl">
          <div className="relative -mt-10 sm:-mt-14 flex items-end justify-between pb-3">
            {/* Business Avatar Logo */}
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-4 border-background shadow-xl flex-shrink-0 overflow-hidden bg-card">
              {logoUrl ? (
                <SmartImage src={logoUrl} alt={businessName} fill />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0 pb-1">
              <CustomButton
                size="sm"
                variant="outline"
                className="gap-1.5 font-bold shadow-2xs"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({ title: businessName, url: profileUrl }).catch(() => {});
                  }
                }}
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </CustomButton>
              <CustomButton
                size="sm"
                variant="primary"
                className="gap-1.5 font-bold shadow-2xs"
                onClick={() => setShowQRModal(true)}
              >
                <QrCode className="w-3.5 h-3.5" />
                View QR
              </CustomButton>
            </div>
          </div>

          {/* Business Title & Meta Information */}
          <div className="pb-4 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight leading-snug">
                {businessName}
              </h1>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  open
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                }`}
              >
                {open ? "● Open Now" : "Closed"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <StarRow rating={avg} size={3.5} />
                <span className="font-bold text-foreground">{avg.toFixed(2)}</span>
                <span className="text-muted-foreground font-medium">({total} reviews)</span>
              </div>
              {profile.contact?.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="break-words font-medium">{profile.contact.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Statistics Row ── */}
      {profile.stats && Array.isArray(profile.stats) && profile.stats.length > 0 && (
        <div className="border-y border-border/80 bg-card/60 backdrop-blur-xs my-3">
          <div className="container mx-auto max-w-6xl py-3 px-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 divide-x divide-border/60">
              {profile.stats.map((stat) => (
                <div key={stat.id} className="p-2 text-center first:pl-0">
                  <p className="text-sm font-extrabold text-primary">{stat.value}</p>
                  <p className="text-xs font-semibold text-muted-foreground mt-0.5 leading-snug">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content Grid ── */}
      <div className="container mx-auto px-3 max-w-6xl pt-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* About Us */}
            <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-3 shadow-2xs">
              <SectionHeader
                icon={Building2}
                title="About Us"
                subtitle="Story, mission, and brand background"
              />
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                {profile.description}
              </p>
              {profile.features?.length ? (
                <div className="pt-2 border-t border-border/60">
                  <p className="text-xs font-bold text-foreground mb-2">Features &amp; Amenities</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {profile.features.map((f) => (
                      <div key={f.id} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/20 border border-border/60">
                        <Check className="w-3 h-3 text-primary shrink-0" />
                        <span className="text-xs font-semibold text-muted-foreground leading-snug">{f.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Our Services */}
            {profile.services?.length ? (
              <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-3 shadow-2xs">
                <SectionHeader
                  icon={Briefcase}
                  title="Our Services & Special Offerings"
                  subtitle="Explore what we offer for our valued customers"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.services.map((svc) => (
                    <div
                      key={svc.id}
                      className="p-3 rounded-xl border border-border/80 bg-muted/20 hover:border-primary/40 hover:bg-primary/5 transition-all"
                    >
                      <p className="text-xs font-bold text-foreground">{svc.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {svc.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Gallery Showcase */}
            {profile.gallery?.length ? (
              <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-3 shadow-2xs">
                <SectionHeader
                  icon={GalleryHorizontal}
                  title="Photo Gallery Showcase"
                  subtitle="Atmosphere, product showcase, and special moments"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {profile.gallery.map((item) => (
                    <div
                      key={item.id}
                      className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer border border-border/80 bg-muted"
                    >
                      {(item.image?.md || item.image?.sm || item.image?.o) ? (
                        <SmartImage
                          src={item.image?.o || item.image?.md || item.image?.sm}
                          alt={item.title || "Gallery"}
                          fill
                          className="group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <ImageIcon className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        <p className="text-white text-xs font-bold leading-tight">{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Opening Hours */}
            {profile.businessHours?.length ? (
              <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-3 shadow-2xs">
                <SectionHeader
                  icon={Clock}
                  title="Operating Hours & Schedule"
                  subtitle="Weekly opening and closing business schedule"
                />
                <div className="divide-y divide-border/60">
                  {profile.businessHours.map((h) => {
                    const isToday = h.day === todayKey;
                    return (
                      <div
                        key={h.day}
                        className={`flex justify-between items-center py-2 px-3 rounded-xl transition-colors ${
                          isToday ? "bg-primary/10 border border-primary/20" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                            {getDayLabel(h.day)}
                          </span>
                          {isToday && (
                            <span className="text-[10px] font-extrabold bg-primary text-primary-foreground px-2 py-0.5 rounded-md">
                              Today
                            </span>
                          )}
                        </div>
                        {(h.openTime && h.closeTime) ? (
                          <span className={`text-xs font-semibold ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
                            {`${formatTime(h.openTime)} – ${formatTime(h.closeTime)}`}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-500">Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Customer Reviews */}
            <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-4 shadow-2xs">
              <SectionHeader
                icon={MessageSquare}
                title="Customer Reviews"
                subtitle="Feedback and ratings from verified guests"
                action={
                  <CustomButton
                    size="sm"
                    variant="outline"
                    className="gap-1.5 font-bold"
                    onClick={() => setShowReviewModal(true)}
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    Write a Review
                  </CustomButton>
                }
              />
              <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-muted/20 border border-border/80 items-center">
                <div className="text-center flex-shrink-0 sm:pr-4 sm:border-r sm:border-border/60">
                  <p className="text-2xl font-extrabold text-primary">{avg.toFixed(2)}</p>
                  <StarRow rating={avg} size={4} />
                  <p className="text-xs font-medium text-muted-foreground mt-1">{total} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5 w-full">
                  {[5, 4, 3, 2, 1].map((r) => (
                    <div key={r} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-6 text-right">{r} ★</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all"
                          style={{ width: `${total ? ((dist[r] || 0) / total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground w-4">{dist[r] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Members */}
            {profile.team?.length ? (
              <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-3 shadow-2xs">
                <SectionHeader
                  icon={Users}
                  title="Meet Our Team"
                  subtitle="The passionate people behind our business"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {profile.team.map((m) => (
                    <div
                      key={m.id}
                      className="text-center p-4 rounded-xl bg-muted/20 border border-border/80 hover:border-primary/30 transition-all"
                    >
                      <div className="relative w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-primary/30 mb-2 bg-muted">
                        {(m.photo?.sm || m.photo?.md || m.photo?.o) ? (
                          <SmartImage src={m.photo?.o || m.photo?.md || m.photo?.sm} alt={m.name} fill />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <span className="text-sm font-bold text-primary">{m.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-bold text-foreground">{m.name}</p>
                      <p className="text-xs text-primary font-semibold mt-0.5">{m.position}</p>
                      {m.bio && (
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          {m.bio}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-4">
            {/* Business Information */}
            <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-3 shadow-2xs">
              <SectionHeader
                icon={Phone}
                title="Business Information"
                subtitle="Direct contact channels & location"
              />
              <div className="space-y-3 pt-1">
                {profile.contact?.address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="text-xs text-muted-foreground">
                      <p className="whitespace-pre-wrap font-medium">{profile.contact.address}</p>
                      {profile.contact.mapLink && (
                        <a
                          href={profile.contact.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1 mt-1 text-xs font-bold"
                        >
                          View on Google Maps <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Phone Numbers (Single Icon layout) */}
                {(() => {
                  const phoneList: string[] = [];
                  if (profile.contact?.phone && profile.contact.phone.trim()) {
                    phoneList.push(profile.contact.phone.trim());
                  }
                  if (profile.contact?.phones && Array.isArray(profile.contact.phones)) {
                    profile.contact.phones.forEach((p) => {
                      if (p.number && p.number.trim() && !phoneList.includes(p.number.trim())) {
                        phoneList.push(p.number.trim());
                      }
                    });
                  }

                  if (phoneList.length === 0) return null;

                  return (
                    <div className="flex items-start gap-2.5">
                      <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-1.5 min-w-0">
                        {phoneList.map((num, idx) => (
                          <a
                            key={idx}
                            href={`tel:${num}`}
                            className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors block break-all"
                          >
                            {num}
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {profile.contact?.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <a href={`mailto:${profile.contact.email}`} className="text-xs font-semibold text-muted-foreground hover:text-primary break-all transition-colors">
                      {profile.contact.email}
                    </a>
                  </div>
                )}

                {profile.contact?.telegram && (
                  <a
                    href={profile.contact.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block pt-1"
                  >
                    <CustomButton variant="outline" size="sm" className="w-full gap-1.5 border-sky-500/30 text-sky-600 hover:bg-sky-500/10 font-bold">
                      <Send className="w-3.5 h-3.5" />
                      Chat on Telegram
                    </CustomButton>
                  </a>
                )}
              </div>
            </div>

            {/* Social Media links */}
            {profile.socialMedia && Array.isArray(profile.socialMedia) && profile.socialMedia.length > 0 && (
              <div className="rounded-[16px] border border-border/80 bg-card/80 backdrop-blur-xs p-5 space-y-3.5 shadow-2xs">
                <SectionHeader
                  icon={Share2}
                  title="Follow Us"
                  subtitle="Official social profiles &amp; networks"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {profile.socialMedia.map((social) => {
                    const nameLower = (social.name || "").toLowerCase();
                    let colorStyles = "hover:border-primary/50 hover:bg-primary/5 text-foreground hover:text-primary";
                    let iconColor = "text-primary bg-primary/10";

                    if (nameLower.includes("facebook") || nameLower.includes("fb")) {
                      colorStyles = "hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400";
                      iconColor = "text-blue-600 bg-blue-500/10 dark:text-blue-400";
                    } else if (nameLower.includes("telegram") || nameLower.includes("tg")) {
                      colorStyles = "hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400";
                      iconColor = "text-sky-500 bg-sky-500/10";
                    } else if (nameLower.includes("instagram") || nameLower.includes("ig")) {
                      colorStyles = "hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-600 dark:hover:text-pink-400";
                      iconColor = "text-pink-500 bg-pink-500/10";
                    } else if (nameLower.includes("youtube") || nameLower.includes("yt")) {
                      colorStyles = "hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400";
                      iconColor = "text-red-500 bg-red-500/10";
                    } else if (nameLower.includes("tiktok")) {
                      colorStyles = "hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400";
                      iconColor = "text-cyan-500 bg-cyan-500/10";
                    }

                    return (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group flex items-center justify-between p-3 rounded-xl border border-border/80 bg-background/50 backdrop-blur-2xs transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-[0.98] ${colorStyles}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 transition-transform group-hover:scale-110 ${iconColor}`}>
                            <Share2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold truncate group-hover:underline">
                            {social.name}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-current group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Write a Review Modal ── */}
      <WriteReviewModal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        businessName={businessName}
        businessId={businessId}
      />

      {/* ── QR Template Modal ── */}
      <QRTemplateModal
        open={showQRModal}
        onClose={() => setShowQRModal(false)}
        url={profileUrl}
        businessName={businessName}
        subtitle={profile.tagline || "Scan to view our menu"}
        logoUrl={logoUrl}
      />
    </div>
  );
}
