"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomButton } from "@/components/shared/button/custom-button";
import { useEffect, useRef, useState } from "react";
import { readBusinessCache } from "@/lib/business-cache";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ROUTES, SIDEBAR_MENU } from "@/constants/app-routes/routes";
import Image from "next/image";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { UserAvatarCard } from "../shared/avatar/user-avatar-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthState } from "@/features/auth/store/state/auth-state";
import { useAppSelector } from "@/store";
import {
  selectBusinessSettings,
  selectBusinessName,
  selectBusinessLogo,
} from "@/features/business/store/selectors/business-settings-selector";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const { profile, isProfileLoading, dispatch, accessToken, authReady } = useAuthState();


  const businessSettings = useAppSelector(selectBusinessSettings);
  const reduxBusinessName = useAppSelector(selectBusinessName);
  const reduxLogoUrl = useAppSelector(selectBusinessLogo);


  const [cachedBusinessName, setCachedBusinessName] = useState<string | undefined>();
  const [cachedLogoUrl, setCachedLogoUrl] = useState<string | undefined>();


  useEffect(() => {
    const cache = readBusinessCache();
    if (cache) {
      setCachedBusinessName(cache.businessName);
      setCachedLogoUrl(cache.logoBusinessUrl);
    }
  }, []);


  const businessName = reduxBusinessName || cachedBusinessName;
  const logoUrl = reduxLogoUrl || cachedLogoUrl;


  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Master Data": true,
    HR: true,
    Business: true,
    Users: true,
    "Stock Management": true,
    Services: true,
    Settings: true,
  });
  const [collapsed, setCollapsed] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
    onToggle();
    if (!collapsed) {
      setOpenSections({});
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

          const isOpen = route.title ? openSections[route.title] : false;

          return (
            <div key={route.title} className="w-full">
              <CustomButton
                variant="ghost"
                className={cn(
                  "hover:bg-primary/10 hover:text-primary rounded relative transition-all duration-200",
                  isCollapsed ? "w-8 h-8 mx-auto px-0 justify-center" : "w-full justify-start",
                )}
                onClick={() =>
                  route.title && !isCollapsed && toggleSection(route.title)
                }
                aria-expanded={isOpen}
                title={isCollapsed ? route.title : undefined}
              >
                <div
                  className={cn(
                    "flex items-center",
                    isCollapsed ? "justify-center" : "w-full min-w-0",
                  )}
                >
                  {route.icon && (
                    <route.icon className="w-3 h-3 flex-shrink-0 transition-colors duration-200" />
                  )}
                  {!isCollapsed && (
                    <>
                      <span className="ml-2 truncate min-w-0 flex-1 text-left transition-colors duration-200">
                        {route.title}
                      </span>
                      <div className="ml-2 pr-1 flex-shrink-0">
                        {isOpen ? (
                          <ChevronDown className="h-3 w-3 transition-colors duration-200" />
                        ) : (
                          <ChevronRight className="h-3 w-3 transition-colors duration-200" />
                        )}
                      </div>
                    </>
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
                            "relative w-full justify-start hover:bg-primary/10 hover:text-primary pl-4 rounded z-20 border-l border-transparent hover:border-l-primary/30 transition-all duration-200",
                            isSubItemActive &&
                              "bg-primary/20 text-primary font-medium border-l-2 border-primary shadow-sm",
                          )}
                        >
                          <Link
                            href={subItem.href}
                            className="flex items-center gap-1"
                          >
                            <span className="truncate">{subItem.title}</span>
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
              "hover:bg-primary/10 hover:text-primary rounded transition-all duration-200",
              isCollapsed ? "w-8 h-8 mx-auto px-0 justify-center" : "w-full justify-start",
              isActive &&
                "bg-primary/20 text-primary font-medium border-l-2 border-primary",
            )}
          >
            <Link
              href={route.href || "#"}
              className={cn(
                "flex items-center",
                isCollapsed ? "justify-center" : "gap-2 px-2 py-1",
              )}
              title={isCollapsed ? route.title : undefined}
            >
              {route.icon && <route.icon className="w-3 h-3 flex-shrink-0" />}
              {!isCollapsed && <span className="truncate">{route.title}</span>}
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
          collapsed ? "w-14" : "w-52",
          isMobile && !isOpen && "hidden",
        )}
      >
        <div
          className={cn(
            "relative flex h-14 items-center border-b border-border/50 bg-gradient-to-br from-primary/5 via-background/50 to-primary/5",
            collapsed ? "justify-center px-2" : "justify-between px-3",
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/10 opacity-50 blur-3xl pointer-events-none"></div>

          {!collapsed && (
            <Link
              href="/"
              className="relative flex items-center gap-2 group transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative">
                <div className="w-7 h-7 rounded bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-all duration-300 overflow-hidden">
                  <img
                    key={logoUrl}
                    src={logoUrl || appImages.noImage}
                    alt={businessName}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = appImages.noImage;
                    }}
                  />
                </div>
                <div className="absolute -inset-1 rounded bg-gradient-to-br from-primary/20 to-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-foreground font-bold text-xs leading-tight tracking-tight">
                  {businessName}
                </span>
                <span className="text-muted-foreground text-xs font-medium tracking-wide">
                  Dashboard
                </span>
              </div>
            </Link>
          )}

          <CustomButton
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="relative h-6 w-6 shrink-0 rounded transition-all duration-300 hover:bg-primary/10 hover:scale-110 group"
          >
            <div className="absolute inset-0 rounded bg-gradient-to-r from-primary/10 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ChevronLeft
              className={cn(
                "h-3 w-3 relative z-10 transition-transform duration-300",
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
          <UserAvatarCard
            user={profile}
            collapsed={collapsed}
            isOnline={true}
            isLoading={isProfileLoading}
            profileLink={ROUTES.ADMIN.PROFILE}
            showEmail={true}
            showOnlineIndicator={true}
            avatarSize="md"
          />
        )}
      </div>
    </>
  );
}
