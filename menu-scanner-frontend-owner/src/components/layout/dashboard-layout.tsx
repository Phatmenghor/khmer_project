"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronUp } from "lucide-react";
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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const pathname = usePathname();

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
  }, []);

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="admin-shell flex overflow-hidden h-screen w-full bg-background">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div
        ref={contentRef}
        className={cn(
          "dashboard-content flex flex-col flex-1 min-w-0 transition-all duration-300 h-screen overflow-y-auto overflow-x-hidden",
          isMobile ? "w-full" : isSidebarOpen ? "ml-52" : "ml-14"
        )}
      >
        <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="dashboard-main w-full flex-1 px-2 py-2 md:px-3.5 md:py-3">
          {children}
        </main>
        <AdminFooter />
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
