import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, MapPin, Phone, Clock } from "lucide-react";
import { PageContainer } from "../shared/common/page-container";

export function Footer() {
  return (
    <footer className="bg-primary/5 text-foreground">
      <PageContainer>
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Section 1: Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 w-fit">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Image
                  src="/assets/favicon.ico"
                  alt="Menu Scanner"
                  width={24}
                  height={24}
                  className="rounded object-contain"
                />
              </div>
              <span className="font-semibold text-base text-foreground">
                Menu Scanner
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Discover and explore menus from your favorite restaurants. Browse,
              compare, and order with ease.
            </p>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  123 Street Name, Phnom Penh, Cambodia
                </p>
              </div>
              <div className="flex gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">
                  +855 12 345 678
                </p>
              </div>
              <div className="flex gap-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:support@menuscanner.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  support@menuscanner.com
                </a>
              </div>
            </div>
          </div>

          {/* Section 3: Business Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Business Hours</h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <Clock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-muted-foreground">
                  <p>Monday - Friday: 09:00 - 22:00</p>
                  <p>Saturday: 10:00 - 23:00</p>
                  <p>Sunday: 10:00 - 21:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Social Links & Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Follow Us</h3>
            <div className="flex gap-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:support@menuscanner.com"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-primary/10 py-6">
          <p className="text-muted-foreground text-sm text-center">
            Copyright © 2026 Menu Scanner. All rights reserved.
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
