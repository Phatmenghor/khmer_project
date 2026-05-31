import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectBusinessSettings,
  selectBusinessSettingsLoading,
  selectBusinessSettingsError,
} from "@/features/business/store/selectors/business-settings-selector";
import { fetchBusinessSettingsThunk } from "@/features/business/store/thunks/business-settings-thunks";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";
import { BusinessSettingsResponse } from "@/features/business/store/services/business-settings-service";
import { getCachedThemeColors, cacheThemeColors, hasThemeChanged } from "@/utils/common/theme-cache";
import { AppDefault } from "@/constants/app-resource/default/default";


const DEFAULT_COLORS = {
  primary: BUSINESS_SETTINGS_DEFAULTS.PRIMARY_COLOR,
};


function hexToHsl(hex: string): string {
  hex = hex.replace("#", "");

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

function syncWindowCache(settings: {
  businessName?: string;
  logoBusinessUrl?: string;
  primaryColor?: string;
  taxPercentage?: number | null;
}) {
  if (typeof window !== "undefined") {
    window.__cachedBusinessData = {
      businessName: settings.businessName,
      logoBusinessUrl: settings.logoBusinessUrl,
      primaryColor: settings.primaryColor,
      taxPercentage: settings.taxPercentage ?? undefined,
    };
  }
}

function applyColors(primaryColor?: string) {
  const primary = primaryColor || DEFAULT_COLORS.primary;
  if (primary) {
    document.documentElement.style.setProperty("--primary", hexToHsl(primary));
  }
}

export function useBusinessTheme() {
  const dispatch = useAppDispatch();
  const businessSettings = useAppSelector(selectBusinessSettings);
  const isLoading = useAppSelector(selectBusinessSettingsLoading);
  const error = useAppSelector(selectBusinessSettingsError);
  const pathname = usePathname();

  // Tracks whether a fetch has been dispatched — prevents retry loops on failure.
  // This ref lives as long as the ThemeInitializer component (global provider), so
  // it effectively means "try once per session". Page reload resets it.
  const fetchAttemptedRef = useRef(false);

  // Effect 1: Apply theme colors on every navigation.
  // Uses cache first for instant paint, then overrides with live Redux data.
  useEffect(() => {
    const businessId = AppDefault.BUSINESS_ID;
    const cachedColors = getCachedThemeColors(businessId);
    if (cachedColors?.primaryColor) {
      applyColors(cachedColors.primaryColor);
    }
    if (businessSettings?.primaryColor) {
      applyColors(businessSettings.primaryColor);
    }
  }, [pathname, businessSettings]);

  // Effect 2: Update color cache when settings first arrive from API.
  useEffect(() => {
    if (!businessSettings) return;

    const currentData = {
      primaryColor: businessSettings.primaryColor || "",
      businessName: businessSettings.businessName,
      logoBusinessUrl: businessSettings.logoBusinessUrl,
      taxPercentage: businessSettings.taxPercentage ?? undefined,
    };

    const cachedColors = getCachedThemeColors(businessSettings.businessId);
    if (hasThemeChanged(cachedColors, currentData)) {
      cacheThemeColors(businessSettings.businessId, currentData);
    }

    if (businessSettings.primaryColor) {
      applyColors(businessSettings.primaryColor);
    }

    syncWindowCache(businessSettings);
  }, [businessSettings]);

  // Effect 3: Fetch business settings exactly once.
  // Guards: already have data, already loading, already failed, or already dispatched.
  // On any error the ref stays true so no retry loop occurs.
  useEffect(() => {
    if (
      businessSettings ||
      isLoading ||
      error ||
      fetchAttemptedRef.current
    ) {
      return;
    }
    fetchAttemptedRef.current = true;
    dispatch(fetchBusinessSettingsThunk());
  }, [dispatch, businessSettings, isLoading, error]);
}
