"use client";

import { memo } from "react";
import { LogOut, Menu, ShoppingBag } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { cn } from "@/lib/utils";
import { ImageUrls } from "@/features/auth/store/models/request/users-request";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { SmartImage } from "@/components/shared/image/smart-image";

interface NavLink {
  name: string;
  href: string;
}

interface NavbarMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessName: string;
  businessLogoUrl: string;
  navigationLinks: NavLink[];
  pathname: string;
  isAuthenticated: boolean;
  fullName: string | null;
  email: string | null;
  profileImage?: ImageUrls;
  profile?: {
    profileImage?: ImageUrls;
    fullName?: string;
    email?: string;
  } | null;
  onNavigateHome: () => void;
  onNavigate: (href: string) => void;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
}

function NavbarMenuComponent({
  open,
  onOpenChange,
  businessName,
  businessLogoUrl,
  navigationLinks,
  pathname,
  isAuthenticated,
  fullName,
  email,
  profileImage,
  profile,
  onNavigateHome,
  onNavigate,
  onLogin,
  onRegister,
  onLogout,
}: NavbarMenuProps) {
  return (
    <>
      <CustomButton
        variant="ghost"
        size="icon"
        className="lg:hidden h-7 w-7 shrink-0 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={() => onOpenChange(!open)}
        title="Menu"
      >
        <Menu className="h-3 w-3" />
      </CustomButton>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-4/5 sm:w-64 p-0 flex flex-col">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

          {/* Header */}
          <div className="border-b border-border/60 px-4 py-3 mt-0 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-start gap-2">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg overflow-hidden">
                  <SmartImage
                    src={businessLogoUrl}
                    fallbackSrc={appImages.scanmekhLogo}
                    alt={businessName}
                    fill
                    rounded="md"
                    showSkeleton={false}
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <h2 className="text-foreground font-bold text-xs leading-tight line-clamp-1">
                  {businessName}
                </h2>
                <p className="text-muted-foreground text-xs font-medium">
                  Shop Online
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col h-full overflow-y-auto">
            {/* Navigation */}
            <nav className="flex flex-col py-1">
              {navigationLinks.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href === "/products" &&
                    pathname.startsWith("/products"));

                if (link.name === "Home") {
                  return (
                    <CustomButton variant="unstyled" size="unstyled"
                      key={link.name}
                      onClick={() => {
                        onNavigateHome();
                        onOpenChange(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 mx-1 rounded text-xs font-medium transition-all duration-200 flex items-center gap-2",
                        active
                          ? "text-primary bg-primary/10 shadow-sm"
                          : "text-foreground hover:bg-muted/50 active:bg-muted/70"
                      )}
                    >
                      <span className="flex-1">{link.name}</span>
                      {active && (
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                      )}
                    </CustomButton>
                  );
                }

                return (
                  <CustomButton variant="unstyled" size="unstyled"
                    key={link.name}
                    onClick={() => {
                      onNavigate(link.href);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 mx-1 rounded text-xs font-medium transition-all duration-200 flex items-center gap-2",
                      active
                        ? "text-primary bg-primary/10 shadow-sm"
                        : "text-foreground hover:bg-muted/50 active:bg-muted/70"
                    )}
                  >
                    <span className="flex-1">{link.name}</span>
                    {active && (
                      <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    )}
                  </CustomButton>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="my-1 mx-3 border-t border-border/40" />

            {/* Footer */}
            {isAuthenticated ? (
              <div className="px-3 py-3 mt-auto border-t border-border/40 bg-gradient-to-t from-muted/30 to-transparent">
                <div className="flex items-center gap-2 mb-3 p-1 rounded bg-background/50">
                  <CustomAvatar
                    imageUrl={profileImage?.sm ?? profile?.profileImage?.sm}
                    name={fullName || profile?.fullName || "User"}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold line-clamp-1">
                      {fullName || profile?.fullName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {email || profile?.email || ""}
                    </p>
                  </div>
                </div>
                <CustomButton
                  variant="outline"
                  size="sm"
                  className="w-full mb-1 transition-all duration-200"
                  onClick={() => {
                    onNavigate("/orders");
                    onOpenChange(false);
                  }}
                >
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  My Orders
                </CustomButton>
                <CustomButton
                  variant="outline"
                  size="sm"
                  className="w-full transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  onClick={() => {
                    onLogout();
                    onOpenChange(false);
                  }}
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Logout
                </CustomButton>
              </div>
            ) : (
              <div className="px-3 py-3 mt-auto border-t border-border/40 bg-gradient-to-t from-muted/30 to-transparent flex gap-1">
                <CustomButton
                  variant="outline"
                  size="sm"
                  className="flex-1 transition-all duration-200"
                  onClick={() => {
                    onLogin();
                    onOpenChange(false);
                  }}
                >
                  Login
                </CustomButton>
                <CustomButton
                  size="sm"
                  className="flex-1 transition-all duration-200"
                  onClick={() => {
                    onRegister();
                    onOpenChange(false);
                  }}
                >
                  Register
                </CustomButton>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export const NavbarMenu = memo(NavbarMenuComponent);
