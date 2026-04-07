import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail } from "lucide-react";
import { PageContainer } from "../shared/common/page-container";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-100 border-t">
      <PageContainer>
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Section: Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 w-fit">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Image
                  src="/assets/favicon.ico"
                  alt="Menu Scanner"
                  width={24}
                  height={24}
                  className="rounded object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-base">
                  Menu Scanner
                </span>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
              Discover and explore menus from your favorite restaurants. Browse,
              compare, and order with ease.
            </p>
          </div>

          {/* Right Section: Contact & Social */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-2">
              <p className="text-slate-300 text-sm">
                <span className="block font-medium text-white mb-2">Contact</span>
                123 Street Name, Phnom Penh, Cambodia
                <br />
                +855 12 345 678
                <br />
                support@menuscanner.com
              </p>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 text-slate-300 hover:bg-pink-600 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:support@menuscanner.com"
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-slate-800 py-6">
          <p className="text-slate-400 text-sm text-center">
            Copyright 2026 Menu Scanner. All rights reserved.
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
