"use client";

import { useBusinessSettingsCache } from "@/hooks/use-business-settings-cache";

/**
 * Initializes business settings cache on app startup
 * Only runs if user is authenticated (has access token)
 * Ensures cache is populated before Footer renders (no color flash)
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

  // Check if user is authenticated (has token)
  const hasToken = () => {
    if (typeof window === "undefined") return false;
    try {
      const token = localStorage.getItem("accessToken");
      return !!token;
    } catch {
      return false;
    }
  };

  // Only initialize cache if user is authenticated
  if (!hasToken()) {
    return null;
  }

  // Initialize cache immediately on mount (only for authenticated users)
  useBusinessSettingsCache({
    businessId: getBusinessIdFromStorage(),
    onSettingsUpdate: (newSettings) => {
      // Silently update in background
      // Footer will re-render automatically when cache updates
      console.log("[Cache] Business settings updated in background");
    },
  });

  return null;
}
