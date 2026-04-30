"use client";

import { useBusinessSettingsCache } from "@/hooks/use-business-settings-cache";

/**
 * Initializes business settings cache on app startup
 * Ensures cache is populated before Footer renders (no color flash)
 * Runs silently in background
 */
export function BusinessSettingsInitializer() {
  // Get business ID from localStorage or use default
  const getBusinessIdFromStorage = () => {
    if (typeof window === "undefined") return "550cad56-cafd-4aba-baef-c4dcd53940d0";
    try {
      const cached = localStorage.getItem("business_settings_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.data?.businessId || "550cad56-cafd-4aba-baef-c4dcd53940d0";
      }
    } catch {
      // Fall back to default
    }
    return "550cad56-cafd-4aba-baef-c4dcd53940d0";
  };

  // Initialize cache immediately on mount
  useBusinessSettingsCache({
    businessId: getBusinessIdFromStorage(),
    onSettingsUpdate: (newSettings) => {
      // Silently update in background
      // Footer will re-render automatically when cache updates
      console.log("[Cache] Business settings updated in background");
    },
  });

  // This component doesn't render anything
  return null;
}
