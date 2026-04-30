"use client";

import { useInitialization } from "@/context/initialization-provider";
import { ReactNode } from "react";

/**
 * Wrapper component that shows loading state until app is initialized
 * Prevents rendering UI until business settings cache is ready
 */
export function InitializationLoader({ children }: { children: ReactNode }) {
  const { isInitialized, isLoading } = useInitialization();

  // While loading, show nothing (blank screen)
  // This prevents the color flash and duplicate renders
  if (isLoading || !isInitialized) {
    return <InitLoadingScreen />;
  }

  return <>{children}</>;
}

/**
 * Minimal loading screen - just a blank page
 * Prevents any UI from rendering until cache is ready
 */
function InitLoadingScreen() {
  return (
    <div className="w-full h-screen bg-white flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Animated loading dot */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}
