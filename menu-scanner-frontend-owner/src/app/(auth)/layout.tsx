// src/app/(auth)/layout.tsx
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: "Authentication | ScanMeKH",
  description: "Sign in to your account",
  icons: {
    icon: "/images/logo/my_logo.png",
    shortcut: "/images/logo/my_logo.png",
    apple: "/images/logo/my_logo.png",
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
