import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectBusinessSettings, selectBusinessSettingsLoading } from "@/features/business/store/selectors/business-settings-selector";
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

export function useBusinessTheme() {
  const dispatch = useAppDispatch();
  const businessSettings = useAppSelector(selectBusinessSettings);
  const isLoading = useAppSelector(selectBusinessSettingsLoading);
  const pathname = usePathname();

  useEffect(() => {
    // Always try to apply colors from cache immediately (fast path)
    const businessId = (typeof window !== "undefined" && localStorage.getItem("businessId")) || AppDefault.BUSINESS_ID;
    const cachedColors = getCachedThemeColors(businessId);
    if (cachedColors?.primaryColor) {
      applyColors(cachedColors.primaryColor);
    }

    // If we already have Redux data, apply it and keep window cache in sync
    if (businessSettings) {
      localStorage.setItem("businessId", businessSettings.businessId);

      const currentData = {
        primaryColor: businessSettings.primaryColor || "",
        businessName: businessSettings.businessName,
        logoBusinessUrl: businessSettings.logoBusinessUrl,
        taxPercentage: businessSettings.taxPercentage ?? undefined,
      };

      if (hasThemeChanged(cachedColors, currentData)) {
        cacheThemeColors(businessSettings.businessId, currentData);
      }

      if (businessSettings.primaryColor) {
        applyColors(businessSettings.primaryColor);
      }

      // Keep window cache in sync with latest Redux data
      syncWindowCache(businessSettings);
      return;
    }

    // No Redux data yet — dispatch fetch if not already in flight
    if (!isLoading) {
      dispatch(fetchBusinessSettingsThunk()).then((action) => {
        if (action.meta.requestStatus === "fulfilled" && action.payload) {
          const payload = action.payload as BusinessSettingsResponse;

          localStorage.setItem("businessId", payload.businessId);

          const apiData = {
            primaryColor: payload.primaryColor || "",
            businessName: payload.businessName,
            logoBusinessUrl: payload.logoBusinessUrl,
            taxPercentage: payload.taxPercentage ?? undefined,
          };

          const existingCache = getCachedThemeColors(payload.businessId);
          if (hasThemeChanged(existingCache, apiData)) {
            cacheThemeColors(payload.businessId, apiData);
          }

          applyColors(payload.primaryColor);
          syncWindowCache(payload);
        }
      });
    }
  }, [dispatch, businessSettings, isLoading, pathname]);
}


function applyColors(primaryColor?: string) {
  const primary = primaryColor || DEFAULT_COLORS.primary;

  if (primary) {
    document.documentElement.style.setProperty("--primary", hexToHsl(primary));
  }
}
