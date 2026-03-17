import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectLocationState = (state: RootState) => state.location;

export const selectLocations = (state: RootState) =>
  state.location.locations;

export const selectLocationData = (state: RootState) => state.location.data;

export const selectDefaultLocation = (state: RootState) =>
  state.location.defaultLocation;

export const selectLocationIsLoading = (state: RootState) =>
  state.location.isLoading;

export const selectLocationError = (state: RootState) => state.location.error;

export const selectLocationOperations = (state: RootState) =>
  state.location.operations;

export const selectPrimaryLocation = createSelector(
  [selectLocations],
  (locations) =>
    locations.find((loc) => loc.isPrimary || loc.isDefault) || null
);

export const selectLocationCount = createSelector(
  [selectLocations],
  (locations) => locations.length
);
