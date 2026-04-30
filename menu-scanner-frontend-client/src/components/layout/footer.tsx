"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { PageContainer } from "../shared/common/page-container";
import { businessSettingsStorage } from "@/utils/storage/business-settings-storage";
import { useInitialization } from "@/context/initialization-provider";
import { Skeleton } from "@/components/shared/loaders/skeleton-loader";

export function Footer() {
  const { colorsReady } = useInitialization();
  const [mounted, setMounted] = useState(false);

  // Cache is loaded synchronously from localStorage
  // Load synchronously from localStorage (no state, no re-renders)
  const cached = businessSettingsStorage.getCached();
  const cachedSettings = cached?.data || null;

  // Use cached settings (guaranteed to have primaryColor at this point)
  const businessName = cachedSettings?.businessName || "Menu Scanner";
  const logoUrl = cachedSettings?.logoBusinessUrl;
  const contactAddress = cachedSettings?.contactAddress || "";
  const contactPhone = cachedSettings?.contactPhone || "";
  const contactEmail = cachedSettings?.contactEmail || "";
  const businessHours = cachedSettings?.businessHours || [];
  const socialMedia = cachedSettings?.socialMedia || [];
  const primaryColor = cachedSettings?.primaryColor || "#3b82f6";

  // Ensure hydration is complete before rendering to avoid mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="text-white" style={{ backgroundColor: colorsReady ? primaryColor : "#9ca3af" }}>
      <PageContainer>
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Section 1: Logo & Description */}
          <div className="space-y-4">
            {colorsReady ? (
              <>
                <div className="flex items-center gap-2 w-fit">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={businessName}
                        width={24}
                        height={24}
                        className="rounded object-contain"
                        priority
                      />
                    ) : (
                      <Image
                        src="/assets/favicon.ico"
                        alt={businessName}
                        width={24}
                        height={24}
                        className="rounded object-contain"
                      />
                    )}
                  </div>
                  <span className="font-bold text-lg text-white">
                    {businessName}
                  </span>
                </div>
                <p className="text-white text-sm leading-relaxed">
                  Discover and explore menus from your favorite restaurants. Browse,
                  compare, and order with ease.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 w-fit">
                  <Skeleton circle width={40} height={40} className="bg-white/30" />
                  <Skeleton width={100} height={24} className="bg-white/30" />
                </div>
                <Skeleton width={200} height={60} count={2} className="bg-white/30" />
              </>
            )}
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Contact Info</h3>
            {mounted ? (
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
            ) : (
              <div className="space-y-3">
                <Skeleton width={200} height={16} className="bg-white/30" />
                <Skeleton width={200} height={16} className="bg-white/30" />
                <Skeleton width={200} height={16} className="bg-white/30" />
              </div>
            )}
          </div>

          {/* Section 3: Business Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Business Hours</h3>
            {mounted ? (
              <div className="space-y-2 text-sm">
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <div className="text-white">
                    {businessHours && businessHours.length > 0 ? (
                      businessHours.map((hours: any, index: number) => (
                        <p key={index} className="font-medium">
                          {typeof hours.day === 'string' ? formatDay(hours.day) : hours.day}:{" "}
                          {hours.openingTime && hours.closingTime ? (
                            `${hours.openingTime} - ${hours.closingTime}`
                          ) : (
                            <span className="text-white/60">Closed</span>
                          )}
                        </p>
                      ))
                    ) : (
                      <p className="text-white/60">Contact for hours</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Skeleton width={200} height={16} className="bg-white/30" />
                <Skeleton width={200} height={16} className="bg-white/30" />
              </div>
            )}
          </div>

          {/* Section 4: Follow Us */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Follow Us</h3>
            {mounted ? (
              <div className="space-y-2 text-sm">
                {socialMedia && socialMedia.length > 0 ? (
                  socialMedia.map((social: any) => (
                    <a
                      key={social.name}
                      href={social.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-white hover:text-white/80 transition-colors"
                    >
                      {social.name}
                    </a>
                  ))
                ) : (
                  <p className="text-white/60 text-sm">Follow us on social media</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Skeleton width={150} height={16} className="bg-white/30" />
                <Skeleton width={150} height={16} className="bg-white/30" />
              </div>
            )}
          </div>
        </div>

        {/* Footer Divider */}
        <div className="border-t border-white/20 my-8"></div>

        {/* Footer Bottom */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white text-sm">
            © 2026 Menu Scanner E-Commerce. All rights reserved.
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

// Helper function to format day names from API
function formatDay(day: string): string {
  const days: Record<string, string> = {
    MONDAY: "Monday",
    TUESDAY: "Tuesday",
    WEDNESDAY: "Wednesday",
    THURSDAY: "Thursday",
    FRIDAY: "Friday",
    SATURDAY: "Saturday",
    SUNDAY: "Sunday",
  };
  return days[day] || day;
}
