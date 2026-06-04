import DashboardLayout from "@/components/layout/dashboard-layout";
import type { ReactNode } from "react";
import { buildAdminMetadata } from "@/utils/metadata/metadata-builder";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_KEYS } from "@/constants/cookie-keys";

export const dynamic = "force-dynamic";

interface DashboardGroupLayoutProps {
  children: ReactNode;
}

export const metadata = buildAdminMetadata(
  BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME
);

export default async function DashboardGroupLayout({
  children,
}: DashboardGroupLayoutProps) {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(COOKIE_KEYS.ADMIN_ACCESS_TOKEN);

  if (!adminToken?.value) {
    redirect("/login");
  }

  return (
    <DashboardLayout>
      <div className="flex-1 h-full space-y-3 pl-0 sm:pl-1">{children}</div>
    </DashboardLayout>
  );
}
