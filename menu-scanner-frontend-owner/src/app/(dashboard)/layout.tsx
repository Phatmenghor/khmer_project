// src/app/(dashboard)/layout.tsx
import DashboardLayout from "@/components/layout/dashboard-layout";
import { WebSocketProvider } from "@/components/layout/websocket-provider";
import { appImages } from "@/constants/app-resource/icons/app-images";
import type { ReactNode } from "react";

interface DashboardGroupLayoutProps {
  children: ReactNode;
}

export const metadata = {
  ...(process.env.NEXT_PUBLIC_APP_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL) }
    : {}),
  title: {
    template: "%s | ScanMeKH",
    default: "Dashboard | ScanMeKH",
  },
  description: "ScanMeKH Dashboard - Manage your restaurant operations",
  icons: {
    icon: appImages.scanmekhLogo,
    shortcut: appImages.scanmekhLogo,
    apple: appImages.scanmekhLogo,
  },
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
