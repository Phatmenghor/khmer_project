"use client";

import { LogOut, Menu, Bell, ChevronRight } from "lucide-react";
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
import { clearToken } from "@/utils/local-storage/token";
import { clearUserInfo } from "@/utils/local-storage/userInfo";
import { ROUTES } from "@/constants/app-routes/routes";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { CustomAvatar } from "@/components/shared/avator/custom-avator";

interface TopBarProps {
  onMenuClick?: () => void;
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

export function TopBar({ onMenuClick }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const { profile, fullName, profileImage } = useAuthState();

  const breadcrumbs = getBreadcrumbs(pathname);

  const handleLogout = () => {
    clearToken();
    clearUserInfo();
    setShowLogoutAlert(false);
    setTimeout(() => {
      router.replace(ROUTES.AUTH.LOGIN);
    }, 100);
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 sm:h-16 items-center gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-5 shadow-sm">
        {/* Left: menu toggle + breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="shrink-0 h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors sm:flex"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumb — hidden on very small screens */}
          <nav className="hidden sm:flex items-center gap-1 text-sm min-w-0">
            {breadcrumbs.map((crumb, i) => (
              <div key={crumb.href} className="flex items-center gap-1 min-w-0">
                {i > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
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
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Notification bell */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>

          {/* User avatar + name (desktop) */}
          {profile && (
            <div
              className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-border/50 ml-1 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push(ROUTES.ADMIN.PROFILE)}
            >
              <CustomAvatar
                imageUrl={profileImage || profile?.profileImageUrl}
                name={fullName || profile?.fullName || "Admin"}
                size="sm"
                enableImagePreview={false}
              />
              <div className="flex flex-col leading-none">
                <span className="text-sm font-semibold text-foreground leading-snug max-w-[120px] truncate">
                  {fullName || profile?.fullName || "Admin"}
                </span>
                <span className="text-xs text-muted-foreground leading-snug max-w-[120px] truncate">
                  {profile?.email || ""}
                </span>
              </div>
            </div>
          )}

          {/* Logout button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLogoutAlert(true)}
            className="h-9 flex items-center gap-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors rounded-xl border-border/60 text-muted-foreground ml-1"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-medium">Logout</span>
          </Button>
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
              onClick={handleLogout}
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
