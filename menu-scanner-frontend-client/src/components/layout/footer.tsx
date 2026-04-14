"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock } from "lucide-react";
import { PageContainer } from "../shared/common/page-container";
import { useAppSelector } from "@/redux/store";
import { selectBusinessSettings } from "@/redux/features/business/store/selectors/business-settings-selector";

// Default constants for fallback
const DEFAULT_CONTACT_ADDRESS = "123 Street Name, Phnom Penh, Cambodia";
const DEFAULT_CONTACT_PHONE = "+855 12 345 678";
const DEFAULT_CONTACT_EMAIL = "support@menuscanner.com";
const DEFAULT_BUSINESS_HOURS = [
  { day: "Mon - Fri", openingTime: "09:00", closingTime: "22:00" },
  { day: "Sat", openingTime: "10:00", closingTime: "23:00" },
  { day: "Sun", openingTime: "10:00", closingTime: "21:00" },
];

// Social media links - these are hardcoded but could be moved to Redux
const SOCIAL_LINKS = [
  { name: "Facebook", url: "https://facebook.com" },
  { name: "Instagram", url: "https://instagram.com" },
  { name: "Telegram", url: "https://telegram.me" },
];

export function Footer() {
  const businessSettings = useAppSelector(selectBusinessSettings);

  // Use Redux data or fallback to defaults
  const contactAddress = businessSettings?.contactAddress || DEFAULT_CONTACT_ADDRESS;
  const contactPhone = businessSettings?.contactPhone || DEFAULT_CONTACT_PHONE;
  const contactEmail = businessSettings?.contactEmail || DEFAULT_CONTACT_EMAIL;
  const businessHours = businessSettings?.businessHours || DEFAULT_BUSINESS_HOURS;

  return (
    <footer className="bg-primary/90 text-white">
      <PageContainer>
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Section 1: Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 w-fit">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Image
                  src="/assets/favicon.ico"
                  alt="Menu Scanner"
                  width={24}
                  height={24}
                  className="rounded object-contain"
                />
              </div>
              <span className="font-bold text-lg text-white">
                Menu Scanner
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

          {/* Section 4: Follow Us */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Follow Us</h3>
            <div className="space-y-2 text-sm">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-white hover:text-white/80 transition-colors"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Divider */}
        <div className="border-t border-white/20 my-8"></div>

        {/* Footer Bottom */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left space-y-2">
              <p className="text-white text-sm">
                © 2026 Menu Scanner E-Commerce. All rights reserved.
              </p>
              <p className="text-white text-sm flex items-center gap-1 justify-center md:justify-start">
                Made with <span className="text-red-500">❤</span> by the Menu Scanner Team
              </p>
            </div>
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
        </div>
      </PageContainer>
    </footer>
  );
}
