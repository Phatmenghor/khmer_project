// components/providers/auth-provider.tsx
"use client";

import { useAuthInit } from "@/hooks/use-auth-init";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize auth from cookies on every route change
  useAuthInit();

  return <>{children}</>;
}
