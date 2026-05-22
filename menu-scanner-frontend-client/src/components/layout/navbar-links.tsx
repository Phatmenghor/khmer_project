"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavLink {
  name: string;
  href: string;
}

interface NavbarLinksProps {
  navigationLinks: NavLink[];
  pathname: string;
  onNavigateHome: () => void;
  onNavigate: (href: string) => void;
}

function NavbarLinksComponent({
  navigationLinks,
  pathname,
  onNavigateHome,
  onNavigate,
}: NavbarLinksProps) {
  return (
    <div className="hidden lg:flex items-center gap-1">
      {navigationLinks.map((link) => {
        const active =
          pathname === link.href ||
          (link.href === "/products" && pathname.startsWith("/products"));

        if (link.name === "Home") {
          return (
            <Button
              key={link.name}
              variant="ghost"
              className={cn(
                "text-foreground hover:text-primary hover:bg-primary/10 relative",
                active &&
                  "text-primary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3/4 after:h-0.5 after:bg-primary after:rounded-full"
              )}
              onClick={onNavigateHome}
            >
              {link.name}
            </Button>
          );
        }

        return (
          <Button
            key={link.name}
            variant="ghost"
            className={cn(
              "text-foreground hover:text-primary hover:bg-primary/10 relative",
              active &&
                "text-primary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3/4 after:h-0.5 after:bg-primary after:rounded-full"
            )}
            onClick={() => onNavigate(link.href)}
          >
            {link.name}
          </Button>
        );
      })}
    </div>
  );
}

export const NavbarLinks = memo(NavbarLinksComponent);
