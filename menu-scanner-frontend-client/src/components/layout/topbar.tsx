"use client";

import {
  LogOut,
  Menu,
  ChevronRight,
  Maximize2,
  ChevronDown,
  LogIn,
  User,
  KeyRound,
  CreditCard,
} from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ROUTES, getBreadcrumbs } from "@/constants/app-routes/routes";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { useLogout } from "@/hooks/use-logout";
import { SignoutModal } from "@/components/shared/common/signout-modal";

interface TopBarProps {
  onMenuClick?: () => void;
  onFullscreenClick?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TopBar({ onMenuClick, onFullscreenClick }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, profile, fullName, profileImage, roles, isProfileLoading } = useAuthState();
  const { logout: handleLogout } = useLogout();

  const breadcrumbs = getBreadcrumbs(pathname);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutAlert(false);
    await handleLogout();
    setIsLoggingOut(false);
  };

  const displayName = fullName || profile?.fullName || "Admin";
  const displayEmail = profile?.email || "";
  const profileImageUrl = profileImage?.sm ?? profile?.profileImage?.sm ?? "";
  const initials = getInitials(displayName);
  const primaryRole = roles?.[0];

  return (
    <>
      <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 shadow-sm">
        {/* Left: Mobile menu + Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <CustomButton
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="shrink-0 h-7 w-7 rounded hover:bg-primary/10 hover:text-primary transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-4 w-4" />
          </CustomButton>

          <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0">
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

          <span className="md:hidden font-semibold text-sm text-foreground truncate">
            {breadcrumbs[breadcrumbs.length - 1]?.label ?? "Dashboard"}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onFullscreenClick && pathname.includes("/admin/pos") && (
            <CustomButton
              variant="ghost"
              size="icon"
              onClick={onFullscreenClick}
              title="Fullscreen (F11)"
              className="h-7 w-7 rounded hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Maximize2 className="h-4 w-4" />
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

          {/* Profile dropdown */}
          {profile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <CustomButton variant="unstyled" size="unstyled" className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-accent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="flex flex-col items-start leading-none text-left">
                    <span className="text-sm font-semibold truncate max-w-[120px]">
                      {displayName}
                    </span>
                    {primaryRole && (
                      <span className="text-[10px] text-muted-foreground/80 capitalize mt-0.5">
                        {primaryRole.toLowerCase().replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </CustomButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold truncate">{displayName}</span>
                    <span className="text-sm text-muted-foreground truncate">
                      {displayEmail}
                    </span>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href={ROUTES.ADMIN.PROFILE} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href={`${ROUTES.ADMIN.PROFILE}?tab=security`}
                    className="cursor-pointer"
                  >
                    <KeyRound className="h-4 w-4 mr-2" />
                    Change Password
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/admin/plan" className="cursor-pointer">
                    <CreditCard className="h-4 w-4 mr-2" />
                    My Plan
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  onSelect={() => setShowLogoutAlert(true)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <SignoutModal
        open={showLogoutAlert}
        onOpenChange={setShowLogoutAlert}
        onConfirm={confirmLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}
