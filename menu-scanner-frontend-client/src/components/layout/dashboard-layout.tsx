"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { TopBar } from "./topbar";
import { AdminFooter } from "./admin-footer";
import { useIsMobile } from "@/redux/store/use-mobile";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [pathname, isMobile]);

  // Handle keyboard shortcut for fullscreen (F11)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Check if current page is POS (hide footer and use full screen)
  const isPosPage = pathname.includes("/pos");

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col">
        <TopBar
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onFullscreenClick={() => setIsFullscreen(false)}
        />
        <main className="dashboard-main flex-1 overflow-hidden">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex overflow-x-hidden h-screen w-full bg-background">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div
        className={cn(
          "dashboard-content flex flex-col flex-1 transition-all duration-300 overflow-hidden",
          isMobile ? "w-full" : isSidebarOpen ? "ml-56" : "ml-[60px]",
        )}
      >
        <TopBar
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onFullscreenClick={() => setIsFullscreen(true)}
        />
        <main className={cn(
          "dashboard-main flex-1",
          isPosPage ? "overflow-hidden" : "overflow-y-auto p-2 md:p-4"
        )}>
          {children}
        </main>
        {!isPosPage && <AdminFooter />}
      </div>
    </div>
  );
}
