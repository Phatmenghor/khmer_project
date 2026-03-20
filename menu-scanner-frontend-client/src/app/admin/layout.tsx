import DashboardLayout from "@/components/layout/dashboard-layout";
import type { ReactNode } from "react";

// Force all admin routes to use dynamic rendering
export const dynamic = "force-dynamic";

interface DashboardGroupLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: {
    template: "%s | Dashboard",
    default: "Dashboard",
  },
  description: "Menu Scanner Dashboard - Manage your restaurant operations",
};

export default function DashboardGroupLayout({
  children,
}: DashboardGroupLayoutProps) {
  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 pl-0 sm:pl-2">{children}</div>
    </DashboardLayout>
  );
}
