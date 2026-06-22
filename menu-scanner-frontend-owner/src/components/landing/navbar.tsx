"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/app-routes/routes";
import { appImages } from "@/constants/app-resource/icons/app-images";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
      setShowScrollTop(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-200",
          scrolled ? "shadow-sm" : "",
        )}
      >
        <div className="max-w-[1330px] mx-auto px-3 sm:px-4 lg:px-5">
          <div className="flex items-center justify-between ">
            {/* Logo */}
            <Link href={ROUTES.PUBLIC.HOME} className="flex items-center gap-2">
              <Image
                src={appImages.myLogo}
                alt="Emenu Cambodia Logo"
                width={120}
                height={120}
                className="h-14 w-auto"
                priority
              />
            </Link>

            {/* Desktop nav and CTA - Right side */}
            <div className="hidden md:flex items-center gap-4">
              {/* Navigation Links */}
              <nav className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="px-2 py-1 rounded text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              {/* Auth Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  className="h-7 px-5 text-xs bg-primary hover:bg-primary/90 text-white rounded"
                  onClick={scrollToPricing}
                >
                  Get Started Free
                </Button>
              </div>
            </div>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-8 h-8"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-3 py-3 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-slate-200 mt-2">
              <Button
                className="w-full h-7 text-xs bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  setMobileOpen(false);
                  scrollToPricing();
                }}
              >
                Get Started Free
              </Button>
            </div>
          </div>
        )}
      </header>

    </>
  );
}

