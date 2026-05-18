import DashboardLayout from "@/components/layout/dashboard-layout";
import type { ReactNode } from "react";
import { buildAdminMetadata } from "@/utils/metadata/metadata-builder";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";


export const dynamic = "force-dynamic";

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
      <div className="flex-1 h-full space-y-4 pl-0 sm:pl-2">{children}</div>
    </DashboardLayout>
  );
}
