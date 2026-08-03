import DashboardLayout from "@/components/layout/dashboard-layout";
import type { ReactNode } from "react";
import { buildAdminMetadata } from "@/utils/metadata/metadata-builder";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";

interface DashboardGroupLayoutProps {
  children: ReactNode;
}

export const metadata = buildAdminMetadata(
  BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME
);

export default function DashboardGroupLayout({
  children,
}: DashboardGroupLayoutProps) {
  return (
    <DashboardLayout>
      <div className="flex-1 h-full flex flex-col min-h-0 pl-0 sm:pl-1">{children}</div>
    </DashboardLayout>
  );
}
