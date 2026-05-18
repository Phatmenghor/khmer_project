import { ReactNode } from "react";
import { buildAuthMetadata } from "@/utils/metadata/metadata-builder";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";

interface AuthLayoutProps {
  children: ReactNode;
}

export const metadata = buildAuthMetadata(
  BUSINESS_SETTINGS_DEFAULTS.BUSINESS_NAME
);

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full">
      <main className="h-screen w-full">{children}</main>
    </div>
  );
}
