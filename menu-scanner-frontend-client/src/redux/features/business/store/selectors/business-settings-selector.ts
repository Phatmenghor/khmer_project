import { RootState } from "@/redux/store";

export const selectBusinessSettings = (state: RootState) => state.businessSettings.data;
export const selectBusinessSettingsLoading = (state: RootState) => state.businessSettings.isLoading;
export const selectBusinessSettingsError = (state: RootState) => state.businessSettings.error;

// No defaults - return from data only
// Will be blank until cache/API loads data
// Same pattern as primary color (blank until set)
export const selectBusinessName = (state: RootState) =>
  state.businessSettings.data?.businessName;

export const selectBusinessLogo = (state: RootState) =>
  state.businessSettings.data?.logoBusinessUrl;

export const selectBusinessColors = (state: RootState) => ({
  // No default fallback - blank until cache/API loads
  // Will be applied by sync script from localStorage or API
  primary: state.businessSettings.data?.primaryColor,
});
