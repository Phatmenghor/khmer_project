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
  const isMobile = useIsMobile();
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [pathname, isMobile]);

  return (
    <div className="flex overflow-x-hidden h-screen w-full bg-background">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div
        className={cn(
          "dashboard-content flex flex-col flex-1 transition-all overflow-y-auto duration-300",
          isMobile ? "w-full" : isSidebarOpen ? "ml-56" : "ml-[60px]"
        )}
      >
        <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="dashboard-main flex-1 p-2 md:p-4">{children}</main>
        <AdminFooter />
      </div>
    </div>
  );
}
