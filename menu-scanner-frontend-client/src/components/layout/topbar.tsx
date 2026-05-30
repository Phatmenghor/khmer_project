"use client";

import {
  LogOut,
  Menu,
  ChevronRight,
  UserCircle,
  Maximize2,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FormHeader } from "@/components/shared/form-field/form-header";
import { FormBody } from "@/components/shared/form-field/form-body";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ROUTES } from "@/constants/app-routes/routes";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { useLogout } from "@/hooks/use-logout";
import { CustomAvatar } from "@/components/shared/avatar/custom-avatar";
import { CustomDropdownMenu } from "@/components/shared/common/custom-dropdown-menu";

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
        {}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="shrink-0 h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {}
          <nav className="hidden md:flex items-center gap-2 text-sm min-w-0">
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
                  onClick={() =>
                    i < breadcrumbs.length - 1 && router.push(crumb.href)
                  }
                >
                  {crumb.label}
                </span>
              </div>
            ))}
          </nav>

          {}
          <span className="md:hidden font-semibold text-sm text-foreground truncate">
            {breadcrumbs[breadcrumbs.length - 1]?.label ?? "Dashboard"}
          </span>
        </div>

        {}
        <div className="flex items-center gap-2 shrink-0">
          {}
          {onFullscreenClick && pathname.includes("/admin/pos") && (
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

          {}
          {profile && (
            <CustomDropdownMenu
              trigger={
                <div className="h-9 w-9 flex items-center justify-center rounded-full hover:ring-2 hover:ring-primary/20 transition-all">
                  <CustomAvatar
                    imageUrl={profileImage || profile?.profileImageUrl}
                    name={fullName || profile?.fullName || "Admin"}
                    size="sm"
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
                    {
                      label: "My Plan",
                      icon: <CreditCard className="h-4 w-4" />,
                      onClick: () => router.push("/admin/plan"),
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

      <Dialog open={showLogoutAlert} onOpenChange={setShowLogoutAlert}>
        <DialogContent className="w-full sm:max-w-lg max-h-[92dvh] p-0 gap-0 flex flex-col">
          <FormHeader
            title="Sign Out"
            description="End your current session"
            isCreate={false}
          />

          <FormBody className="flex-1">
            <div className="space-y-6">
              <div className="p-5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                <p className="text-base text-red-900 dark:text-red-100 font-medium leading-relaxed">
                  Are you sure you want to sign out of your account? You'll need to sign in again to access your dashboard and saved data.
                </p>
              </div>

              <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                  <span className="font-semibold">⚠️ Important:</span> This action will end your current session and you'll be redirected to the login page. Make sure you've saved any ongoing work before proceeding.
                </p>
              </div>
            </div>
          </FormBody>

          <div className="flex justify-between items-center p-6 border-t bg-muted/30 flex-shrink-0">
            <div></div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowLogoutAlert(false)}
                className="rounded-lg"
              >
                Stay Signed In
              </Button>
              <Button
                onClick={confirmLogout}
                className="rounded-lg bg-red-600 hover:bg-red-700 focus:ring-red-600 gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
