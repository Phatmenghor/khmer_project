"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X, ArrowRight, User, LogOut } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomProfileDropdown } from "@/components/shared/common/custom-profile-dropdown";
import { NavLinkButton } from "@/components/landing/nav-link-button";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { useLogout } from "@/hooks/use-logout";
import { SignoutModal } from "@/components/shared/modal/signout-modal";
import { showToast } from "@/components/shared/common/show-toast";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/app-routes/routes";
import { appImages } from "@/constants/app-resource/icons/app-images";

interface NavbarProps {
  onRegisterClick?: () => void;
}

export default function Navbar({ onRegisterClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const router = useRouter();
  const { isAuthenticated, profile } = useAuthState();
  const { logout: handleLogout } = useLogout();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("accessToken") || localStorage.getItem("adminAccessToken")
      : null;
    setIsLoggedIn(Boolean(token || isAuthenticated || profile));
  }, [isAuthenticated, profile]);

  const navLinks = [
    { label: "Pricing", href: "#pricing" },
    { label: "Capabilities", href: "#capabilities" },
    { label: "Founder", href: "#founder" },
    { label: "FAQ", href: "#faq" },
  ];

  const handleRegisterBusinessClick = () => {
    if (onRegisterClick) {
      onRegisterClick();
      return;
    }

    if (isLoggedIn) {
      router.push(ROUTES.DASHBOARD.BUSINESS_OWNER);
    } else {
      router.push(ROUTES.AUTH.LOGIN);
    }
  };

  const confirmMobileLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutModal(false);
    await handleLogout();
    setIsLoggingOut(false);
    setIsLoggedIn(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-xl bg-background/85 border-b border-border/80",
        scrolled ? "shadow-md bg-background/95" : ""
      )}
    >
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
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

          {/* Desktop Navigation Links via NavLinkButton Component */}
          <nav className="hidden md:flex items-center gap-1.5 bg-muted/40 p-1.5 rounded-full border border-border/60 shadow-2xs">
            {navLinks.map((link) => (
              <NavLinkButton key={link.label} href={link.href} variant="pill">
                {link.label}
              </NavLinkButton>
            ))}
          </nav>

          {/* Desktop Right Action Area: Profile Dropdown or Register Business Button */}
          <div className="hidden md:flex items-center">
            {isLoggedIn ? (
              <CustomProfileDropdown />
            ) : (
              <CustomButton
                variant="default"
                onClick={handleRegisterBusinessClick}
                className="h-[36px] px-4 text-xs font-semibold rounded-[12px] gap-1.5 shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                Register Business
                <ArrowRight className="w-3.5 h-3.5" />
              </CustomButton>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-2">
            {isLoggedIn && <CustomProfileDropdown className="scale-90" />}
            <CustomButton
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-[10px]"
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
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/80 bg-background/95 backdrop-blur-2xl px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <NavLinkButton
              key={link.label}
              href={link.href}
              variant="drawer"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLinkButton>
          ))}

          <div className="pt-3 border-t border-border/60 mt-2 space-y-2">
            {isLoggedIn ? (
              <>
                <CustomButton
                  variant="outline"
                  onClick={() => {
                    setMobileOpen(false);
                    showToast.info("Account is active. Business profile portal opens upon eMenu Client deployment.");
                  }}
                  className="w-full h-[36px] text-xs font-semibold rounded-[12px] gap-1.5 justify-start px-4"
                >
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  My Business Profile
                </CustomButton>
                <CustomButton
                  variant="destructive"
                  onClick={() => {
                    setMobileOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full h-[36px] text-xs font-semibold rounded-[12px] gap-1.5 justify-start px-4"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </CustomButton>
              </>
            ) : (
              <CustomButton
                variant="default"
                onClick={() => {
                  setMobileOpen(false);
                  handleRegisterBusinessClick();
                }}
                className="w-full h-[36px] text-xs font-semibold rounded-[12px] gap-1.5"
              >
                Register Business
                <ArrowRight className="w-3.5 h-3.5" />
              </CustomButton>
            )}
          </div>
        </div>
      )}

      {/* Mobile Logout Confirmation Modal */}
      <SignoutModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        onConfirm={confirmMobileLogout}
        isLoading={isLoggingOut}
      />
    </header>
  );
}
