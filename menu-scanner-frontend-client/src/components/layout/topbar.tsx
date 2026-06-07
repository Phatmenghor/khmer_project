"use client";

import {
  LogOut,
  Menu,
  ChevronRight,
  UserCircle,
  Maximize2,
  CreditCard,
  ChevronDown,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { useLogout } from "@/hooks/use-logout";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { CustomDropdownMenu } from "@/components/shared/common/custom-dropdown-menu";
import { SignoutModal } from "@/components/shared/common/signout-modal";

interface TopBarProps {
  onMenuClick?: () => void;
  onFullscreenClick?: () => void;
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

export function TopBar({ onMenuClick, onFullscreenClick }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { profile, fullName, profileImage } = useAuthState();
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
  const avatarImage = profileImage?.sm ?? profile?.profileImage?.sm;

  return (
    <>
      <header className="sticky top-0 z-20 flex h-11 items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 shadow-sm">
        {/* Left: Mobile menu + Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="shrink-0 h-6 w-6 rounded hover:bg-primary/10 hover:text-primary transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-3 w-3" />
          </Button>

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

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {onFullscreenClick && pathname.includes("/admin/pos") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onFullscreenClick}
              title="Fullscreen (F11)"
              className="h-6 w-6 rounded hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}

          {/* No auth / session error — redirect to login */}
          {!profile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(ROUTES.AUTH.LOGIN)}
              className="h-7 rounded gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
            >
              <LogIn className="h-3 w-3" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          )}

          {/* Profile dropdown — only shown when authenticated */}
          {profile && (
            <CustomDropdownMenu
              trigger={
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-muted/40 hover:bg-muted hover:border-primary/30 transition-all duration-150 cursor-pointer group">
                  <CustomAvatar
                    imageUrl={avatarImage}
                    name={displayName}
                    size="sm"
                  />
                  <div className="hidden sm:flex flex-col min-w-0">
                    <span className="text-[11px] font-semibold leading-tight text-foreground truncate max-w-[96px]">
                      {displayName}
                    </span>
                    {displayEmail && (
                      <span className="text-[9px] text-muted-foreground leading-tight truncate max-w-[96px]">
                        {displayEmail}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </div>
              }
              header={
                <div className="flex items-center gap-2">
                  <CustomAvatar
                    imageUrl={avatarImage}
                    name={displayName}
                    size="lg"
                  />
                  <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
                    <p className="text-xs font-semibold line-clamp-1">
                      {displayName}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {displayEmail}
                    </p>
                  </div>
                </div>
              }
              sections={[
                {
                  items: [
                    {
                      label: "My Profile",
                      icon: <UserCircle className="h-3 w-3" />,
                      onClick: () => router.push(ROUTES.ADMIN.PROFILE),
                    },
                    {
                      label: "My Plan",
                      icon: <CreditCard className="h-3 w-3" />,
                      onClick: () => router.push("/admin/plan"),
                    },
                  ],
                },
                {
                  items: [
                    {
                      label: "Sign Out",
                      icon: <LogOut className="h-3 w-3" />,
                      onClick: () => setShowLogoutAlert(true),
                      variant: "destructive" as const,
                    },
                  ],
                },
              ]}
              align="right"
              openOnHover={false}
            />
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
