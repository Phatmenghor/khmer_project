import { RootState } from "@/redux/store";
import defaultSettings from "@/constants/defaults/business-settings-default.json";

export const selectBusinessSettings = (state: RootState) => {
  return state.businessSettings.data || (defaultSettings as any);
};

export const selectBusinessSettingsLoading = (state: RootState) => {
  return state.businessSettings.isLoading;
};

export const selectBusinessSettingsError = (state: RootState) => {
  return state.businessSettings.error;
};

export const selectBusinessPrimaryColor = (state: RootState) => {
  return state.businessSettings.data?.primaryColor || defaultSettings.primaryColor;
};

export const selectBusinessSecondaryColor = (state: RootState) => {
  return state.businessSettings.data?.secondaryColor || defaultSettings.secondaryColor;
};

export const selectBusinessAccentColor = (state: RootState) => {
  return state.businessSettings.data?.accentColor || defaultSettings.accentColor;
};

export const selectBusinessLogo = (state: RootState) => {
  return state.businessSettings.data?.logoBusinessUrl || defaultSettings.logoBusinessUrl;
};

export const selectBusinessName = (state: RootState) => {
  return state.businessSettings.data?.businessName || defaultSettings.businessName;
};

export const selectBusinessTaxPercentage = (state: RootState) => {
  return state.businessSettings.data?.taxPercentage ?? defaultSettings.taxPercentage;
};
