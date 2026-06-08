"use client";

import { LogOut, Menu, ChevronDown, User, KeyRound, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { clearAllTokens } from "@/utils/local-storage/token";
import { clearUserInfo } from "@/utils/local-storage/userInfo";
import { ROUTES } from "@/constants/app-routes/routes";
import { useIsMobile } from "@/redux/store/use-mobile";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";

interface TopBarProps {
  onMenuClick?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const { profile, fullName, profileImage } = useAuthState();

  const displayName = fullName || profile?.fullName || "Admin";
  const displayEmail = profile?.email || "";
  const profileImageUrl = profile?.profileImage?.sm || profile?.profileImageUrl || profileImage || "";
  const initials = getInitials(displayName);

  const breadcrumbs = getBreadcrumbs(pathname);

  const handleLogout = () => {
    clearAllTokens();
    clearUserInfo();
    setShowLogoutAlert(false);
    setTimeout(() => {
      router.replace(ROUTES.AUTH.LOGIN);
    }, 100);
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-11 items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-4 shadow-sm">
        {/* Left: Mobile menu + Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="shrink-0 h-6 w-6 rounded hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Menu className="h-3 w-3" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}

          <nav className="hidden md:flex items-center gap-1 text-xs min-w-0">
            {breadcrumbs.map((crumb, i) => (
              <div key={crumb.href} className="flex items-center gap-1 min-w-0">
                {i > 0 && (
                  <ChevronRight className="h-2 w-2 text-muted-foreground/50 shrink-0" />
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

          <span className="md:hidden font-semibold text-xs text-foreground truncate">
            {breadcrumbs[breadcrumbs.length - 1]?.label ?? "Dashboard"}
          </span>
        </div>

        {/* Right: Profile dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-accent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-7 w-7 border border-border shadow-sm">
                  <AvatarImage src={profileImageUrl} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-xs font-medium truncate max-w-[120px]">
                    {displayName}
                  </span>
                  {displayEmail && (
                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                      {displayEmail}
                    </span>
                  )}
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold truncate">{displayName}</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {displayEmail}
                  </span>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href={ROUTES.DASHBOARD.PROFILE} className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href={`${ROUTES.DASHBOARD.PROFILE}?tab=security`}
                  className="cursor-pointer"
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  Change Password
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
        </div>
      </header>

      <Dialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <DialogContent className="w-full sm:max-w-sm p-0 gap-0 flex flex-col">
          <FormHeader
            title="Sign Out"
            description="End your current session"
            icon={LogOut}
            variant="destructive"
          />

          <FormBody>
            <p className="text-xs text-foreground leading-relaxed">
              Are you sure you want to sign out? You'll need to sign in again
              to access your dashboard.
            </p>
            <div className="px-2.5 py-2 bg-muted/60 rounded border border-border">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                Tip
              </p>
              <p className="text-xs text-foreground mt-0.5">
                Save any ongoing work before continuing.
              </p>
            </div>
          </FormBody>

          <div className="flex flex-col gap-1.5 px-2.5 py-2 border-t bg-muted/30 flex-shrink-0 sm:flex-row sm:items-center sm:justify-end sm:px-3">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLogoutAlert(false)}
              >
                Stay Signed In
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleLogout}
                className="gap-1"
              >
                <LogOut className="h-3 w-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
