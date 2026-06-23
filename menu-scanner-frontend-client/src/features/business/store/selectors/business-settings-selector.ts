import { RootState } from "@/store";

export const selectBusinessSettings = (state: RootState) => state.businessSettings.data;
export const selectBusinessSettingsLoading = (state: RootState) => state.businessSettings.isLoading;
export const selectBusinessSettingsError = (state: RootState) => state.businessSettings.error;


export const selectBusinessName = (state: RootState) =>
  state.businessSettings.data?.businessName;

export const selectBusinessLogo = (state: RootState) =>
  state.businessSettings.data?.logoBusiness?.sm;


export const selectLowStockThreshold = (state: RootState) =>
  state.businessSettings.data?.lowStockThreshold ?? 5;
