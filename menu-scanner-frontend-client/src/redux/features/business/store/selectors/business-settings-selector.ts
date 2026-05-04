import { RootState } from "@/redux/store";
import { businessSettingsStorage } from "@/utils/storage/business-settings-storage";

// Helper to get cached settings (instant, no Redux delay)
const getCachedSettings = () => {
  try {
    return businessSettingsStorage.getCached()?.data || null;
  } catch {
    return null;
  }
};

export const selectBusinessSettings = (state: RootState) => state.businessSettings.data;
export const selectBusinessSettingsLoading = (state: RootState) => state.businessSettings.isLoading;
export const selectBusinessSettingsError = (state: RootState) => state.businessSettings.error;

// Load from cache for instant results (no Redux delay)
export const selectBusinessName = (state: RootState) => {
  const cached = getCachedSettings();
  return cached?.businessName || "Menu Scanner";
};

// Load from cache for instant results (no Redux delay)
export const selectBusinessLogo = (state: RootState) => {
  const cached = getCachedSettings();
  return cached?.logoBusinessUrl || null;
};

// Load from cache for instant results (no Redux delay)
export const selectBusinessColors = (state: RootState) => {
  const cached = getCachedSettings();
  return {
    primary: cached?.primaryColor || "#3b82f6",
  };
};
