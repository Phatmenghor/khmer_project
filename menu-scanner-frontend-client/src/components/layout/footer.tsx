"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock } from "lucide-react";
import { PageContainer } from "../shared/common/page-container";
import { useAppSelector } from "@/redux/store";
import { selectBusinessSettings } from "@/redux/features/business/store/selectors/business-settings-selector";

// Type declaration for global cached business data
declare global {
  interface Window {
    __cachedBusinessData?: {
      businessName?: string;
      logoBusinessUrl?: string;
      primaryColor?: string;
      taxPercentage?: number;
    };
  }
}

export function Footer() {
  const businessSettings = useAppSelector(selectBusinessSettings);

  // Use cached data initially for FAST load, then switch to Redux when available
  const [cachedBusinessName, setCachedBusinessName] = useState<string | undefined>();
  const [cachedLogoUrl, setCachedLogoUrl] = useState<string | undefined>();

  // Initialize from cached data on mount (before Redux loads)
  useEffect(() => {
    if (typeof window !== "undefined" && window.__cachedBusinessData) {
      setCachedBusinessName(window.__cachedBusinessData.businessName);
      setCachedLogoUrl(window.__cachedBusinessData.logoBusinessUrl);
      console.log("## [FOOTER] Loaded cached business data on mount");
    }
  }, []);

  // Use Redux data when available, fall back to cache
  const businessName = businessSettings?.businessName || cachedBusinessName || "Menu Scanner";
  const businessLogoUrl = businessSettings?.logoBusinessUrl || cachedLogoUrl || "/assets/favicon.ico";
  const contactAddress = businessSettings?.contactAddress || "Your Business Address";
  const contactPhone = businessSettings?.contactPhone || "+855 12 345 678";
  const contactEmail = businessSettings?.contactEmail || "contact@menuscanner.com";
  const businessHours = businessSettings?.businessHours || [];
  const socialMedia = businessSettings?.socialMedia || [];

  return (
    <footer className="bg-primary/90 text-white">
      <PageContainer>
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Section 1: Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 w-fit">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <Image
                  src={businessLogoUrl}
                  alt={businessName}
                  width={24}
                  height={24}
                  className="rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/assets/favicon.ico";
                  }}
                />
              </div>
              <span className="font-bold text-lg text-white">
                {businessName}
              </span>
            </div>
            <p className="text-white text-sm leading-relaxed">
              {businessName} - Your trusted destination for premium dining experiences.
              Explore menus, discover favorites, and enjoy seamless ordering.
            </p>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <p className="text-white">
                  {contactAddress}
                </p>
              </div>
              <div className="flex gap-3">
                <Phone className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <p className="text-white">
                  {contactPhone}
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-white hover:text-white/80 transition-colors flex gap-3"
                >
                  <span className="text-white/80 text-xs">✉</span>
                  <span>{contactEmail}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Section 3: Business Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Business Hours</h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                <div className="text-white">
                  {businessHours.map((hours, index) => (
                    <p key={index} className="font-medium">
                      {hours.day}: {hours.openingTime} - {hours.closingTime}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Follow Us - From Business Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Follow Us</h3>
            <div className="space-y-2 text-sm">
              {socialMedia && socialMedia.length > 0 ? (
                socialMedia.map((social) => (
                  <a
                    key={social.id || social.name}
                    href={social.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                  >
                    {social.imageUrl && (
                      <Image
                        src={social.imageUrl}
                        alt={social.name}
                        width={16}
                        height={16}
                        className="rounded"
                      />
                    )}
                    <span>{social.name}</span>
                  </a>
                ))
              ) : (
                <p className="text-white/60">Follow our social channels</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Divider */}
        <div className="border-t border-white/20 my-8"></div>

        {/* Footer Bottom */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white text-sm">
            © 2026 {businessName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-white hover:text-white/80 text-sm transition-colors">
              Privacy
            </a>
            <a href="#" className="text-white hover:text-white/80 text-sm transition-colors">
              Terms
            </a>
            <a href="#" className="text-white hover:text-white/80 text-sm transition-colors">
              Support
            </a>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
