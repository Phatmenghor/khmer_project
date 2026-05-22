"use client";

import { memo } from "react";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { cn } from "@/lib/utils";

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
  profileImage: string | null;
  profile?: {
    profileImageUrl?: string;
    fullName?: string;
    email?: string;
  };
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
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-10 w-10 shrink-0 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={() => onOpenChange(!open)}
        title="Menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-4/5 sm:w-96 p-0 flex flex-col">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

          {/* Header */}
          <div className="border-b border-border/60 px-6 py-4 mt-0 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-start gap-3">
              {businessLogoUrl && (
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg overflow-hidden">
                    <img
                      src={businessLogoUrl}
                      alt={businessName}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/assets/image/no-image.png";
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex-1 min-w-0 pt-1">
                <h2 className="text-foreground font-bold text-sm leading-tight line-clamp-1">
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
            <nav className="flex flex-col py-2">
              {navigationLinks.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href === "/products" &&
                    pathname.startsWith("/products"));

                if (link.name === "Home") {
                  return (
                    <button
                      key={link.name}
                      onClick={() => {
                        onNavigateHome();
                        onOpenChange(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 mx-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3",
                        active
                          ? "text-primary bg-primary/10 shadow-sm"
                          : "text-foreground hover:bg-muted/50 active:bg-muted/70"
                      )}
                    >
                      <span className="flex-1">{link.name}</span>
                      {active && (
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={link.name}
                    onClick={() => {
                      onNavigate(link.href);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 mx-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3",
                      active
                        ? "text-primary bg-primary/10 shadow-sm"
                        : "text-foreground hover:bg-muted/50 active:bg-muted/70"
                    )}
                  >
                    <span className="flex-1">{link.name}</span>
                    {active && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Divider */}
            <div className="my-2 mx-4 border-t border-border/40" />

            {/* Footer */}
            {isAuthenticated ? (
              <div className="px-4 py-4 mt-auto border-t border-border/40 bg-gradient-to-t from-muted/30 to-transparent">
                <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-background/50">
                  <CustomAvatar
                    imageUrl={profileImage || profile?.profileImageUrl}
                    name={fullName || profile?.fullName || "User"}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-1">
                      {fullName || profile?.fullName || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {email || profile?.email || ""}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  onClick={() => {
                    onLogout();
                    onOpenChange(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="px-4 py-4 mt-auto border-t border-border/40 bg-gradient-to-t from-muted/30 to-transparent flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 transition-all duration-200"
                  onClick={() => {
                    onLogin();
                    onOpenChange(false);
                  }}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  className="flex-1 transition-all duration-200"
                  onClick={() => {
                    onRegister();
                    onOpenChange(false);
                  }}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export const NavbarMenu = memo(NavbarMenuComponent);
