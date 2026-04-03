import { RootState } from "@/redux/store";

export const selectBusinessSettings = (state: RootState) => state.businessSettings.data;
export const selectBusinessSettingsLoading = (state: RootState) => state.businessSettings.isLoading;
export const selectBusinessSettingsError = (state: RootState) => state.businessSettings.error;

export const selectBusinessName = (state: RootState) =>
  state.businessSettings.data?.businessName || "Emenu Scanner";

export const selectBusinessLogo = (state: RootState) =>
  state.businessSettings.data?.logoBusinessUrl || null;

export const selectBusinessColors = (state: RootState) => ({
  // Use business colors or fallback to defaults
  primary: state.businessSettings.data?.primaryColor || "#57823D",      // Green
  secondary: state.businessSettings.data?.secondaryColor || "#F4C430",   // Golden Yellow
  accent: state.businessSettings.data?.accentColor || "#F2F3F7",        // Light Grey
});
