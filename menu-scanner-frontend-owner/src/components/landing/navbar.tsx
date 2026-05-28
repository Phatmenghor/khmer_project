"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/app-routes/routes";
import { LoginModal } from "./login-modal";
import { RegisterModal } from "./register-modal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

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
        <div className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between ">
            {/* Logo */}
            <Link href={ROUTES.PUBLIC.HOME} className="flex items-center gap-3">
              <Image
                src="/images/logo/my_logo.png"
                alt="Emenu Cambodia Logo"
                width={120}
                height={120}
                className="h-20 w-auto"
                priority
              />
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

              {/* Auth Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="h-10 px-6"
                  onClick={() => setLoginOpen(true)}
                >
                  Sign In
                </Button>
                <Button
                  className="h-10 px-8 text-base bg-primary hover:bg-primary/90 text-white rounded-lg"
                  onClick={() => setRegisterOpen(true)}
                >
                  Get Started Free
                </Button>
              </div>
            </div>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden w-12 h-12"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
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
            <div className="pt-4 border-t border-slate-200 mt-3 space-y-2">
              <Button
                variant="outline"
                className="w-full h-10"
                onClick={() => {
                  setMobileOpen(false);
                  setLoginOpen(true);
                }}
              >
                Sign In
              </Button>
              <Button
                className="w-full h-10 text-base bg-primary hover:bg-primary/90 text-white"
                onClick={() => {
                  setMobileOpen(false);
                  setRegisterOpen(true);
                }}
              >
                Get Started Free
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <RegisterModal isOpen={registerOpen} onClose={() => setRegisterOpen(false)} />
    </>
  );
}

