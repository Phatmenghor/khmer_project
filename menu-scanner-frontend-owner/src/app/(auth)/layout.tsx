// src/app/(auth)/layout.tsx
import { ReactNode } from "react";
import { appImages } from "@/constants/app-resource/icons/app-images";

interface AuthLayoutProps {
  children: ReactNode;
}

export const metadata = {
  ...(process.env.NEXT_PUBLIC_APP_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL) }
    : {}),
  title: "Authentication | ScanMeKH",
  description: "Sign in to your account",
  icons: {
    icon: appImages.myLogo,
    shortcut: appImages.myLogo,
    apple: appImages.myLogo,
  },
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full">
      {/* Main Content Area - Full Width, No Constraints */}
      <main className="h-screen w-full">{children}</main>
    </div>
  );
}
