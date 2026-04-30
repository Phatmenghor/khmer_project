"use client";

import { useEffect } from "react";
import { useBusinessSettingsCache } from "@/hooks/use-business-settings-cache";
import { useAppSelector } from "@/redux/store";
import { selectCurrentBusinessId } from "@/redux/features/auth/store/selectors/auth-selectors";

/**
 * Initializes business settings cache on app startup
 * Ensures cache is populated before Footer renders (no color flash)
 * Runs silently in background
 */
export function BusinessSettingsInitializer() {
  const businessId = useAppSelector(selectCurrentBusinessId);

  // Initialize cache immediately on mount
  useBusinessSettingsCache({
    businessId: businessId || "550cad56-cafd-4aba-baef-c4dcd53940d0",
    onSettingsUpdate: (newSettings) => {
      // Silently update in background
      // Footer will re-render automatically when cache updates
      console.log("[Cache] Business settings updated in background");
    },
  });

  // This component doesn't render anything
  return null;
}
