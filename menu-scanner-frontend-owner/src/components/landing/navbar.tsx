"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { QrCode, Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${
        scrolled ? "shadow-md border-b border-gray-100" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#A23469] flex items-center justify-center shadow-sm">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#A23469] tracking-tight">
              eMenu
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-[#A23469] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-[#A23469] transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-[#FDF2F7]"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#A23469] text-white text-sm font-semibold hover:bg-[#802A54] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-[#A23469] hover:bg-[#FDF2F7] transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-[#A23469] px-3 py-2.5 rounded-lg hover:bg-[#FDF2F7] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-3 flex flex-col gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-center border border-gray-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-white bg-[#A23469] hover:bg-[#802A54] px-3 py-2.5 rounded-lg transition-colors text-center shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
