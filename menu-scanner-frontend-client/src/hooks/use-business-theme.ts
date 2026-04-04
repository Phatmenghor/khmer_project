import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { selectBusinessSettings } from "@/redux/features/business/store/selectors/business-settings-selector";
import { fetchBusinessSettingsThunk } from "@/redux/features/business/store/thunks/business-settings-thunks";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";
import { BusinessSettingsResponse } from "@/redux/features/business/store/services/business-settings-service";
import { getCachedThemeColors, cacheThemeColors, hasThemeChanged } from "@/utils/common/theme-cache";
import { AppDefault } from "@/constants/app-resource/default/default";

// Default brand colors from tailwind config
const DEFAULT_COLORS = {
  primary: BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
  secondary: BUSINESS_SETTINGS_DEFAULTS.SECONDARY_COLOR,
  accent: BUSINESS_SETTINGS_DEFAULTS.ACCENT_COLOR,
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
 * Fetches business settings on app startup and applies theme colors
 * Skips fetching on login/auth pages since user is not authenticated
 */
export function useBusinessTheme() {
  const dispatch = useAppDispatch();
  const businessSettings = useAppSelector(selectBusinessSettings);

  useEffect(() => {
    // On login pages, use default business theme from AppDefault
    if (typeof window !== "undefined" && window.location.pathname.includes("/login")) {
      console.log("## [THEME] On login page, loading default business theme");

      // Use default business ID
      const defaultBusinessId = AppDefault.BUSINESS_ID;
      const cachedColors = getCachedThemeColors(defaultBusinessId);

      if (cachedColors) {
        console.log(`## [THEME] Applying cached colors for default business ${defaultBusinessId} on login page`);
        applyColors(cachedColors.primaryColor, cachedColors.secondaryColor, cachedColors.accentColor);
      } else {
        console.log("## [THEME] No cached theme for default business, using defaults");
        applyColors(DEFAULT_COLORS.primary, DEFAULT_COLORS.secondary, DEFAULT_COLORS.accent);
      }
      return;
    }

    // Check if settings already loaded in Redux
    if (businessSettings) {
      // Store business ID in localStorage for ThemeInitializer
      localStorage.setItem("businessId", businessSettings.businessId);

      // Try to load from cache first (instant colors)
      const cachedColors = getCachedThemeColors(businessSettings.businessId);
      if (cachedColors) {
        console.log(
          `## [THEME] Applying cached colors for business ${businessSettings.businessId}`
        );
        applyColors(cachedColors.primaryColor, cachedColors.secondaryColor, cachedColors.accentColor);
      } else {
        // Apply from redux if no cache
        applyColors(
          businessSettings.primaryColor,
          businessSettings.secondaryColor,
          businessSettings.accentColor
        );
      }

      // Update cache with current settings
      const currentColors = {
        primaryColor: businessSettings.primaryColor || "",
        secondaryColor: businessSettings.secondaryColor || "",
        accentColor: businessSettings.accentColor || "",
      };
      if (hasThemeChanged(cachedColors, currentColors)) {
        cacheThemeColors(businessSettings.businessId, currentColors);
      }

      return;
    }

    // If not in Redux, fetch from API using thunk
    dispatch(fetchBusinessSettingsThunk()).then((action) => {
      // Check if action was fulfilled and has payload
      if (action.meta.requestStatus === "fulfilled" && action.payload) {
        const payload = action.payload as BusinessSettingsResponse;

        // Store business ID
        localStorage.setItem("businessId", payload.businessId);

        // Cache the colors
        const colors = {
          primaryColor: payload.primaryColor || "",
          secondaryColor: payload.secondaryColor || "",
          accentColor: payload.accentColor || "",
        };
        cacheThemeColors(payload.businessId, colors);
        console.log(`## [THEME] Cached colors for business ${payload.businessId}`);

        // Apply colors
        applyColors(payload.primaryColor, payload.secondaryColor, payload.accentColor);
        console.log("## [THEME] Business theme loaded and applied successfully");
      } else {
        console.error("## [THEME] Failed to load business theme, using defaults");
        applyColors(DEFAULT_COLORS.primary, DEFAULT_COLORS.secondary, DEFAULT_COLORS.accent);
      }
    });
  }, [dispatch, businessSettings]);
}

/**
 * Helper function to apply colors to CSS variables
 */
function applyColors(primaryColor?: string, secondaryColor?: string, accentColor?: string) {
  const primary = primaryColor || DEFAULT_COLORS.primary;
  const secondary = secondaryColor || DEFAULT_COLORS.secondary;
  const accent = accentColor || DEFAULT_COLORS.accent;

  document.documentElement.style.setProperty("--primary", hexToHsl(primary));
  document.documentElement.style.setProperty("--secondary", hexToHsl(secondary));
  document.documentElement.style.setProperty("--accent", hexToHsl(accent));
}
