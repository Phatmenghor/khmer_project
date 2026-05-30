"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isPosPage = pathname.includes("/pos");

  // Restore fullscreen state from URL query parameter
  useEffect(() => {
    const fullscreenParam = searchParams?.get("fullscreen");
    if (fullscreenParam === "true" || fullscreenParam === "1") {
      setIsFullscreen(true);
    } else {
      setIsFullscreen(false);
    }
  }, [searchParams, pathname]);

  // Update URL when fullscreen state changes (only on POS page)
  useEffect(() => {
    if (!pathname || !isPosPage) return;

    const params = new URLSearchParams(window.location.search);
    if (isFullscreen) {
      params.set("fullscreen", "true");
    } else {
      params.delete("fullscreen");
    }

    const newUrl = `${pathname}?${params.toString()}`.replace(/\?$/, "");
    window.history.replaceState({ path: newUrl }, "", newUrl);
  }, [isFullscreen, pathname, isPosPage]);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [pathname, isMobile]);


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
      <div className="fixed inset-0 z-[100] bg-background flex flex-col">
        <div className="hidden md:flex h-16 items-center border-b bg-background/95 backdrop-blur px-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(false)}
            title="Exit Fullscreen (F11)"
            className="ml-auto h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
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
          "dashboard-content flex flex-col flex-1 transition-all duration-300",
          isPosPage ? "overflow-hidden" : "overflow-y-auto",
          isMobile ? "w-full" : isSidebarOpen ? "ml-56" : "ml-[60px]",
        )}
      >
        <TopBar
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onFullscreenClick={() => setIsFullscreen(true)}
        />
        <main className={cn(
          "dashboard-main flex-1",
          isPosPage ? "overflow-hidden" : "p-2 md:p-4"
        )}>
          {children}
        </main>
        {!isPosPage && <AdminFooter />}
      </div>
    </div>
  );
}
