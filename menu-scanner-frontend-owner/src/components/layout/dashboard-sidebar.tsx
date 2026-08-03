"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ROUTES, sidebarItems } from "@/constants/app-routes/routes";
import Image from "next/image";
import { appImages } from "@/constants/app-resource/icons/app-images";
import { UserAvatarCard } from "../shared/avator/user-avatar-card";
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

  // Get auth state from Redux
  const { profile, isProfileLoading, dispatch } = useAuthState();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Master Data": true,
    Business: true,
    "User Management": true,
    Locations: true,
  });
  const [collapsed, setCollapsed] = useState(false);

  // Fetch profile on mount if not already loaded
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
        const isActive = route.href ? pathname === route.href : false;

        if (route.subroutes) {
          const isOpen = route.section ? openSections[route.section] : false;

          return (
            <div key={route.title} className="w-full">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start hover:bg-primary/10 hover:text-primary rounded-[12px] relative transition-all duration-200 active:scale-[0.98]",
                  isActive &&
                    "bg-primary/15 text-primary font-semibold border-l-3 border-primary shadow-2xs rounded-[12px]",
                )}
                onClick={() =>
                  route.section && !isCollapsed && toggleSection(route.section)
                }
                aria-expanded={isOpen}
                title={isCollapsed ? route.title : undefined}
              >
                <div className="flex w-full items-center">
                  {route.icon && (
                    <route.icon className="w-3 h-3 flex-shrink-0" />
                  )}
                  {!isCollapsed && (
                    <>
                      <span className="ml-2 truncate">{route.title}</span>
                      <div className="ml-auto">
                        {isOpen ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Button>

              {!isCollapsed && isOpen && (
                <div className="relative ml-4 mt-1 space-y-1">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 z-0"></div>

                  {route.subroutes.map((subroute, index) => (
                    <div key={subroute.title} className="relative">
                      <div className="absolute left-0 top-1/2 w-3 h-px bg-gray-300 z-0"></div>

                      <div className="absolute left-0 top-1/2 w-1 h-1 bg-gray-400 rounded-full transform -translate-x-0.5 -translate-y-0.5 z-10"></div>

                      {index === route.subroutes!.length - 1 && (
                        <div
                          className="absolute left-0 top-1/2 w-px bg-background z-10"
                          style={{ height: "50%" }}
                        ></div>
                      )}

                      <div className="absolute left-3 top-1/2 w-1 h-px bg-gray-200 z-0"></div>

                      <Button
                        variant="ghost"
                        asChild
                        className={cn(
                          "relative w-full justify-start hover:bg-primary/10 hover:text-primary pl-4 rounded z-20 border-l border-transparent hover:border-l-primary/30 transition-all duration-200",
                          pathname === subroute.href &&
                            "bg-primary/15 text-primary font-medium border-l-2 border-primary shadow-sm",
                        )}
                      >
                        <Link
                          href={subroute.href}
                          className="flex items-center gap-1"
                        >
                          <span className="truncate">{subroute.title}</span>
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <Button
            key={route.title}
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start hover:bg-primary/10 hover:text-primary rounded",
              pathname === route.href &&
                "bg-primary/15 text-primary font-medium border-l-2 border-primary",
            )}
          >
            <Link
              href={route.href || "#"}
              className="flex items-center gap-2 px-2 py-1"
              title={collapsed ? route.title : undefined}
            >
              {route.icon && <route.icon className="w-3 h-3 flex-shrink-0" />}
              {!collapsed && <span className="truncate">{route.title}</span>}
            </Link>
          </Button>
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
          collapsed ? "w-11" : "w-44",
          isMobile && !isOpen && "hidden",
        )}
      >
        <div className="relative flex h-11 items-center justify-between border-b border-border/50 px-3 bg-gradient-to-br from-primary/5 via-background/50 to-accent/5">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50 blur-3xl"></div>

          {!collapsed && (
            <Link
              href="/"
              className="relative flex items-center gap-2 group transition-all duration-300 hover:scale-[1.02]"
            >
              <Image
                src={appImages.myLogo}
                alt="Emenu Cambodia Logo"
                width={120}
                height={120}
                className="h-10 w-auto object-contain"
                priority
              />

              <span className="text-foreground font-bold text-xs leading-tight tracking-tight">
                Emenu Cambodia
              </span>
            </Link>
          )}

          {collapsed && (
            <Link
              href="/"
              className="relative flex items-center justify-center group transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="w-7 h-7 rounded bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-all duration-300 overflow-hidden">
                <Image
                  src={appImages.myLogo}
                  alt="Emenu Cambodia Logo"
                  width={40}
                  height={40}
                  className="w-5 h-5 object-contain"
                  priority
                />
              </div>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className={cn(
              "relative h-6 w-6 rounded transition-all duration-300 hover:bg-accent/50 hover:scale-110 group",
            )}
          >
            <div className="absolute inset-0 rounded bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ChevronLeft className="h-3 w-3 relative z-10" />
          </Button>
        </div>

        <ScrollArea className="flex-1 py-3">
          <nav className="px-3 space-y-1">{renderNavItems(collapsed)}</nav>
        </ScrollArea>

        {/* User Avatar Card */}
        {profile && (
          <UserAvatarCard
            user={profile}
            collapsed={collapsed}
            isOnline={true}
            isLoading={isProfileLoading}
            profileLink={ROUTES.DASHBOARD.PROFILE}
            showEmail={true}
            showOnlineIndicator={true}
            enableImagePreview={true}
            avatarSize="md"
          />
        )}
      </div>
    </>
  );
}
