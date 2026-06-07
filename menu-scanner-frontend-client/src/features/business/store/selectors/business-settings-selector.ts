import { RootState } from "@/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectBusinessSettings = (state: RootState) => state.businessSettings.data;
export const selectBusinessSettingsLoading = (state: RootState) => state.businessSettings.isLoading;
export const selectBusinessSettingsError = (state: RootState) => state.businessSettings.error;


export const selectBusinessName = (state: RootState) =>
  state.businessSettings.data?.businessName;

export const selectBusinessLogo = (state: RootState) =>
  state.businessSettings.data?.logoBusiness?.sm;


export const selectBusinessColors = createSelector(
  (state: RootState) => state.businessSettings.data?.primaryColor,
  (primaryColor) => ({


    primary: primaryColor,
  })
);

export const selectLowStockThreshold = (state: RootState) =>
  state.businessSettings.data?.lowStockThreshold ?? 5;
