import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectBusinessSettings,
  selectBusinessSettingsLoading,
  selectBusinessSettingsError,
} from "@/features/business/store/selectors/business-settings-selector";
import { fetchBusinessSettingsThunk } from "@/features/business/store/thunks/business-settings-thunks";
import { getCachedThemeColors, cacheThemeColors, hasThemeChanged } from "@/utils/common/theme-cache";

export function useBusinessTheme() {
  const dispatch = useAppDispatch();
  const businessSettings = useAppSelector(selectBusinessSettings);
  const isLoading = useAppSelector(selectBusinessSettingsLoading);
  const error = useAppSelector(selectBusinessSettingsError);

  // Tracks whether a fetch has been dispatched — prevents retry loops on failure.
  const fetchAttemptedRef = useRef(false);

  // Effect: Update cache when settings first arrive from API.
  useEffect(() => {
    if (!businessSettings) return;

    const currentData = {
      businessName: businessSettings.businessName,
      logoBusinessUrl: businessSettings.logoBusiness?.sm,
      taxPercentage: businessSettings.taxPercentage ?? undefined,
    };

    const cachedColors = getCachedThemeColors(businessSettings.businessId);
    if (hasThemeChanged(cachedColors, currentData)) {
      cacheThemeColors(businessSettings.businessId, currentData);
    }
  }, [businessSettings]);

  // Effect: Fetch business settings exactly once on public storefront routes only.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const isPublicPath = !path.startsWith("/admin") && path !== "/login";
      if (!isPublicPath) {
        return;
      }
    }

    if (
      businessSettings ||
      isLoading ||
      fetchAttemptedRef.current
    ) {
      return;
    }
    fetchAttemptedRef.current = true;
    dispatch(fetchBusinessSettingsThunk());
  }, [dispatch, businessSettings, isLoading]);
}
