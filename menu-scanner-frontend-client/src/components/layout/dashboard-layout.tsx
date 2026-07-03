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

  const isPosPage = pathname.includes("/pos");

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

  if (isFullscreen && isPosPage) {
    return (
      <div className="fixed inset-0 z-40 bg-background flex flex-col">
        <div className="hidden md:flex h-11 items-center border-b bg-background/95 backdrop-blur px-3">
          <CustomButton
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(false)}
            title="Exit Fullscreen (F11)"
            className="ml-auto h-6 w-6 rounded hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Maximize2 className="h-3 w-3" />
          </CustomButton>
        </div>
        <main className="dashboard-main flex-1 overflow-hidden">{children}</main>
      </div>
    );
  }

  return (
    <div className="admin-shell flex overflow-x-hidden h-screen w-full bg-background">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div
        ref={contentRef}
        className={cn(
          "dashboard-content flex flex-col flex-1 min-w-0 transition-all duration-300",
          isPosPage ? "overflow-hidden" : "overflow-y-auto",
          isMobile ? "w-full" : isSidebarOpen ? "ml-52" : "ml-14",
        )}
      >
        <TopBar
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onFullscreenClick={() => setIsFullscreen(true)}
        />
        <main className={cn(
          "dashboard-main flex-1",
          isPosPage ? "overflow-hidden" : "px-1.5 py-1.5"
        )}>
          {children}
        </main>
        {!isPosPage && <AdminFooter />}
      </div>
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
    </div>
  );
}
