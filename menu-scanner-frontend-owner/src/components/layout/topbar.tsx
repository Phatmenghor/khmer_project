"use client";

import {
  Menu,
  ChevronRight,
  Maximize2,
  Minimize2,
  LogIn,
} from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { CustomProfileDropdown } from "@/components/shared/common/custom-profile-dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter, usePathname } from "next/navigation";
import { SmartImage } from "@/components/shared/image/smart-image";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { useAppSelector } from "@/store";
import { selectBusinessName, selectBusinessLogo } from "@/features/business/store/selectors/business-settings-selector";
import { ROUTES, getBreadcrumbs } from "@/constants/app-routes/routes";
import { useAuthState } from "@/features/auth/store/state/auth-state";

interface TopBarProps {
  onMenuClick?: () => void;
  onFullscreenClick?: () => void;
  isFullscreen?: boolean;
}

export function TopBar({ onMenuClick, onFullscreenClick, isFullscreen }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, isProfileLoading } = useAuthState();

  const breadcrumbs = getBreadcrumbs(pathname);

  const reduxBusinessName = useAppSelector(selectBusinessName);
  const reduxBusinessLogo = useAppSelector(selectBusinessLogo) as any;

  const businessName = reduxBusinessName || "My Store";
  const businessLogoUrl = typeof reduxBusinessLogo === "string"
    ? reduxBusinessLogo
    : (reduxBusinessLogo?.md || reduxBusinessLogo?.sm || reduxBusinessLogo?.o || "");

  return (
    <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 shadow-sm">
      {/* Left: Mobile menu + Business Logo & Name + Breadcrumbs */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <CustomButton
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="shrink-0 h-7 w-7 rounded hover:bg-primary/10 hover:text-primary transition-colors md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-4 w-4" />
        </CustomButton>

        {/* Business Logo & Name (matching sidebar icon & styling) - Shown ONLY in fullscreen mode */}
        {isFullscreen && (
          <>
            <div className="flex items-center gap-2 min-w-0 shrink-0">
              <div className="relative h-7 w-7 flex items-center justify-center shrink-0 overflow-hidden rounded-md">
                <SmartImage
                  src={businessLogoUrl}
                  fallbackSrc={appImages.scanmekhLogo}
                  alt={businessName}
                  fill
                  rounded="md"
                  showSkeleton={false}
                  className="object-contain rounded-md"
                />
              </div>
              <span className="font-black text-xs sm:text-sm text-foreground truncate tracking-tight">
                {businessName}
              </span>
            </div>

            <span className="text-muted-foreground/40 font-light select-none text-xs hidden sm:inline">|</span>
          </>
        )}

        {/* Breadcrumbs */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm min-w-0 truncate">
          {breadcrumbs.map((crumb, i) => (
            <div key={i} className="flex items-center gap-1.5 min-w-0">
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
                  crumb.href && i < breadcrumbs.length - 1 && router.push(crumb.href)
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

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onFullscreenClick && (pathname.includes("/admin/pos") || pathname.includes("/pos")) && (
          <CustomButton
            variant="ghost"
            size="icon"
            onClick={onFullscreenClick}
            title={isFullscreen ? "Exit Fullscreen (F11)" : "Fullscreen (F11)"}
            className="h-7 w-7 rounded hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4 text-primary" /> : <Maximize2 className="h-4 w-4" />}
          </CustomButton>
        )}

        {/* Profile is being fetched — show a skeleton instead of nothing */}
        {!profile && isProfileLoading && (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="hidden sm:flex flex-col gap-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-2.5 w-10" />
            </div>
          </div>
        )}

        {/* No auth / session error — redirect to login */}
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

        {/* Modular Custom Profile Dropdown */}
        {profile && <CustomProfileDropdown />}
      </div>
    </header>
  );
}
