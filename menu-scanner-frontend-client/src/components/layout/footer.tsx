import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import { PageContainer } from "../shared/common/page-container";

export function Footer() {
  return (
    <footer className="bg-primary/80 text-white">
      <PageContainer>
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
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
            <p className="text-white/80 text-sm leading-relaxed">
              Discover and explore menus from your favorite restaurants. Browse,
              compare, and order with ease.
            </p>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-white/70 flex-shrink-0 mt-0.5" />
                <p className="text-white/80">
                  123 Street Name, Phnom Penh, Cambodia
                </p>
              </div>
              <div className="flex gap-3">
                <Phone className="w-5 h-5 text-white/70 flex-shrink-0 mt-0.5" />
                <p className="text-white/80">
                  +855 12 345 678
                </p>
              </div>
              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-white/70 flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:support@menuscanner.com"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  support@menuscanner.com
                </a>
              </div>
            </div>
          </div>

          {/* Section 3: Business Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Business Hours</h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-white/70 flex-shrink-0 mt-0.5" />
                <div className="text-white/80">
                  <p className="font-medium">Mon - Fri: 09:00 - 22:00</p>
                  <p className="font-medium">Sat: 10:00 - 23:00</p>
                  <p className="font-medium">Sun: 10:00 - 21:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <a href="#" className="text-white/80 hover:text-white transition-colors block">
                Browse Menus
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors block">
                Promotions
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors block">
                My Orders
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors block">
                Help Center
              </a>
            </div>
          </div>

          {/* Section 5: Follow Us */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-base">Follow Us</h3>
            <div className="space-y-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
                <span className="text-sm font-medium">Facebook</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
                <span className="text-sm font-medium">Instagram</span>
              </a>
              <a
                href="https://telegram.me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Telegram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Divider */}
        <div className="border-t border-white/20 my-8"></div>

        {/* Footer Bottom */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/70 text-sm">
            Copyright © 2026 Menu Scanner. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
