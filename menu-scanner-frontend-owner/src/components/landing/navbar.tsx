"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { QrCode, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/app-routes/routes";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-200",
        scrolled ? "shadow-sm" : ""
      )}
    >
      <div className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={ROUTES.PUBLIC.HOME} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              Emenu Cambodia
            </span>
          </Link>

          {/* Desktop nav and CTA - Right side */}
          <div className="hidden md:flex items-center gap-6">
            {/* Navigation Links */}
            <nav className="flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* CTA Button */}
            <Button className="h-12 px-8 text-base bg-primary hover:bg-primary/90 text-white rounded-lg" asChild>
              <Link href={ROUTES.PUBLIC.REGISTER}>Get Started Free</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden w-12 h-12"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-md text-base font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-slate-200 mt-3">
            <Button className="w-full h-12 text-base" asChild>
              <Link href={ROUTES.PUBLIC.REGISTER}>Get Started Free</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
