"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight, UserCheck, ShieldCheck } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/app-routes/routes";
import { appImages } from "@/constants/app-resource/icons/app-images";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Pricing", href: "#pricing" },
    { label: "Capabilities", href: "#capabilities" },
    { label: "Founder", href: "#founder" },
    { label: "FAQ", href: "#faq" },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-xl bg-background/85 border-b border-border/80",
        scrolled ? "shadow-md bg-background/95" : ""
      )}
    >
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link href={ROUTES.PUBLIC.HOME} className="flex items-center gap-2.5 group">
            <Image
              src={appImages.scanmekhLogo}
              alt="ScanMeKH Logo"
              width={140}
              height={140}
              className="h-10 sm:h-12 w-auto transition-transform duration-200 group-hover:scale-105"
              priority
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-full border border-border/60 shadow-2xs">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-background transition-all cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action Buttons: Login & Register */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link href={ROUTES.AUTH.LOGIN}>
              <CustomButton
                variant="outline"
                className="h-[36px] px-4 text-xs font-semibold rounded-[12px] gap-1.5 hover:border-primary/50 transition-all cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-primary" />
                Sign In
              </CustomButton>
            </Link>

            <Link href={ROUTES.AUTH.LOGIN}>
              <CustomButton
                variant="default"
                className="h-[36px] px-4 text-xs font-semibold rounded-[12px] gap-1.5 shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                Register Business
                <ArrowRight className="w-3.5 h-3.5" />
              </CustomButton>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <CustomButton
            variant="ghost"
            size="icon"
            className="md:hidden w-9 h-9 rounded-[10px]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 text-foreground" />
            )}
          </CustomButton>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/80 bg-background/95 backdrop-blur-2xl px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                setMobileOpen(false);
                handleNavClick(e, link.href);
              }}
              className="block px-4 py-2.5 rounded-[12px] text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-border/60 grid grid-cols-2 gap-2 mt-2">
            <Link href={ROUTES.AUTH.LOGIN} onClick={() => setMobileOpen(false)}>
              <CustomButton variant="outline" className="w-full h-[36px] text-xs font-semibold rounded-[12px]">
                Sign In
              </CustomButton>
            </Link>
            <Link href={ROUTES.AUTH.LOGIN} onClick={() => setMobileOpen(false)}>
              <CustomButton variant="default" className="w-full h-[36px] text-xs font-semibold rounded-[12px]">
                Register
              </CustomButton>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

