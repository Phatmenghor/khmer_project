// components/providers/auth-provider.tsx
"use client";

import { useAuthInit } from "@/redux/store/use-auth-init";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize auth from cookies
  useAuthInit();

  return <>{children}</>;
}
