"use client";

import { Menu, ChevronRight, LogIn } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomProfileDropdown } from "@/components/shared/common/custom-profile-dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, usePathname } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import { useIsMobile } from "@/redux/store/use-mobile";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";

interface TopBarProps {
  onMenuClick?: () => void;
}

function getBreadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let path = "";
  for (const part of parts) {
    path += `/${part}`;
    const label = part
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: path });
  }
  return crumbs;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { profile, isProfileLoading } = useAuthState();

  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-4 shadow-2xs transition-all duration-200">
      {/* Left: Mobile menu + Breadcrumbs */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {isMobile && (
          <CustomButton
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="shrink-0 h-7 w-7 rounded hover:bg-primary/10 hover:text-primary transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-4 w-4" />
          </CustomButton>
        )}

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm min-w-0 truncate">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.href} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
              )}
              <span
                className={
                  i === breadcrumbs.length - 1
                    ? "font-semibold text-foreground truncate"
                    : "text-muted-foreground truncate hover:text-foreground cursor-pointer transition-colors"
                }
                onClick={() =>
                  i < breadcrumbs.length - 1 && router.push(crumb.href)
                }
              >
                {crumb.label}
              </span>
            </div>
          ))}
        </nav>

        <span className="sm:hidden font-semibold text-xs text-foreground truncate">
          {breadcrumbs[breadcrumbs.length - 1]?.label ?? "Dashboard"}
        </span>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {!profile && isProfileLoading && (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="hidden sm:flex flex-col gap-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-2.5 w-10" />
            </div>
          </div>
        )}

        {!profile && !isProfileLoading && (
          <CustomButton
            variant="outline"
            size="sm"
            onClick={() => router.push(ROUTES.AUTH.LOGIN)}
            className="h-8 rounded gap-1.5 text-sm border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign In</span>
          </CustomButton>
        )}

        {profile && <CustomProfileDropdown />}
      </div>
    </header>
  );
}
