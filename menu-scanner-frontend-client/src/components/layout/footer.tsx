"use client";

import Image from "next/image";
import { MapPin, Phone, Clock } from "lucide-react";
import { PageContainer } from "../shared/common/page-container";
import { businessSettingsStorage } from "@/utils/storage/business-settings-storage";
import { useInitialization } from "@/context/initialization-provider";

export function Footer() {
  // Load from cache - only show actual cached values, no hardcoded defaults
  const cached = businessSettingsStorage.getCached();
  const cachedSettings = cached?.data || null;

  // Use only cached values to prevent hydration mismatch
  const businessName = cachedSettings?.businessName || "Menu Scanner";
  const logoUrl = cachedSettings?.logoBusinessUrl || null;
  const primaryColor = cachedSettings?.primaryColor || "#3b82f6";
  const contactAddress = cachedSettings?.contactAddress;
  const contactPhone = cachedSettings?.contactPhone;
  const contactEmail = cachedSettings?.contactEmail;
  const businessHours = cachedSettings?.businessHours || [];
  const socialMedia = cachedSettings?.socialMedia || [];

  return (
    <footer
      className="text-white"
      style={{ backgroundColor: primaryColor }}
      suppressHydrationWarning
    >
      <PageContainer>
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Section 1: Logo & Description */}
          <div className="space-y-4">
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
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Contact Info</h3>
            <div className="space-y-3 text-sm">
              {contactAddress && (
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <p className="text-white">
                    {contactAddress}
                  </p>
                </div>
              )}
              {contactPhone && (
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <p className="text-white">
                    {contactPhone}
                  </p>
                </div>
              )}
              {contactEmail && (
                <div className="flex gap-3">
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-white hover:text-white/80 transition-colors flex gap-3"
                  >
                    <span className="text-white/80 text-xs">✉</span>
                    <span>{contactEmail}</span>
                  </a>
                </div>
              )}
              {!contactAddress && !contactPhone && !contactEmail && (
                <p className="text-white/60 text-sm">Contact information available after loading</p>
              )}
            </div>
          </div>

          {/* Section 3: Business Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Business Hours</h3>
            <div className="space-y-2 text-sm">
              {businessHours && businessHours.length > 0 ? (
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <div className="text-white">
                    {businessHours.map((hours: any, index: number) => (
                      <p key={index} className="font-medium">
                        {typeof hours.day === 'string' ? formatDay(hours.day) : hours.day}:{" "}
                        {hours.openingTime && hours.closingTime ? (
                          `${hours.openingTime} - ${hours.closingTime}`
                        ) : (
                          <span className="text-white/60">Closed</span>
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-white/60 text-sm">Hours available after loading</p>
              )}
            </div>
          </div>

          {/* Section 4: Follow Us */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Follow Us</h3>
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
          </div>
        </div>

        {/* Footer Divider */}
        <div className="border-t border-white/20 my-8"></div>

        {/* Footer Bottom */}
        <div className="pb-8 text-center text-white text-sm text-white/60">
          <p>&copy; {new Date().getFullYear()} {businessName}. All rights reserved.</p>
        </div>
      </PageContainer>
    </footer>
  );
}

function formatDay(day: string): string {
  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
}
