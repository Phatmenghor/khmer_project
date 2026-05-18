"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock } from "lucide-react";
import { PageContainer } from "../shared/common/page-container";
import { useAppSelector } from "@/store";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";


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


  const [cachedBusinessName, setCachedBusinessName] = useState<string | undefined>();
  const [cachedLogoUrl, setCachedLogoUrl] = useState<string | undefined>();


  useEffect(() => {
    if (typeof window !== "undefined" && window.__cachedBusinessData) {
      setCachedBusinessName(window.__cachedBusinessData.businessName);
      setCachedLogoUrl(window.__cachedBusinessData.logoBusinessUrl);
    }
  }, []);


  const businessName = businessSettings?.businessName || cachedBusinessName || "";
  const businessLogoUrl = businessSettings?.logoBusinessUrl || cachedLogoUrl || "";
  const contactAddress = businessSettings?.contactAddress || "";
  const contactPhone = businessSettings?.contactPhone || "";
  const contactEmail = businessSettings?.contactEmail || "";
  const businessHours = businessSettings?.businessHours || [];
  const socialMedia = businessSettings?.socialMedia || [];

  return (
    <footer className="bg-primary/90 text-white">
      <PageContainer>
        {}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {}
          {businessName && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-all duration-300 overflow-hidden flex-shrink-0">
                    {businessLogoUrl && (
                      <img
                        src={businessLogoUrl}
                        alt={businessName}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/image/no-image.png";
                        }}
                      />
                    )}
                  </div>
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary/20 to-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-base leading-tight tracking-tight">
                    {businessName}
                  </span>
                  <span className="text-white/70 text-xs font-medium tracking-wide">
                    Restaurant
                  </span>
                </div>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">
                {businessName} - Your trusted destination for premium dining experiences.
                Explore menus, discover favorites, and enjoy seamless ordering.
              </p>
            </div>
          )}

          {}
          {(contactAddress || contactPhone || contactEmail) && (
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
              </div>
            </div>
          )}

          {}
          {businessHours.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-base">Business Hours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <div className="text-white">
                    {businessHours.map((hours, index) => (
                      <p key={index} className="font-medium">
                        {hours.day}: {hours.openTime} - {hours.closeTime}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {}
          {socialMedia && socialMedia.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-base">Follow Us</h3>
              <div className="space-y-2 text-sm">
                {socialMedia.map((social) => (
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
                ))}
              </div>
            </div>
          )}
        </div>

        {}
        <div className="border-t border-white/20 my-8"></div>

        {}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          {businessName && (
            <p className="text-white text-sm">
              © 2026 {businessName}. All rights reserved.
            </p>
          )}
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
