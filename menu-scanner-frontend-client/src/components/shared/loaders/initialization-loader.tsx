"use client";

import { useInitialization } from "@/context/initialization-provider";
import { ReactNode } from "react";

/**
 * Prevents rendering UI until business settings cache is ready
 * Shows blank screen while loading (no icons, no text, no distraction)
 */
export function InitializationLoader({ children }: { children: ReactNode }) {
  const { isInitialized, isLoading } = useInitialization();

  if (isLoading || !isInitialized) {
    return <InitLoadingScreen />;
  }

  return <>{children}</>;
}

/**
 * Blank loading screen
 * Completely minimal - just white background
 * So fast users won't even notice it loading
 */
function InitLoadingScreen() {
  return <div className="fixed inset-0 w-full h-screen bg-white" />;
}
