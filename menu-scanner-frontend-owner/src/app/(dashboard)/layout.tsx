// src/app/(dashboard)/layout.tsx
import DashboardLayout from "@/components/layout/dashboard-layout";
import { WebSocketProvider } from "@/components/layout/websocket-provider";
import type { ReactNode } from "react";

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
      <WebSocketProvider>
        <div className="flex-1 space-y-3 pl-3">{children}</div>
      </WebSocketProvider>
    </DashboardLayout>
  );
}
