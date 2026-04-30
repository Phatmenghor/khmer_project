"use client";

import { ReactNode } from "react";

/**
 * Non-blocking initialization loader
 * Renders children immediately without waiting for colors to load
 * Colors load asynchronously in background without blocking page render
 */
export function InitializationLoader({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
