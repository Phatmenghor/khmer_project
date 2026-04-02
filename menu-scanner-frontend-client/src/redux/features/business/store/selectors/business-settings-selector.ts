import { RootState } from "@/redux/store";

export const selectBusinessSettings = (state: RootState) => state.businessSettings.data;
export const selectBusinessSettingsLoading = (state: RootState) => state.businessSettings.isLoading;
export const selectBusinessSettingsError = (state: RootState) => state.businessSettings.error;

export const selectBusinessName = (state: RootState) =>
  state.businessSettings.data?.businessName || "Emenu Scanner";

export const selectBusinessLogo = (state: RootState) =>
  state.businessSettings.data?.logoBusinessUrl || null;

export const selectBusinessColors = (state: RootState) => ({
  primary: state.businessSettings.data?.primaryColor || "#57823D",
  secondary: state.businessSettings.data?.secondaryColor || "#404040",
  accent: state.businessSettings.data?.accentColor || "#2E74D0",
});
