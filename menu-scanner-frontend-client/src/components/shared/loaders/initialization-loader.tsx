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
 * Minimal loading screen - smooth animations, no text
 * Prevents any UI from rendering until cache is ready
 */
function InitLoadingScreen() {
  return (
    <div className="fixed inset-0 w-full h-screen bg-white overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white animate-pulse" />

      {/* Center animated element */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer rotating ring */}
        <div className="relative w-12 h-12">
          {/* Spinner ring */}
          <div className="absolute inset-0 rounded-full border-2 border-gray-200 border-t-gray-400 animate-spin" />

          {/* Inner pulsing dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Subtle animated progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400 to-transparent animate-pulse" />
      </div>
    </div>
  );
}
