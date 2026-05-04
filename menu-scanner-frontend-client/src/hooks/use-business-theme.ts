import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { selectBusinessSettings } from "@/redux/features/business/store/selectors/business-settings-selector";
import { fetchBusinessSettingsThunk } from "@/redux/features/business/store/thunks/business-settings-thunks";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";
import { BusinessSettingsResponse } from "@/redux/features/business/store/services/business-settings-service";
import { getCachedThemeColors, cacheThemeColors, hasThemeChanged, getCachedBusinessInfo } from "@/utils/common/theme-cache";
import { AppDefault } from "@/constants/app-resource/default/default";

// Default brand colors from tailwind config
const DEFAULT_COLORS = {
  primary: BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
};

/**
 * Convert hex color to HSL format for CSS variables
 */
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace("#", "");

  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  const hue = Math.round(h * 360);
  const saturation = Math.round(s * 100);
  const lightness = Math.round(l * 100);

  return `${hue} ${saturation}% ${lightness}%`;
}

/**
 * Hook to initialize business theme from settings
 * Implements stale-while-revalidate pattern:
 * 1. Check cache first (instant, no API call)
 * 2. Apply cached colors if they exist
 * 3. Fetch fresh data from API in background
 * 4. Compare API data with cache - update cache only if changed
 * 5. Keep cache always updated for fast subsequent loads
 */
export function useBusinessTheme() {
  const dispatch = useAppDispatch();
  const businessSettings = useAppSelector(selectBusinessSettings);

  useEffect(() => {
    // On login pages, use default business theme from AppDefault
    if (typeof window !== "undefined" && window.location.pathname.includes("/login")) {
      // Use default business ID
      const defaultBusinessId = AppDefault.BUSINESS_ID;
      const cachedColors = getCachedThemeColors(defaultBusinessId);

      if (cachedColors) {
        applyColors(cachedColors.primaryColor);
      }
      return;
    }

    // Check if settings already loaded in Redux
    if (businessSettings) {
      // Store business ID in localStorage
      localStorage.setItem("businessId", businessSettings.businessId);

      // STEP 1: Check cache first (instant, no API call)
      const cachedColors = getCachedThemeColors(businessSettings.businessId);
      if (cachedColors) {
        applyColors(cachedColors.primaryColor);
      }

      // STEP 2: Fetch fresh data from API in background
      // Compare with cache and update if changed (colors + business info + tax)
      const currentData = {
        primaryColor: businessSettings.primaryColor || "",
        businessName: businessSettings.businessName,
        logoBusinessUrl: businessSettings.logoBusinessUrl,
        taxPercentage: businessSettings.taxPercentage,
      };

      if (hasThemeChanged(cachedColors, currentData)) {
        cacheThemeColors(businessSettings.businessId, currentData);

        // Apply new colors if they differ from cache
        if (businessSettings.primaryColor) {
          applyColors(businessSettings.primaryColor);
        }
      }

      return;
    }

    // If not in Redux, fetch from API using thunk
    dispatch(fetchBusinessSettingsThunk()).then((action) => {
      // Check if action was fulfilled and has payload
      if (action.meta.requestStatus === "fulfilled" && action.payload) {
        const payload = action.payload as BusinessSettingsResponse;
        const businessId = payload.businessId;

        // Store business ID
        localStorage.setItem("businessId", businessId);

        // STEP 3: Compare API data with cache
        const cachedData = getCachedThemeColors(businessId);
        const apiData = {
          primaryColor: payload.primaryColor || "",
          businessName: payload.businessName,
          logoBusinessUrl: payload.logoBusinessUrl,
          taxPercentage: payload.taxPercentage,
        };

        // STEP 4: Update cache only if data changed
        if (hasThemeChanged(cachedData, apiData)) {
          cacheThemeColors(businessId, apiData);
        }

        // Apply colors from API
        applyColors(payload.primaryColor);
      }
    });
  }, [dispatch, businessSettings]);
}

/**
 * Helper function to apply primary color to CSS variables
 */
function applyColors(primaryColor?: string) {
  const primary = primaryColor || DEFAULT_COLORS.primary;

  if (primary) {
    document.documentElement.style.setProperty("--primary", hexToHsl(primary));
  }
}
