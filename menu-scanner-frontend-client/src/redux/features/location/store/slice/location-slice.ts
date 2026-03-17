import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LocationState } from "../models/type/location-type";
import {
  fetchAllLocationsService,
  createLocationService,
  updateLocationService,
  deleteLocationService,
  fetchDefaultLocationService,
} from "../thunks/location-thunks";

const initialState: LocationState = {
  data: null,
  locations: [],
  defaultLocation: null,
  isLoading: false,
  error: null,
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  },
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    clearLocationError: (state) => {
      state.error = null;
    },
    resetLocationState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchAllLocationsService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllLocationsService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.locations = action.payload?.content || [];
      })
      .addCase(fetchAllLocationsService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to fetch locations";
      });

    // Create
    builder
      .addCase(createLocationService.pending, (state) => {
        state.operations.isCreating = true;
        state.error = null;
      })
      .addCase(createLocationService.fulfilled, (state, action) => {
        state.operations.isCreating = false;
        const newLocation = action.payload;
        // If new location is primary, remove primary from others
        if (newLocation.isPrimary || newLocation.isDefault) {
          state.locations = state.locations.map((loc) => ({
            ...loc,
            isPrimary: false,
            isDefault: false,
          }));
        }
        state.locations = [newLocation, ...state.locations];
      })
      .addCase(createLocationService.rejected, (state, action) => {
        state.operations.isCreating = false;
        state.error = (action.payload as string) || "Failed to create location";
      });

    // Update
    builder
      .addCase(updateLocationService.pending, (state) => {
        state.operations.isUpdating = true;
        state.error = null;
      })
      .addCase(updateLocationService.fulfilled, (state, action) => {
        state.operations.isUpdating = false;
        const updated = action.payload;
        if (updated.isPrimary || updated.isDefault) {
          state.locations = state.locations.map((loc) => ({
            ...loc,
            isPrimary: loc.id === updated.id,
            isDefault: loc.id === updated.id,
          }));
        }
        state.locations = state.locations.map((loc) =>
          loc.id === updated.id ? updated : loc
        );
      })
      .addCase(updateLocationService.rejected, (state, action) => {
        state.operations.isUpdating = false;
        state.error = (action.payload as string) || "Failed to update location";
      });

    // Delete
    builder
      .addCase(deleteLocationService.pending, (state) => {
        state.operations.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteLocationService.fulfilled, (state, action) => {
        state.operations.isDeleting = false;
        const deleted = action.payload;
        state.locations = state.locations.filter(
          (loc) => loc.id !== deleted.id
        );
      })
      .addCase(deleteLocationService.rejected, (state, action) => {
        state.operations.isDeleting = false;
        state.error = (action.payload as string) || "Failed to delete location";
      });

    // Fetch default
    builder
      .addCase(fetchDefaultLocationService.fulfilled, (state, action) => {
        state.defaultLocation = action.payload;
      });
  },
});

export const { clearLocationError, resetLocationState } = locationSlice.actions;
export default locationSlice.reducer;
