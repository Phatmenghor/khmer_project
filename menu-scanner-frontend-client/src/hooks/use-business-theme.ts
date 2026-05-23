import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { selectBusinessSettings } from "@/features/business/store/selectors/business-settings-selector";
import { fetchBusinessSettingsThunk } from "@/features/business/store/thunks/business-settings-thunks";
import { BUSINESS_SETTINGS_DEFAULTS } from "@/constants/business-settings";
import { BusinessSettingsResponse } from "@/features/business/store/services/business-settings-service";
import { getCachedThemeColors, cacheThemeColors, hasThemeChanged, getCachedBusinessInfo } from "@/utils/common/theme-cache";
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


export function useBusinessTheme() {
  const dispatch = useAppDispatch();
  const businessSettings = useAppSelector(selectBusinessSettings);
  const pathname = usePathname();

  useEffect(() => {
    const isLoginPage = pathname?.includes("/login");

    if (isLoginPage) {
      const defaultBusinessId = AppDefault.BUSINESS_ID;
      const cachedColors = getCachedThemeColors(defaultBusinessId);

      if (cachedColors) {
        applyColors(cachedColors.primaryColor);
        return; // cache hit — no need to fetch
      }
      // no cache — fall through to fetch below
    }


    if (businessSettings) {

      localStorage.setItem("businessId", businessSettings.businessId);


      const cachedColors = getCachedThemeColors(businessSettings.businessId);
      if (cachedColors) {
        applyColors(cachedColors.primaryColor);
      }


      const currentData = {
        primaryColor: businessSettings.primaryColor || "",
        businessName: businessSettings.businessName,
        logoBusinessUrl: businessSettings.logoBusinessUrl,
        taxPercentage: businessSettings.taxPercentage ?? undefined,
      };

      if (hasThemeChanged(cachedColors, currentData)) {
        cacheThemeColors(businessSettings.businessId, currentData);


        if (businessSettings.primaryColor) {
          applyColors(businessSettings.primaryColor);
        }
      }

      return;
    }


    dispatch(fetchBusinessSettingsThunk()).then((action) => {

      if (action.meta.requestStatus === "fulfilled" && action.payload) {
        const payload = action.payload as BusinessSettingsResponse;
        const businessId = payload.businessId;


        localStorage.setItem("businessId", businessId);


        const cachedData = getCachedThemeColors(businessId);
        const apiData = {
          primaryColor: payload.primaryColor || "",
          businessName: payload.businessName,
          logoBusinessUrl: payload.logoBusinessUrl,
          taxPercentage: payload.taxPercentage ?? undefined,
        };


        if (hasThemeChanged(cachedData, apiData)) {
          cacheThemeColors(businessId, apiData);
        }


        applyColors(payload.primaryColor);
      }
    });
  }, [dispatch, businessSettings, pathname]);
}


function applyColors(primaryColor?: string) {
  const primary = primaryColor || DEFAULT_COLORS.primary;

  if (primary) {
    document.documentElement.style.setProperty("--primary", hexToHsl(primary));
  }
}
