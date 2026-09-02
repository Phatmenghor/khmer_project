"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, LogOut, User, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomButton } from "@/components/shared/button/custom-button";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ROUTES, SIDEBAR_MENU } from "@/constants/app-routes/routes";
import { SmartImage } from "@/components/shared/image/smart-image";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { useAppSelector } from "@/store";
import {
  selectBusinessSettings,
  selectBusinessName,
  selectBusinessLogo,
} from "@/features/business/store/selectors/business-settings-selector";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/use-logout";
import { SignoutModal } from "@/components/shared/modal/signout-modal";
import { getProfileImageUrl, getUserInitials } from "@/utils/user/user-helper";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const { logout: handleLogout } = useLogout();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutAlert(false);
    await handleLogout();
    setIsLoggingOut(false);
  };

  const { profile, isProfileLoading } = useAuthState();

  const displayName = profile?.fullName || `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "User";
  const displayEmail = profile?.email || "";
  const userIdentifier = (profile as any)?.userIdentifier || (profile as any)?.employeeId || "";
  const profileImageUrl = getProfileImageUrl(profile, "sm");

  const businessSettings = useAppSelector(selectBusinessSettings);
  const reduxBusinessName = useAppSelector(selectBusinessName);
  const reduxLogoUrl = useAppSelector(selectBusinessLogo);
  const businessName = reduxBusinessName;
  const logoUrl = reduxLogoUrl;


  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    SIDEBAR_MENU.forEach((item) => {
      if (item.title) initial[item.title] = true;
    });
    return initial;
  });
  const [collapsed, setCollapsed] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleCollapsed = () => {
    const willCollapse = !collapsed;
    setCollapsed(willCollapse);
    onToggle();
    if (!willCollapse) {
      const allOpen: Record<string, boolean> = {};
      SIDEBAR_MENU.forEach((item) => {
        if (item.title) allOpen[item.title] = true;
      });
      setOpenSections(allOpen);
    }
  };

  const renderNavItems = (isCollapsed = false) => (
    <nav className="flex flex-col gap-1">
      {SIDEBAR_MENU.map((route) => {
        const hasSubItems = route.items && route.items.length > 0;
        const isActive = route.href ? pathname === route.href : false;

        if (hasSubItems) {

          const filteredItems =
            route.title === "Master Data" && businessSettings?.useSubcategories === false
              ? route.items!.filter((item) => item.title !== "Subcategories")
              : route.items!;


          if (route.title === "Master Data" && filteredItems.length === 0) {
            return null;
          }

          const isOpen = route.title ? openSections[route.title] !== false : true;

          return (
            <div key={route.title} className="w-full">
              <CustomButton
                variant="ghost"
                className={cn(
                  "hover:bg-primary/10 hover:text-primary rounded-lg relative transition-all duration-200 px-2.5 py-1.5 h-9",
                  isCollapsed ? "w-8 h-8 mx-auto px-0 justify-center" : "w-full justify-between",
                )}
                onClick={() =>
                  route.title && !isCollapsed && toggleSection(route.title)
                }
                aria-expanded={isOpen}
                title={isCollapsed ? route.title : undefined}
              >
                <div
                  className={cn(
                    "flex items-center justify-between w-full min-w-0 gap-2",
                    isCollapsed && "justify-center",
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {route.icon && (
                      <route.icon className="w-4 h-4 shrink-0 transition-colors duration-200" />
                    )}
                    {!isCollapsed && (
                      <span className="truncate min-w-0 font-medium text-xs text-left transition-colors duration-200">
                        {route.title}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className="shrink-0 flex items-center justify-center ml-1">
                      {isOpen ? (
                        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200" />
                      )}
                    </div>
                  )}
                </div>
              </CustomButton>

              {!isCollapsed && isOpen && (
                <div className="relative ml-4 mt-1 space-y-1">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 z-0"></div>

                  {filteredItems.map((subItem) => {
                    const isSubItemActive = pathname === subItem.href;

                    return (
                      <div key={subItem.title} className="relative">
                        <div
                          className={cn(
                            "absolute left-0 top-1/2 w-3 h-px z-0 transition-colors duration-200",
                            isSubItemActive ? "bg-primary/40" : "bg-gray-300",
                          )}
                        ></div>

                        <div
                          className={cn(
                            "absolute left-0 top-1/2 w-1 h-1 rounded-full transform -translate-x-0.5 -translate-y-0.5 z-10 transition-colors duration-200",
                            isSubItemActive ? "bg-primary" : "bg-gray-400",
                          )}
                        ></div>

                        <div className="absolute left-3 top-1/2 w-1 h-px z-0 transition-colors duration-200 bg-gray-200"></div>

                        <CustomButton
                          variant="ghost"
                          asChild
                          className={cn(
                            "relative w-full justify-start hover:bg-primary/10 hover:text-primary pl-4 pr-2 py-1 h-8 rounded-md z-20 transition-all duration-200 text-xs",
                            isSubItemActive &&
                              "bg-primary/20 text-primary font-semibold border-l-2 border-primary shadow-xs",
                          )}
                        >
                          <Link
                            href={subItem.href}
                            className="flex items-center gap-2 w-full min-w-0"
                          >
                            <span className="truncate min-w-0">{subItem.title}</span>
                          </Link>
                        </CustomButton>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        return (
          <CustomButton
            key={route.title}
            variant="ghost"
            asChild
            className={cn(
              "hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-200 px-2.5 py-1.5 h-9",
              isCollapsed ? "w-8 h-8 mx-auto px-0 justify-center" : "w-full justify-start",
              isActive &&
                "bg-primary/20 text-primary font-semibold border-l-2 border-primary shadow-xs",
            )}
          >
            <Link
              href={route.href || "#"}
              className={cn(
                "flex items-center w-full min-w-0",
                isCollapsed ? "justify-center" : "gap-2.5",
              )}
              title={isCollapsed ? route.title : undefined}
            >
              {route.icon && <route.icon className="w-4 h-4 shrink-0" />}
              {!isCollapsed && <span className="truncate text-xs font-medium min-w-0">{route.title}</span>}
            </Link>
          </CustomButton>
        );
      })}
    </nav>
  );

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-md"
          onClick={onToggle}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border/50 bg-background/95 backdrop-blur-xl transition-all duration-300 ease-out shadow-xl",
          collapsed ? "w-14" : "w-60",
          isMobile && !isOpen && "hidden",
        )}
      >
        <div
          className={cn(
            "relative flex h-14 items-center border-b border-border/50 bg-gradient-to-br from-primary/5 via-background/50 to-primary/5",
            collapsed ? "justify-center px-2" : "justify-between px-3.5 gap-2",
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/10 opacity-50 blur-3xl pointer-events-none"></div>

          {!collapsed && (
            <Link
              href="/"
              className="relative flex items-center gap-2.5 min-w-0 flex-1 group transition-all duration-300 hover:scale-[1.01]"
            >
              <div className="relative w-9 h-9 shrink-0 rounded-lg overflow-hidden border border-border/40 shadow-3xs bg-card flex items-center justify-center">
                <SmartImage
                  src={logoUrl}
                  fallbackSrc={appImages.scanmekhLogo}
                  alt={businessName || "Logo"}
                  fill
                  objectFit="cover"
                  showSkeleton={false}
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-foreground font-bold text-xs leading-tight tracking-tight truncate">
                  {businessName || "My Business"}
                </span>
                <span className="text-muted-foreground text-[11px] font-medium tracking-wide truncate">
                  Dashboard
                </span>
              </div>
            </Link>
          )}

          <CustomButton
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="relative h-7 w-7 shrink-0 rounded-md transition-all duration-300 hover:bg-primary/15 hover:scale-105 ml-auto flex items-center justify-center border border-border/40 shadow-2xs group"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <div className="absolute inset-0 rounded bg-gradient-to-r from-primary/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ChevronLeft
              className={cn(
                "h-4 w-4 relative z-10 transition-transform duration-300 text-muted-foreground group-hover:text-foreground",
                collapsed && "rotate-180",
              )}
            />
          </CustomButton>
        </div>

        <ScrollArea className="flex-1 py-4">
          <div className={cn("space-y-1", collapsed ? "px-2" : "px-3")}>
            {renderNavItems(collapsed)}
          </div>
        </ScrollArea>

        {profile && (
          <div className="border-t border-border/50 p-2 sm:p-2.5">
            <Link
              href={ROUTES.ADMIN.PROFILE}
              className={cn(
                "flex items-center gap-2.5 w-full p-2 rounded-xl bg-card border border-border/60 shadow-2xs hover:bg-accent/60 hover:border-border transition-all duration-200 focus:outline-none group text-left cursor-pointer select-none",
                collapsed && "justify-center p-1.5 bg-transparent border-none shadow-none hover:bg-muted/50",
              )}
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-2xs">
                {profileImageUrl ? (
                  <SmartImage src={profileImageUrl} alt={displayName} fill className="object-cover" />
                ) : (
                  <span className="text-xs font-bold text-primary">
                    {getUserInitials(displayName)}
                  </span>
                )}
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0 flex-1 leading-tight">
                  <span className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {displayName}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {displayEmail || userIdentifier}
                  </span>
                </div>
              )}
            </Link>
          </div>
        )}
      </div>

      <SignoutModal
        open={showLogoutAlert}
        onOpenChange={setShowLogoutAlert}
        onConfirm={confirmLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}
