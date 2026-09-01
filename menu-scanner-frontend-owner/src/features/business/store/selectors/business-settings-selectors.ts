import { RootState } from "@/store";
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


export const selectBusinessLogo = (state: RootState) => {
  return state.businessSettings.data?.logoBusiness?.sm || (defaultSettings as any).logoBusinessUrl;
};

export const selectBusinessName = (state: RootState) => {
  return state.businessSettings.data?.businessName || defaultSettings.businessName;
};

export const selectBusinessTaxPercentage = (state: RootState) => {
  return state.businessSettings.data?.taxPercentage ?? defaultSettings.taxPercentage;
};
