"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { PageContainer } from "../shared/common/page-container";
import { useAppSelector } from "@/store";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";
import { readBusinessCache } from "@/lib/business-cache";

export function Footer() {
  const businessSettings = useAppSelector(selectBusinessSettings);


  const [cachedBusinessName, setCachedBusinessName] = useState<string | undefined>();
  const [cachedLogoUrl, setCachedLogoUrl] = useState<string | undefined>();


  useEffect(() => {
    const cache = readBusinessCache();
    if (cache) {
      setCachedBusinessName(cache.businessName);
      setCachedLogoUrl(cache.logoBusinessUrl);
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
        <div className="py-8 grid grid-cols-1 md:grid-cols-4 gap-5">
          {}
          {businessName && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 group">
                <div className="relative">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-all duration-300 overflow-hidden flex-shrink-0">
                    {businessLogoUrl && (
                      <img
                        src={businessLogoUrl}
                        alt={businessName}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/image/no-image.png";
                        }}
                      />
                    )}
                  </div>
                  <div className="absolute -inset-1 rounded bg-gradient-to-br from-primary/20 to-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-xs leading-tight tracking-tight">
                    {businessName}
                  </span>
                  <span className="text-white/70 text-xs font-medium tracking-wide">
                    Restaurant
                  </span>
                </div>
              </div>
              <p className="text-white/90 text-xs leading-relaxed">
                {businessName} - Your trusted destination for premium dining experiences.
                Explore menus, discover favorites, and enjoy seamless ordering.
              </p>
            </div>
          )}

          {}
          {(contactAddress || contactPhone || contactEmail) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-white text-xs">Contact Info</h3>
              <div className="space-y-2 text-xs">
                {contactAddress && (
                  <div className="flex gap-2 items-start">
                    <div className="w-3 h-3 flex items-center justify-center flex-shrink-0 text-white pt-0.5">
                      <MapPin className="w-3 h-3" />
                    </div>
                    <p className="text-white leading-relaxed">
                      {contactAddress}
                    </p>
                  </div>
                )}
                {contactPhone && (
                  <div className="flex gap-2 items-center">
                    <div className="w-3 h-3 flex items-center justify-center flex-shrink-0 text-white">
                      <Phone className="w-3 h-3" />
                    </div>
                    <a href={`tel:${contactPhone}`} className="text-white hover:text-white/80 transition-colors">
                      {contactPhone}
                    </a>
                  </div>
                )}
                {contactEmail && (
                  <div className="flex gap-2 items-center">
                    <div className="w-3 h-3 flex items-center justify-center flex-shrink-0 text-white">
                      <Mail className="w-3 h-3" />
                    </div>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-white hover:text-white/80 transition-colors"
                    >
                      {contactEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {}
          {businessHours.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-white text-xs">Business Hours</h3>
              <div className="space-y-1 text-xs">
                <div className="flex gap-2">
                  <Clock className="w-3 h-3 text-white flex-shrink-0 mt-0.5" />
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
          )}

          {}
          {socialMedia && socialMedia.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-white text-xs">Follow Us</h3>
              <div className="space-y-1 text-xs">
                {socialMedia.map((social: { name: string; linkUrl: string; imageUrl?: string }) => (
                  <a
                    key={social.name}
                    href={social.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-white hover:text-white/80 transition-colors"
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
        <div className="border-t border-white/20 my-5"></div>

        {}
        <div className="py-4 flex flex-col md:flex-row justify-between items-center gap-3">
          {businessName && (
            <p className="text-white text-xs">
              © 2026 {businessName}. All rights reserved.
            </p>
          )}
          <div className="flex gap-4">
            <a href="#" className="text-white hover:text-white/80 text-xs transition-colors">
              Privacy
            </a>
            <a href="#" className="text-white hover:text-white/80 text-xs transition-colors">
              Terms
            </a>
            <a href="#" className="text-white hover:text-white/80 text-xs transition-colors">
              Support
            </a>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
