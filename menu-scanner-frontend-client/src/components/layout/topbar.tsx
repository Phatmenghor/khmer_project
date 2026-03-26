"use client";

import { LogOut, Menu, ChevronRight, UserCircle, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { useLogout } from "@/redux/store/use-logout";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";
import { CustomDropdownMenu } from "@/components/shared/common/custom-dropdown-menu";

interface TopBarProps {
  onMenuClick?: () => void;
  onFullscreenClick?: () => void;
}

// Convert pathname to breadcrumb segments
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
  const { profile, fullName, profileImage } = useAuthState();
  const { logout: handleLogout } = useLogout();

  const breadcrumbs = getBreadcrumbs(pathname);

  const confirmLogout = async () => {
    setShowLogoutAlert(false);
    await handleLogout();
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-5 shadow-md">
        {/* Left: menu toggle + breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="shrink-0 h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors sm:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumb — hidden on very small screens */}
          <nav className="hidden sm:flex items-center gap-2 text-sm min-w-0">
            {breadcrumbs.map((crumb, i) => (
              <div key={crumb.href} className="flex items-center gap-1 min-w-0">
                {i > 0 && (
                  <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                )}
                <span
                  className={
                    i === breadcrumbs.length - 1
                      ? "font-semibold text-foreground truncate"
                      : "text-muted-foreground truncate hover:text-foreground cursor-pointer transition-colors"
                  }
                  onClick={() => i < breadcrumbs.length - 1 && router.push(crumb.href)}
                >
                  {crumb.label}
                </span>
              </div>
            ))}
          </nav>

          {/* Page title mobile */}
          <span className="sm:hidden font-semibold text-sm text-foreground truncate">
            {breadcrumbs[breadcrumbs.length - 1]?.label ?? "Dashboard"}
          </span>
        </div>

        {/* Right: actions + user */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Fullscreen toggle */}
          {onFullscreenClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onFullscreenClick}
              title="Fullscreen (F11)"
              className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}

          {/* Profile Dropdown Menu */}
          {profile && (
            <CustomDropdownMenu
              trigger={
                <div className="h-9 w-9 flex items-center justify-center rounded-full hover:ring-2 hover:ring-primary/20 transition-all">
                  <CustomAvatar
                    imageUrl={profileImage || profile?.profileImageUrl}
                    name={fullName || profile?.fullName || "Admin"}
                    size="sm"
                    enableImagePreview={false}
                  />
                </div>
              }
              header={
                <div className="flex items-center gap-3">
                  <CustomAvatar
                    imageUrl={profileImage || profile?.profileImageUrl}
                    name={fullName || profile?.fullName || "Admin"}
                    size="lg"
                  />
                  <div className="flex flex-col space-y-0.5 flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-1">
                      {fullName || profile?.fullName || "Admin"}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {profile?.email || ""}
                    </p>
                  </div>
                </div>
              }
              sections={[
                {
                  items: [
                    {
                      label: "My Profile",
                      icon: <UserCircle className="h-4 w-4" />,
                      onClick: () => router.push(ROUTES.ADMIN.PROFILE),
                    },
                  ],
                },
                {
                  items: [
                    {
                      label: "Logout",
                      icon: <LogOut className="h-4 w-4" />,
                      onClick: () => setShowLogoutAlert(true),
                      variant: "destructive" as const,
                    },
                  ],
                },
              ]}
              align="right"
              openOnHover={false}
              hoverDelay={200}
            />
          )}
        </div>
      </header>

      <AlertDialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <AlertDialogContent className="w-full sm:max-w-md rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/20">
                <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-left text-lg font-bold">
                  Sign Out
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-left text-sm text-muted-foreground mt-2 leading-relaxed">
              Are you sure you want to sign out of your account? You'll need to
              sign in again to access your dashboard and saved data.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <AlertDialogCancel className="rounded-xl mt-0 w-full sm:w-auto">
              Stay Signed In
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmLogout}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-600 rounded-xl gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
