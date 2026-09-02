"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Maximize2, ChevronUp } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { TopBar } from "./topbar";
import { AdminFooter } from "./admin-footer";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const pathname = usePathname();

  const isPosPage = pathname === "/admin/pos" || pathname === "/admin/pos/";

  // Restore fullscreen state from URL on client mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fullscreenParam = params.get("fullscreen");
    if (fullscreenParam === "true" || fullscreenParam === "1") {
      setIsFullscreen(true);
    }
    setMounted(true);
  }, []);

  // Sync fullscreen state to URL (on POS page only, after mount)
  useEffect(() => {
    if (!mounted || !isPosPage) return;

    const params = new URLSearchParams(window.location.search);
    if (isFullscreen) {
      params.set("fullscreen", "true");
    } else {
      params.delete("fullscreen");
    }

    const query = params.toString();
    const newUrl = query ? `${pathname}?${query}` : pathname;
    window.history.replaceState(null, "", newUrl);
  }, [isFullscreen, mounted, isPosPage, pathname]);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [pathname, isMobile]);

  // Scroll to top on page navigation
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [pathname]);

  // Handle scroll listener for Scroll-to-Top button
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 250);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [mounted]);

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };


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

  return (
    <div className="admin-shell flex overflow-hidden h-screen w-full bg-background">
      {!isFullscreen && (
        <DashboardSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      )}
      <div
        ref={contentRef}
        className={cn(
          "dashboard-content flex flex-col flex-1 min-w-0 transition-all duration-300 h-screen overflow-y-auto overflow-x-hidden",
          isPosPage && "overflow-hidden",
          isFullscreen ? "ml-0 w-full" : isMobile ? "w-full" : isSidebarOpen ? "ml-60" : "ml-14",
        )}
      >
        <TopBar
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onFullscreenClick={() => setIsFullscreen(!isFullscreen)}
          isFullscreen={isFullscreen}
        />
        <main className={cn(
          "dashboard-main w-full",
          isPosPage ? "flex-1 min-h-0 overflow-hidden flex flex-col h-full" : "px-1.5 py-1.5"
        )}>
          {children}
        </main>
        {!isPosPage && !isFullscreen && <AdminFooter />}
      </div>
      {!isFullscreen && (
        <button
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-6 right-6 z-50 group flex h-11 w-11 items-center justify-center rounded-full",
            "bg-background/80 dark:bg-zinc-900/80 backdrop-blur-md border border-border/60",
            "text-foreground shadow-lg hover:shadow-xl hover:bg-accent hover:text-accent-foreground hover:scale-110 active:scale-95 transition-all duration-300",
            showScrollTop
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          )}
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1" />
        </button>
      )}
    </div>
  );
}
