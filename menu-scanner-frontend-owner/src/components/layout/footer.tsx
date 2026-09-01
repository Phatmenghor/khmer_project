"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SmartImage } from "@/components/shared/image/smart-image";
import { MapPin, Phone, Clock, Mail, ExternalLink, Sparkles } from "lucide-react";
import { PageContainer } from "../shared/common/page-container";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";
import { fetchBusinessSettingsThunk } from "@/features/business/store/thunks/business-settings-thunks";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { AppDefault } from "@/constants/app-resource/default/default";
import { SocialMedia } from "@/features/business/store/services/business-settings-service";

function formatTime12Hour(timeStr?: string): string {
  if (!timeStr) return "";
  if (timeStr.toUpperCase().includes("AM") || timeStr.toUpperCase().includes("PM")) {
    return timeStr;
  }
  const parts = timeStr.trim().split(":");
  if (parts.length < 2) return timeStr;

  let hour = parseInt(parts[0], 10);
  const minute = parts[1].substring(0, 2);
  if (isNaN(hour)) return timeStr;

  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  const formattedHour = String(hour).padStart(2, "0");

  return `${formattedHour}:${minute} ${period}`;
}

export function Footer() {
  const dispatch = useAppDispatch();
  const businessSettings = useAppSelector(selectBusinessSettings);

  useEffect(() => {
    if (!businessSettings) {
      dispatch(fetchBusinessSettingsThunk(AppDefault.BUSINESS_ID));
    }
  }, [businessSettings, dispatch]);

  const businessName = businessSettings?.businessName || "";
  const businessLogoUrl =
    businessSettings?.logoBusiness?.o ||
    businessSettings?.logoBusiness?.md ||
    businessSettings?.logoBusiness?.sm ||
    "";
  const contactAddress = businessSettings?.contactAddress || "";
  const contactPhone = businessSettings?.contactPhone || "";
  const contactEmail = businessSettings?.contactEmail || "";
  const storeDescription = businessSettings?.storeDescription || "";
  const businessHours = businessSettings?.businessHours || [];
  const socialMedia = businessSettings?.socialMedia || [];

  const hasContactInfo = Boolean(contactAddress || contactPhone || contactEmail);
  const hasHours = businessHours.length > 0;
  const hasSocials = socialMedia.length > 0;

  return (
    <footer className="w-full border-t border-primary/15 bg-gradient-to-b from-primary/8 via-card/90 to-primary/5 backdrop-blur-md text-foreground transition-colors duration-300 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-primary/10 rounded-full blur-3xl opacity-60" />
      <PageContainer>
        <div className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Store Brand Info */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl border border-border/80 bg-background/90 p-1 flex items-center justify-center shadow-2xs group-hover:border-primary/50 transition-colors overflow-hidden shrink-0">
                <SmartImage
                  src={businessLogoUrl}
                  fallbackSrc={appImages.scanmekhLogo}
                  alt={businessName}
                  width={32}
                  height={32}
                  rounded="md"
                  showSkeleton={false}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm text-foreground leading-tight tracking-tight">
                  {businessName}
                </span>
                <span className="text-[11px] font-semibold text-primary flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3" />
                  Verified Storefront
                </span>
              </div>
            </div>
            {storeDescription && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {storeDescription}
              </p>
            )}
          </div>

          {/* Column 2: Contact Information */}
          {hasContactInfo && (
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Contact Information
              </h3>
              <div className="space-y-2.5 text-xs text-muted-foreground">
                {contactAddress && (
                  <div className="flex gap-2.5 items-start">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{contactAddress}</span>
                  </div>
                )}
                {contactPhone && (
                  <div className="flex gap-2.5 items-center">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <a href={`tel:${contactPhone}`} className="hover:text-primary transition-colors font-medium">
                      {contactPhone}
                    </a>
                  </div>
                )}
                {contactEmail && (
                  <div className="flex gap-2.5 items-center">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <a href={`mailto:${contactEmail}`} className="hover:text-primary transition-colors font-medium">
                      {contactEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Column 3: Business Hours */}
          {hasHours && (
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Opening Hours
              </h3>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {businessHours.map((hours, index) => (
                  <div key={index} className="flex justify-between items-center py-0.5 border-b border-border/40 last:border-0">
                    <span className="font-semibold text-foreground">{hours.day}:</span>
                    <span className="font-medium text-xs">
                      {formatTime12Hour(hours.openingTime)} – {formatTime12Hour(hours.closingTime)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Column 4: Social Media & Channels */}
          {hasSocials && (
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Connect With Us
              </h3>
              <div className="flex flex-wrap gap-2">
                {socialMedia.map((social: SocialMedia) => (
                  <a
                    key={social.name}
                    href={social.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-border/80 bg-background/80 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all duration-200 shadow-2xs"
                  >
                    {social.image?.sm ? (
                      <SmartImage
                        src={social.image.sm}
                        alt={social.name}
                        width={14}
                        height={14}
                        rounded="sm"
                        showSkeleton={false}
                      />
                    ) : (
                      <ExternalLink className="w-3 h-3 text-primary" />
                    )}
                    <span>{social.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom copyright bar */}
        <div className="border-t border-border/60 py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/business-profile" className="hover:text-primary transition-colors">
              About Store
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-primary transition-colors">
              Menu Showcase
            </Link>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
