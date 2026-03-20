// components/providers/auth-provider.tsx
"use client";

import { useAuthInitV2 } from "@/redux/store/use-auth-init-v2";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize auth from cookies on every route change
  useAuthInitV2();

  return <>{children}</>;
}
