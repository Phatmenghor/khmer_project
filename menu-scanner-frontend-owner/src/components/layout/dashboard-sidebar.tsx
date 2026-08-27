"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomButton } from "@/components/shared/button/custom-button";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ROUTES, sidebarItems } from "@/constants/app-routes/routes";
import { SmartImage } from "@/components/shared/image/smart-image";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { UserAvatarCard } from "../shared/avatar/user-avatar-card";
import { useIsMobile } from "@/redux/store/use-mobile";
import { useAuthState } from "@/redux/features/auth/store/state/auth-state";
import { getProfileService } from "@/redux/features/auth/store/thunks/auth-thunks";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function DashboardSidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const { profile, isProfileLoading, dispatch } = useAuthState();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Master Data": true,
    Business: true,
    "User Management": true,
  });
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!profile && !isProfileLoading) {
      dispatch(getProfileService());
    }
  }, [profile, isProfileLoading, dispatch]);

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
      {sidebarItems.map((route) => {
        const hasSubItems = route.subroutes && route.subroutes.length > 0;
        const isActive = route.href ? pathname === route.href : false;
        const sectionKey = route.section || route.title;

        if (hasSubItems) {
          const isOpen = sectionKey ? openSections[sectionKey] : false;

          return (
            <div key={route.title} className="w-full">
              <CustomButton
                variant="ghost"
                className={cn(
                  "hover:bg-primary/10 hover:text-primary rounded relative transition-all duration-200",
                  isCollapsed ? "w-8 h-8 mx-auto px-0 justify-center" : "w-full justify-start",
                )}
                onClick={() =>
                  sectionKey && !isCollapsed && toggleSection(sectionKey)
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
                    <route.icon className="w-3.5 h-3.5 flex-shrink-0 transition-colors duration-200 text-muted-foreground" />
                  )}
                  {!isCollapsed && (
                    <>
                      <span className="ml-2 truncate min-w-0 flex-1 text-left font-medium text-xs transition-colors duration-200">
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
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-700 z-0"></div>

                  {route.subroutes!.map((subItem) => {
                    const isSubItemActive = pathname === subItem.href;

                    return (
                      <div key={subItem.title} className="relative">
                        <div
                          className={cn(
                            "absolute left-0 top-1/2 w-3 h-px z-0 transition-colors duration-200",
                            isSubItemActive ? "bg-primary/40" : "bg-gray-300 dark:bg-gray-700",
                          )}
                        ></div>

                        <div
                          className={cn(
                            "absolute left-0 top-1/2 w-1 h-1 rounded-full transform -translate-x-0.5 -translate-y-0.5 z-10 transition-colors duration-200",
                            isSubItemActive ? "bg-primary" : "bg-gray-400",
                          )}
                        ></div>

                        <div className="absolute left-3 top-1/2 w-1 h-px z-0 transition-colors duration-200 bg-gray-200 dark:bg-gray-800"></div>

                        <CustomButton
                          variant="ghost"
                          asChild
                          className={cn(
                            "relative w-full justify-start hover:bg-primary/10 hover:text-primary pl-4 rounded z-20 border-l border-transparent hover:border-l-primary/30 transition-all duration-200 text-xs",
                            isSubItemActive &&
                              "bg-primary/20 text-primary font-bold border-l-2 border-primary shadow-2xs",
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
              "hover:bg-primary/10 hover:text-primary rounded transition-all duration-200 text-xs",
              isCollapsed ? "w-8 h-8 mx-auto px-0 justify-center" : "w-full justify-start",
              isActive &&
                "bg-primary/20 text-primary font-bold border-l-2 border-primary",
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
              {route.icon && <route.icon className="w-3.5 h-3.5 flex-shrink-0" />}
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
              <div className="relative w-9 h-9 shrink-0 rounded-lg overflow-hidden border border-border/40 shadow-3xs bg-card flex items-center justify-center">
                <SmartImage
                  src={appImages.myLogo}
                  fallbackSrc={appImages.noImage}
                  alt="Emenu Cambodia"
                  fill
                  objectFit="contain"
                  showSkeleton={false}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-foreground font-bold text-xs leading-tight tracking-tight">
                  Emenu Cambodia
                </span>
                <span className="text-muted-foreground text-[10px] font-medium tracking-wide">
                  Owner Dashboard
                </span>
              </div>
            </Link>
          )}

          {collapsed && (
            <Link
              href="/"
              className="relative flex items-center justify-center group transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="relative w-8 h-8 shrink-0 rounded-lg overflow-hidden border border-border/40 shadow-3xs bg-card flex items-center justify-center">
                <SmartImage
                  src={appImages.myLogo}
                  fallbackSrc={appImages.noImage}
                  alt="Logo"
                  fill
                  objectFit="contain"
                  showSkeleton={false}
                />
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
            profileLink={ROUTES.DASHBOARD.PROFILE}
            showEmail={true}
            showOnlineIndicator={true}
            avatarSize="md"
          />
        )}
      </div>
    </>
  );
}
